"use client"

import Link from "next/link"
import {
  BookOpenText,
  Calculator,
  CheckCircle2,
  ClipboardList,
  Coins,
  Loader2,
  Printer,
  RotateCcw,
  Save,
  Scale,
  Sparkles,
  Wheat,
} from "lucide-react"
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { GAARI_FIELDS, PARTY_FIELDS } from "@/components/crud/entities"
import { RecordFormDialog } from "@/components/crud/record-form-dialog"
import { Field, FormSection } from "@/components/form-section"
import { JINSS_ICON } from "@/components/jinss"
import { Num, Raqam } from "@/components/num"
import { PageHeader } from "@/components/page-header"
import { ParchiSlip } from "@/components/print/parchi-slip"
import { usePrint } from "@/components/print/print-provider"
import { SearchableSelect, type SelectOption } from "@/components/searchable-select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToday } from "@/hooks/use-today"
import { hisaab, katautiFeesad, mannAurKilo, round, toNumber } from "@/lib/calc"
import { PARCHI_SELECT, type Gaari, type Jinss, type ParchiWithRelations, type Party, type TablesInsert } from "@/lib/database.types"
import { urduError } from "@/lib/errors"
import { JINSS_LABEL, JINSS_LIST, formatMann, formatTareekh, partyKaNaam } from "@/lib/format"
import { refreshAll, useGaariyan, useMills, useParties } from "@/lib/queries"
import { getSupabase } from "@/lib/supabaseClient"
import { cn } from "@/lib/utils"

type Draft = {
  jinss: Jinss
  tareekh: string
  kisanId: string | null
  gaariId: string | null
  millId: string | null
  kulKg: string
  khaliKg: string
  rate: string
  katauti: string
  /** منشی نے کٹوتی خود لکھی ہے (خودکار فیصد والی نہیں) */
  katautiManual: boolean
  remarks: string
}

const EMPTY_DRAFT: Draft = {
  jinss: "ganna",
  tareekh: "",
  kisanId: null,
  gaariId: null,
  millId: null,
  kulKg: "",
  khaliKg: "",
  rate: "",
  katauti: "",
  katautiManual: false,
  remarks: "",
}

const NO_MILL = "__none__"

type Errors = Partial<Record<"kisan" | "tareekh" | "kulKg" | "khaliKg" | "rate" | "katauti", string>>

export function WazanEntryForm() {
  const today = useToday()
  const { printSlip } = usePrint()
  const parties = useParties()
  const gaariyan = useGaariyan()
  const mills = useMills()

  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState<null | "save" | "print">(null)
  const [lastSaved, setLastSaved] = useState<ParchiWithRelations | null>(null)
  const [quickAdd, setQuickAdd] = useState<null | { kind: "kisan" | "gaari"; search: string }>(null)
  const kisanRef = useRef<HTMLButtonElement>(null)
  // ہر جنس کا ریٹ الگ — جنس بدلنے پر پچھلی جنس کا ریٹ نئی جنس پر نہ لگے
  const rateByJinss = useRef<Partial<Record<Jinss, string>>>({})

  // صفحہ چھپنے پر (Activity) ڈائیلاگ اور پرانا "محفوظ ہو گئی" کارڈ صاف — فارم کا ڈرافٹ باقی رہتا ہے
  useLayoutEffect(
    () => () => {
      setQuickAdd(null)
      setLastSaved(null)
    },
    [],
  )

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }))

  const selectedMill = mills.data?.find((m) => m.id === draft.millId) ?? null
  const feesad = katautiFeesad(selectedMill?.katauti_rule)

  // ---------------------------------------------------------- خودکار حساب
  const kulKg = toNumber(draft.kulKg)
  const khaliKg = toNumber(draft.khaliKg)
  const rate = toNumber(draft.rate)
  const khalisForAuto = Math.max(kulKg - khaliKg, 0)
  const autoKatauti = feesad !== null ? round(((khalisForAuto / 40) * feesad) / 100, 3) : null
  const katautiMann = draft.katautiManual || autoKatauti === null ? toNumber(draft.katauti) : autoKatauti
  const h = hisaab({ kulWazanKg: kulKg, khaliWazanKg: khaliKg, rate, katautiMann })
  const split = mannAurKilo(Math.max(h.khalisWazanKg, 0))

  const errors = useMemo<Errors>(() => {
    const e: Errors = {}
    if (!draft.kisanId) e.kisan = "کسان منتخب کریں"
    // date خانے کا max صرف کیلنڈر روکتا ہے، ہاتھ سے لکھی تاریخ نہیں
    if (draft.tareekh && today && draft.tareekh > today) e.tareekh = "آنے والی تاریخ درج نہیں ہو سکتی"
    if (!(kulKg > 0)) e.kulKg = "کل وزن لکھیں"
    if (khaliKg < 0) e.khaliKg = "درست وزن لکھیں"
    else if (kulKg > 0 && khaliKg >= kulKg) e.khaliKg = "خالی گاڑی کا وزن کل وزن سے کم ہونا چاہیے"
    if (rate < 0) e.rate = "درست ریٹ لکھیں"
    if (katautiMann < 0) e.katauti = "درست کٹوتی لکھیں"
    else if (katautiMann > 0 && katautiMann > h.wazanMann) e.katauti = "کٹوتی کل من سے زیادہ نہیں ہو سکتی"
    return e
  }, [draft.kisanId, draft.tareekh, today, kulKg, khaliKg, rate, katautiMann, h.wazanMann])

  const shownErrors: Errors = submitted ? errors : {}
  const hasData = Boolean(draft.kisanId || draft.kulKg || draft.khaliKg)

  // ---------------------------------------------------------- اختیارات
  const kisanOptions = useMemo<SelectOption[]>(
    () =>
      (parties.data ?? []).map((p) => ({
        value: p.id,
        label: p.naam,
        hint: [p.walid_ka_naam && `ولد ${p.walid_ka_naam}`, p.gaon].filter(Boolean).join(" · "),
        keywords: [p.mobile_number ?? "", p.qism ?? ""],
      })),
    [parties.data],
  )
  const gaariOptions = useMemo<SelectOption[]>(
    () =>
      (gaariyan.data ?? []).map((g) => ({
        value: g.id,
        label: g.gaari_number,
        hint: g.driver_ka_naam ?? undefined,
      })),
    [gaariyan.data],
  )

  function chooseMill(value: string) {
    const millId = value === NO_MILL ? null : value
    const mill = mills.data?.find((m) => m.id === millId)
    setDraft((d) => ({
      ...d,
      millId,
      rate: mill && mill.rate_per_mann > 0 ? String(mill.rate_per_mann) : d.rate,
      katautiManual: false,
    }))
  }

  /** جنس بدلیں: اس جنس کا پچھلا ریٹ، ورنہ مل کا ریٹ، ورنہ خالی */
  function chooseJinss(jinss: Jinss) {
    if (jinss === draft.jinss) return
    rateByJinss.current[draft.jinss] = draft.rate
    const millRate = selectedMill && selectedMill.rate_per_mann > 0 ? String(selectedMill.rate_per_mann) : undefined
    setDraft((d) => ({ ...d, jinss, rate: rateByJinss.current[jinss] ?? millRate ?? "" }))
  }

  // تیر والے بٹن (دائیں سے بائیں ترتیب: بائیں = اگلی جنس)
  function onJinssKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const step = ({ ArrowLeft: 1, ArrowDown: 1, ArrowRight: -1, ArrowUp: -1 } as Record<string, number>)[e.key]
    if (!step) return
    e.preventDefault()
    const i = JINSS_LIST.indexOf(draft.jinss)
    const next = JINSS_LIST[(i + step + JINSS_LIST.length) % JINSS_LIST.length]
    chooseJinss(next)
    e.currentTarget.querySelector<HTMLButtonElement>(`[data-jinss="${next}"]`)?.focus()
  }

  // ---------------------------------------------------------- محفوظ کریں
  const save = useCallback(
    async (andPrint: boolean) => {
      if (saving) return
      // فارم خالی ہو اور ابھی پرچی محفوظ ہوئی ہو تو "پرنٹ" اسی کو دوبارہ پرنٹ کرے
      if (andPrint && !hasData && lastSaved) {
        printSlip(<ParchiSlip parchi={lastSaved} />)
        return
      }
      setSubmitted(true)
      if (Object.keys(errors).length > 0) {
        toast.error("فارم مکمل کریں — سرخ خانے دیکھیں")
        return
      }
      if (!today && !draft.tareekh) return

      setSaving(andPrint ? "print" : "save")
      const payload: TablesInsert<"wazan_parchi"> = {
        tareekh: draft.tareekh || today,
        jinss: draft.jinss,
        kisan_id: draft.kisanId!,
        gaari_id: draft.gaariId,
        mill_id: draft.millId,
        kul_wazan_kg: kulKg,
        khali_gaari_wazan_kg: khaliKg,
        khalis_wazan_kg: h.khalisWazanKg,
        wazan_mann: h.wazanMann,
        fee_mann_rate: rate,
        kul_raqam: h.kulRaqam,
        mill_katauti_mann: katautiMann,
        final_raqam: h.finalRaqam,
        remarks: draft.remarks.trim() || null,
      }
      const { data, error } = await getSupabase().from("wazan_parchi").insert(payload).select(PARCHI_SELECT).single()
      setSaving(null)
      if (error) {
        toast.error(urduError(error))
        return
      }

      const saved = data as unknown as ParchiWithRelations
      setLastSaved(saved)
      toast.success(`پرچی نمبر ${saved.token_number} محفوظ ہو گئی — کھاتے میں جمع ہو گئی`)
      if (andPrint) printSlip(<ParchiSlip parchi={saved} />)

      // اگلی گاڑی کے لیے فارم تیار: جنس، تاریخ، مل اور ریٹ وہی رہیں
      setDraft((d) => ({
        ...EMPTY_DRAFT,
        jinss: d.jinss,
        tareekh: d.tareekh,
        millId: d.millId,
        rate: d.rate,
      }))
      setSubmitted(false)
      refreshAll()
      requestAnimationFrame(() => kisanRef.current?.focus())
    },
    [saving, hasData, lastSaved, errors, today, draft, kulKg, khaliKg, rate, katautiMann, h, printSlip],
  )

  // Ctrl+S محفوظ، Ctrl+P محفوظ + پرنٹ
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!(e.ctrlKey || e.metaKey)) return
      const key = e.key.toLowerCase()
      if (key === "s" || key === "p") {
        e.preventDefault()
        save(key === "p")
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [save])

  function reset() {
    setDraft((d) => ({ ...EMPTY_DRAFT, jinss: d.jinss, tareekh: d.tareekh, millId: d.millId, rate: d.rate }))
    setSubmitted(false)
  }

  const tareekh = draft.tareekh || today
  const JinssIcon = JINSS_ICON[draft.jinss]

  return (
    <>
      <PageHeader
        title="وزن اندراج"
        icon={Scale}
        description="نئی وزن پرچی — حساب خودکار، محفوظ ہوتے ہی کسان کے کھاتے میں جمع"
        actions={
          hasData && (
            <Button variant="ghost" onClick={reset}>
              <RotateCcw />
              فارم صاف کریں
            </Button>
          )
        }
      />

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          save(false)
        }}
        className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_24rem] lg:gap-5"
      >
        <div className="grid gap-4 lg:gap-5">
          {/* ------------------------------------------------ 1: جنس */}
          <FormSection title="جنس منتخب کریں" icon={Wheat} step={1}>
            {/* فارم کا کالم تنگ ہو (موبائل / حساب والے کالم کے ساتھ) تو چار چار، کھلا ہو تو ایک قطار میں ساتوں */}
            <div className="@container">
              <div
                role="radiogroup"
                aria-label="جنس"
                onKeyDown={onJinssKeyDown}
                className="grid grid-cols-4 gap-1.5 rounded-2xl bg-muted p-1.5 @xl:grid-cols-7"
              >
                {JINSS_LIST.map((j) => {
                  const Icon = JINSS_ICON[j]
                  const active = draft.jinss === j
                  return (
                    <button
                      key={j}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      tabIndex={active ? 0 : -1}
                      data-jinss={j}
                      onClick={() => chooseJinss(j)}
                      className={cn(
                        "flex h-16 flex-col items-center justify-center gap-0.5 rounded-xl text-base font-semibold transition-all",
                        active
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                          : "text-muted-foreground hover:bg-background/70 hover:text-foreground",
                      )}
                    >
                      <Icon className="size-5" />
                      <span className="leading-[1.7]">{JINSS_LABEL[j]}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </FormSection>

          {/* ------------------------------------------------ 2: بنیادی معلومات */}
          <FormSection title="پرچی کی معلومات" icon={ClipboardList} step={2}>
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="کسان / پارٹی" htmlFor="kisan" required error={shownErrors.kisan} className="sm:col-span-2 xl:col-span-1">
                  <SearchableSelect
                    triggerRef={kisanRef}
                    id="kisan"
                    options={kisanOptions}
                    value={draft.kisanId}
                    onChange={(v) => set("kisanId", v)}
                    placeholder="کسان تلاش کریں…"
                    searchPlaceholder="نام، ولدیت، گاؤں یا موبائل…"
                    emptyText="یہ کسان درج نہیں"
                    createLabel="نیا کسان شامل کریں"
                    onCreate={(search) => setQuickAdd({ kind: "kisan", search })}
                    loading={parties.isLoading}
                    invalid={Boolean(shownErrors.kisan)}
                  />
                </Field>
                <Field label="گاڑی" htmlFor="gaari" className="sm:col-span-2 xl:col-span-1">
                  <SearchableSelect
                    id="gaari"
                    options={gaariOptions}
                    value={draft.gaariId}
                    onChange={(v) => set("gaariId", v)}
                    placeholder="گاڑی نمبر منتخب کریں"
                    searchPlaceholder="گاڑی نمبر یا ڈرائیور…"
                    emptyText="یہ گاڑی درج نہیں"
                    createLabel="نئی گاڑی شامل کریں"
                    onCreate={(search) => setQuickAdd({ kind: "gaari", search })}
                    loading={gaariyan.isLoading}
                  />
                </Field>
                <Field
                  label="مل"
                  htmlFor="mill"
                  hint={selectedMill?.katauti_rule ? <>کٹوتی کا اصول: {selectedMill.katauti_rule}</> : undefined}
                >
                  <Select value={draft.millId ?? NO_MILL} onValueChange={chooseMill}>
                    <SelectTrigger id="mill" className="h-11! w-full">
                      <SelectValue placeholder="مل منتخب کریں" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_MILL}>بغیر مل</SelectItem>
                      {mills.data?.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.mill_ka_naam}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="تاریخ" htmlFor="tareekh" error={shownErrors.tareekh} hint={tareekh ? formatTareekh(tareekh) : undefined}>
                  <Input
                    id="tareekh"
                    type="date"
                    dir="ltr"
                    className="h-11 text-end"
                    value={tareekh}
                    max={today || undefined}
                    aria-invalid={Boolean(shownErrors.tareekh) || undefined}
                    onChange={(e) => set("tareekh", e.target.value === today ? "" : e.target.value)}
                  />
                </Field>
              </div>
            </div>
          </FormSection>

          {/* ------------------------------------------------ 2: وزن */}
          <FormSection title="وزن (کلو گرام)" icon={Scale} step={3}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="کل وزن (گاڑی سمیت)" htmlFor="kul" required error={shownErrors.kulKg}>
                <BigNumberInput id="kul" unit="کلو" value={draft.kulKg} onChange={(v) => set("kulKg", v)} invalid={Boolean(shownErrors.kulKg)} />
              </Field>
              <Field label="خالی گاڑی کا وزن" htmlFor="khali" error={shownErrors.khaliKg}>
                <BigNumberInput id="khali" unit="کلو" value={draft.khaliKg} onChange={(v) => set("khaliKg", v)} invalid={Boolean(shownErrors.khaliKg)} />
              </Field>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-secondary/70 p-3 text-secondary-foreground sm:grid-cols-3">
              <MiniStat label="خالص وزن">
                <Num format="kg" value={h.khalisWazanKg} /> <small>کلو</small>
              </MiniStat>
              <MiniStat label="وزن من میں">
                <Num format="mann" value={h.wazanMann} /> <small>من</small>
              </MiniStat>
              <MiniStat label="من / کلو" className="col-span-2 sm:col-span-1">
                <Num value={split.mann} /> <small>من</small> <Num format="kg" value={split.kilo} /> <small>کلو</small>
              </MiniStat>
            </div>
          </FormSection>

          {/* ------------------------------------------------ 3: ریٹ اور کٹوتی */}
          <FormSection title="ریٹ اور کٹوتی" icon={Coins} step={4}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label={`ریٹ فی من (${JINSS_LABEL[draft.jinss]})`}
                htmlFor="rate"
                error={shownErrors.rate}
                hint={selectedMill && selectedMill.rate_per_mann > 0 ? "ریٹ مل سے لیا گیا — بدل سکتے ہیں" : undefined}
              >
                <BigNumberInput id="rate" unit="روپے" value={draft.rate} onChange={(v) => set("rate", v)} invalid={Boolean(shownErrors.rate)} />
              </Field>
              <Field
                label="مل کٹوتی"
                htmlFor="katauti"
                error={shownErrors.katauti}
                hint={
                  autoKatauti !== null &&
                  (draft.katautiManual ? (
                    <button type="button" className="text-primary underline underline-offset-4" onClick={() => set("katautiManual", false)}>
                      خودکار کٹوتی ({feesad}%) دوبارہ لگائیں
                    </button>
                  ) : (
                    <span className="flex items-center gap-1 text-primary">
                      <Sparkles className="size-3.5" />
                      مل کے اصول ({feesad}%) سے خودکار
                    </span>
                  ))
                }
              >
                <BigNumberInput
                  id="katauti"
                  unit="من"
                  value={draft.katautiManual || autoKatauti === null ? draft.katauti : autoKatauti ? String(autoKatauti) : ""}
                  onChange={(v) => setDraft((d) => ({ ...d, katauti: v, katautiManual: true }))}
                  invalid={Boolean(shownErrors.katauti)}
                />
              </Field>
              <Field label="ریمارکس" htmlFor="remarks" className="sm:col-span-2">
                <Textarea
                  id="remarks"
                  rows={2}
                  value={draft.remarks}
                  onChange={(e) => set("remarks", e.target.value)}
                  placeholder="کوئی اضافی بات (اختیاری)"
                />
              </Field>
            </div>
          </FormSection>
        </div>

        {/* ------------------------------------------------ حساب (سائیڈ) */}
        <aside className="grid gap-4 lg:sticky lg:top-20">
          <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/8 shadow-sm">
            <div className="flex items-center gap-2.5 border-b px-4 py-3 sm:px-5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Calculator className="size-[1.1rem]" />
              </span>
              <h2 className="font-semibold">حساب</h2>
              <span className="ms-auto flex items-center gap-1 rounded-full bg-secondary px-2.5 text-xs text-secondary-foreground">
                <JinssIcon className="size-3.5" />
                {JINSS_LABEL[draft.jinss]}
              </span>
            </div>
            <dl className="grid gap-0.5 px-4 py-3 text-sm sm:px-5">
              <CalcRow label="خالص وزن">
                <Num format="kg" value={h.khalisWazanKg} /> کلو
              </CalcRow>
              <CalcRow label="وزن">
                <Num format="mann" value={h.wazanMann} /> من
              </CalcRow>
              <CalcRow label="ریٹ فی من">
                <Raqam value={rate} />
              </CalcRow>
              <CalcRow label="کل رقم" sub="من × ریٹ">
                <Raqam value={h.kulRaqam} />
              </CalcRow>
              <CalcRow label="مل کٹوتی" sub={katautiMann > 0 ? `${formatMann(katautiMann)} من × ریٹ` : undefined} negative={katautiMann > 0}>
                {katautiMann > 0 && "− "}
                <Raqam value={h.katautiRaqam} />
              </CalcRow>
            </dl>
            <div className="mx-3 mb-3 rounded-xl bg-primary p-4 text-primary-foreground sm:mx-4 sm:mb-4">
              <div className="text-sm text-primary-foreground/80">صافی رقم (کھاتے میں جمع)</div>
              <div className="text-3xl font-bold">
                <Raqam value={h.finalRaqam} unitClassName="text-base" />
              </div>
              <div className="mt-1 text-xs text-primary-foreground/75">(من − کٹوتی) × ریٹ</div>
            </div>
            <div className="hidden gap-2 border-t bg-muted/40 p-3 sm:p-4 lg:grid">
              <SaveButtons saving={saving} onSave={() => save(false)} onPrint={() => save(true)} />
              <p className="text-center text-xs text-muted-foreground">
                شارٹ کٹ: <kbd className="font-num">Ctrl+S</kbd> محفوظ · <kbd className="font-num">Ctrl+P</kbd> پرنٹ
              </p>
            </div>
          </div>

          {lastSaved && <LastSavedCard parchi={lastSaved} onPrint={() => printSlip(<ParchiSlip parchi={lastSaved} />)} />}
        </aside>

        {/* موبائل / ٹیبلٹ: نیچے چپکی ہوئی پٹی */}
        <div className="h-20 lg:hidden" aria-hidden />
        <div className="fixed inset-x-0 bottom-[calc(4.6rem+env(safe-area-inset-bottom))] z-20 px-3 lg:hidden print:hidden">
          <div className="mx-auto flex max-w-xl items-center gap-2 rounded-2xl bg-card/95 p-2 ring-1 ring-foreground/10 shadow-xl backdrop-blur-md">
            <div className="min-w-0 flex-1 ps-2">
              <div className="text-[0.7rem] leading-[1.6] text-muted-foreground">صافی رقم · {JINSS_LABEL[draft.jinss]}</div>
              <div className="truncate text-lg font-bold leading-[1.5] text-primary">
                <Raqam value={h.finalRaqam} unitClassName="text-xs" />
              </div>
            </div>
            <Button type="button" variant="outline" size="lg" className="px-3.5" onClick={() => save(true)} disabled={saving !== null} aria-label="پرنٹ پرچی">
              {saving === "print" ? <Loader2 className="animate-spin" /> : <Printer className="size-5" />}
              <span className="max-sm:sr-only">پرنٹ پرچی</span>
            </Button>
            <Button type="button" size="lg" className="px-4" onClick={() => save(false)} disabled={saving !== null}>
              {saving === "save" ? <Loader2 className="animate-spin" /> : <Save className="size-5" />}
              محفوظ کریں
            </Button>
          </div>
        </div>
      </form>

      <RecordFormDialog<Party>
        open={quickAdd?.kind === "kisan"}
        onOpenChange={(open) => !open && setQuickAdd(null)}
        table="parties"
        singular="کسان"
        fields={PARTY_FIELDS}
        prefill={{ naam: quickAdd?.search ?? "" }}
        onSaved={(row) => set("kisanId", row.id)}
      />
      <RecordFormDialog<Gaari>
        open={quickAdd?.kind === "gaari"}
        onOpenChange={(open) => !open && setQuickAdd(null)}
        table="gaariyan"
        singular="گاڑی"
        muannas
        fields={GAARI_FIELDS}
        prefill={{ gaari_number: quickAdd?.search ?? "" }}
        onSaved={(row) => set("gaariId", row.id)}
      />
    </>
  )
}

// ---------------------------------------------------------------- چھوٹے حصے

function BigNumberInput({
  id,
  unit,
  value,
  onChange,
  invalid,
}: {
  id: string
  unit: string
  value: string
  onChange: (v: string) => void
  invalid?: boolean
}) {
  return (
    <InputGroup className="h-14 rounded-xl bg-background">
      <InputGroupInput
        id={id}
        dir="ltr"
        inputMode="decimal"
        autoComplete="off"
        placeholder="0"
        value={value}
        aria-invalid={invalid || undefined}
        onChange={(e) => {
          const v = e.target.value.replace(/[^\d.]/g, "")
          if (/^\d*\.?\d*$/.test(v)) onChange(v)
        }}
        onFocus={(e) => e.currentTarget.select()}
        className="text-end font-num text-2xl font-semibold"
      />
      <InputGroupAddon align="inline-end" className="text-sm text-muted-foreground">
        {unit}
      </InputGroupAddon>
    </InputGroup>
  )
}

function MiniStat({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-lg bg-background/60 px-3 py-1.5", className)}>
      <div className="text-xs opacity-75">{label}</div>
      <div className="text-lg font-semibold [&_small]:text-xs [&_small]:font-normal [&_small]:opacity-75">{children}</div>
    </div>
  )
}

function CalcRow({ label, sub, negative, children }: { label: string; sub?: string; negative?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-dashed py-1.5 last:border-0">
      <dt>
        <div>{label}</div>
        {sub && <div className="text-[0.7rem] leading-[1.6] text-muted-foreground">{sub}</div>}
      </dt>
      <dd className={cn("font-semibold", negative && "text-destructive")}>{children}</dd>
    </div>
  )
}

function SaveButtons({ saving, onSave, onPrint }: { saving: null | "save" | "print"; onSave: () => void; onPrint: () => void }) {
  return (
    <>
      <Button type="button" size="lg" className="w-full text-base" disabled={saving !== null} onClick={onSave}>
        {saving === "save" ? <Loader2 className="animate-spin" /> : <Save className="size-5" />}
        محفوظ کریں
      </Button>
      <Button type="button" variant="outline" size="lg" className="w-full text-base" disabled={saving !== null} onClick={onPrint}>
        {saving === "print" ? <Loader2 className="animate-spin" /> : <Printer className="size-5" />}
        پرنٹ پرچی
      </Button>
    </>
  )
}

function LastSavedCard({ parchi, onPrint }: { parchi: ParchiWithRelations; onPrint: () => void }) {
  return (
    <div className="rounded-2xl bg-card p-4 ring-1 ring-primary/30 shadow-sm">
      <div className="flex items-center gap-2 text-primary">
        <CheckCircle2 className="size-5" />
        <span className="font-semibold">آخری محفوظ پرچی</span>
        <span className="ms-auto rounded-lg bg-primary/10 px-2 font-num text-lg font-bold">#{parchi.token_number}</span>
      </div>
      <div className="mt-2 text-sm">
        <div className="font-semibold">{partyKaNaam(parchi.kisan)}</div>
        <div className="text-muted-foreground">
          {JINSS_LABEL[parchi.jinss]} · <Num format="kg" value={parchi.khalis_wazan_kg} /> کلو · <Num format="mann" value={parchi.wazan_mann} /> من
        </div>
        <div className="mt-1">
          صافی رقم: <Raqam value={parchi.final_raqam} className="font-bold text-primary" />
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={onPrint}>
          <Printer />
          دوبارہ پرنٹ
        </Button>
        <Button asChild variant="ghost">
          <Link href={`/khata/${parchi.kisan_id}`}>
            <BookOpenText />
            کھاتہ دیکھیں
          </Link>
        </Button>
      </div>
    </div>
  )
}
