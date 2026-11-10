"use client"

import { FilePlus2, Loader2, Pencil, RotateCcw, Save, X } from "lucide-react"
import { useLayoutEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Field, FormSection } from "@/components/form-section"
import { Num, Raqam } from "@/components/num"
import { SearchableSelect, type SelectOption } from "@/components/searchable-select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { mannAurKilo, tarseelHisaab, toNumber } from "@/lib/calc"
import {
  MILL_TARSEEL_SELECT,
  type MillTarseelWithRelations,
  type TablesInsert,
} from "@/lib/database.types"
import { urduError } from "@/lib/errors"
import { formatMann, formatRaqam, formatTareekh, nisbatKaJumla, partyKaNaam } from "@/lib/format"
import { useGaariyan, useMills, useParties } from "@/lib/queries"
import { getSupabase } from "@/lib/supabaseClient"
import { cn } from "@/lib/utils"

type Draft = {
  partyId: string | null
  /** دستی لکھا کھاتہ دار (جب فہرست سے منتخب نہ ہو) */
  khataDaarNaam: string
  millId: string | null
  millNaam: string
  tareekh: string
  token: string
  gaari: string
  driver: string
  driverMobile: string
  builty: string
  permit: string
  variety: string
  kulKg: string
  katautiKg: string
  rate: string
  gaariKiraya: string
  millKiraya: string
  baqayaSaafiRaqam: string
  bank: string
  onlineRaqam: string
}

const EMPTY: Draft = {
  partyId: null,
  khataDaarNaam: "",
  millId: null,
  millNaam: "",
  tareekh: "",
  token: "",
  gaari: "",
  driver: "",
  driverMobile: "",
  builty: "",
  permit: "",
  variety: "",
  kulKg: "",
  katautiKg: "",
  rate: "",
  gaariKiraya: "",
  millKiraya: "",
  baqayaSaafiRaqam: "",
  bank: "",
  onlineRaqam: "",
}

/** اگلی گاڑی کے لیے: تاریخ، مل اور ریٹ وہی رہیں */
const nextDraft = (d: Draft): Draft => ({ ...EMPTY, tareekh: d.tareekh, millId: d.millId, millNaam: d.millNaam, rate: d.rate })

const str = (v: string | number | null | undefined) => (v === null || v === undefined ? "" : String(v))

function fromRecord(r: MillTarseelWithRelations): Draft {
  return {
    partyId: r.party_id,
    khataDaarNaam: r.khata_daar_naam,
    millId: r.mill_id,
    millNaam: r.mill_naam,
    tareekh: r.tareekh,
    token: str(r.token_number),
    gaari: str(r.gaari_number),
    driver: str(r.driver_naam),
    driverMobile: str(r.driver_mobile),
    builty: str(r.builty_adda),
    permit: str(r.permit_number),
    variety: str(r.variety),
    kulKg: str(r.kul_wazan_kg),
    katautiKg: Number(r.katauti_kg) ? str(r.katauti_kg) : "",
    rate: Number(r.rate) ? str(r.rate) : "",
    gaariKiraya: Number(r.gaari_kiraya) ? str(r.gaari_kiraya) : "",
    millKiraya: Number(r.mill_kiraya) ? str(r.mill_kiraya) : "",
    baqayaSaafiRaqam: Number(r.baqaya_saafi_raqam) ? str(r.baqaya_saafi_raqam) : "",
    bank: str(r.bank_naam),
    onlineRaqam: Number(r.online_raqam) ? str(r.online_raqam) : "",
  }
}

type Errors = Partial<Record<"khataDaar" | "mill" | "tareekh" | "kulKg" | "katautiKg" | "driverMobile", string>>

/** مل ترسیل کا فارم — نیا اندراج یا ترمیم۔ خانے اسی ترتیب میں جیسے شیٹ کے کالم */
export function TarseelForm({
  today,
  editing,
  onDoneEditing,
  onSaved,
}: {
  today: string
  editing: MillTarseelWithRelations | null
  onDoneEditing: () => void
  onSaved: () => void
}) {
  const parties = useParties()
  const mills = useMills()
  const gaariyan = useGaariyan()

  const [draft, setDraft] = useState<Draft>(EMPTY)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)

  // ترمیم شروع ہو تو ریکارڈ فارم میں — ترمیم ختم ہو تو فارم خالی (render کے دوران state بدلنا: React کا تجویز کردہ طریقہ)
  if ((editing?.id ?? null) !== editingId) {
    setEditingId(editing?.id ?? null)
    setDraft(editing ? fromRecord(editing) : (d) => nextDraft(d))
    setSubmitted(false)
  }

  // صفحہ چھپنے پر (Activity) غلطیوں کے پیغام صاف
  useLayoutEffect(() => () => setSubmitted(false), [])

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }))

  const tareekh = draft.tareekh || today
  const kulKg = toNumber(draft.kulKg)
  const katautiKg = toNumber(draft.katautiKg)
  const rate = toNumber(draft.rate)
  const baqayaSaafiRaqam = toNumber(draft.baqayaSaafiRaqam)
  const onlineRaqam = toNumber(draft.onlineRaqam)
  const h = tarseelHisaab({ kulWazanKg: kulKg, katautiKg, baqayaSaafiRaqam, onlineRaqam })
  const kulSplit = mannAurKilo(Math.max(kulKg, 0))

  const selectedParty = parties.data?.find((p) => p.id === draft.partyId) ?? null
  const selectedMill = mills.data?.find((m) => m.id === draft.millId) ?? null
  const khataDaar = selectedParty ? partyKaNaam(selectedParty) : draft.khataDaarNaam.trim()
  const millNaam = selectedMill ? selectedMill.mill_ka_naam : draft.millNaam.trim()

  const errors: Errors = {}
  if (!khataDaar) errors.khataDaar = "کھاتہ دار منتخب کریں یا نام لکھیں"
  if (!millNaam) errors.mill = "شوگر مل منتخب کریں یا نام لکھیں"
  if (tareekh && today && tareekh > today) errors.tareekh = "آنے والی تاریخ درج نہیں ہو سکتی"
  if (!(kulKg > 0)) errors.kulKg = "کل وزن لکھیں"
  if (katautiKg < 0) errors.katautiKg = "درست کٹوتی لکھیں"
  else if (kulKg > 0 && katautiKg > kulKg) errors.katautiKg = "کٹوتی کل وزن سے زیادہ نہیں ہو سکتی"
  if (draft.driverMobile.trim() && !/^[0-9+\-\s]{7,15}$/.test(draft.driverMobile.trim()))
    errors.driverMobile = "درست موبائل نمبر لکھیں"
  const shown: Errors = submitted ? errors : {}

  const partyOptions = useMemo<SelectOption[]>(
    () =>
      (parties.data ?? []).map((p) => ({
        value: p.id,
        label: p.naam,
        hint: [`کھاتہ نمبر ${p.khata_number}`, nisbatKaJumla(p), p.gaon].filter(Boolean).join(" · "),
        keywords: [String(p.khata_number), `#${p.khata_number}`, p.mobile_number ?? "", p.mobile_number_2 ?? ""],
      })),
    [parties.data],
  )
  const millOptions = useMemo<SelectOption[]>(
    () => (mills.data ?? []).map((m) => ({ value: m.id, label: m.mill_ka_naam, hint: m.katauti_rule ?? undefined })),
    [mills.data],
  )

  function chooseGaari(value: string) {
    // درج گاڑی نمبر لکھا جائے تو ڈرائیور کا نام خود (اگر خالی ہو)
    const g = gaariyan.data?.find((x) => x.gaari_number.trim().toLowerCase() === value.trim().toLowerCase())
    setDraft((d) => ({ ...d, gaari: value, driver: d.driver || g?.driver_ka_naam || "" }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (saving) return
    setSubmitted(true)
    if (Object.keys(errors).length > 0) {
      toast.error("فارم مکمل کریں — سرخ خانے دیکھیں")
      return
    }
    const text = (v: string) => v.trim() || null
    const payload: TablesInsert<"mill_tarseel"> = {
      tareekh,
      // فہرست ابھی لوڈ نہ ہوئی ہو تب بھی منتخب پارٹی / مل کا ربط نہ ٹوٹے
      party_id: draft.partyId,
      khata_daar_naam: khataDaar,
      mill_id: draft.millId,
      mill_naam: millNaam,
      token_number: text(draft.token),
      gaari_number: text(draft.gaari),
      driver_naam: text(draft.driver),
      driver_mobile: text(draft.driverMobile),
      builty_adda: text(draft.builty),
      permit_number: text(draft.permit),
      variety: text(draft.variety),
      kul_wazan_kg: kulKg,
      katauti_kg: katautiKg,
      rate,
      gaari_kiraya: toNumber(draft.gaariKiraya),
      mill_kiraya: toNumber(draft.millKiraya),
      baqaya_saafi_raqam: baqayaSaafiRaqam,
      bank_naam: text(draft.bank),
      online_raqam: onlineRaqam,
    }
    setSaving(true)
    const table = getSupabase().from("mill_tarseel")
    const { data, error } = editing
      ? await table.update(payload).eq("id", editing.id).select(MILL_TARSEEL_SELECT).single()
      : await table.insert(payload).select(MILL_TARSEEL_SELECT).single()
    setSaving(false)
    if (error) {
      toast.error(urduError(error))
      return
    }
    const number = (data as unknown as MillTarseelWithRelations).tarseel_number
    toast.success(editing ? `ترسیل نمبر ${number} اپ ڈیٹ ہو گیا` : `ترسیل نمبر ${number} محفوظ ہو گیا — شیٹ میں شامل`)
    setSubmitted(false)
    if (editing) onDoneEditing()
    else setDraft(nextDraft)
    onSaved()
  }

  return (
    <FormSection
      title={editing ? `ترسیل نمبر ${editing.tarseel_number} میں ترمیم کریں` : "نیا اندراج"}
      icon={editing ? Pencil : FilePlus2}
      className={cn("@container print:hidden", editing && "ring-2 ring-primary/40")}
      action={
        editing ? (
          <Button type="button" variant="ghost" onClick={onDoneEditing}>
            <X />
            منسوخ کریں
          </Button>
        ) : (
          <Button type="button" variant="ghost" onClick={() => (setDraft(nextDraft), setSubmitted(false))}>
            <RotateCcw />
            فارم صاف کریں
          </Button>
        )
      }
    >
      <form noValidate onSubmit={submit} className="grid gap-4">
        <div className="grid gap-4 @md:grid-cols-2 @3xl:grid-cols-3 @5xl:grid-cols-4">
          {/* 1 */}
          <Field label="کھاتہ دار" htmlFor="t-khata" required error={shown.khataDaar} className="@md:col-span-2 @5xl:col-span-2">
            <SearchableSelect
              id="t-khata"
              options={partyOptions}
              value={draft.partyId}
              onChange={(v) => setDraft((d) => ({ ...d, partyId: v, khataDaarNaam: "" }))}
              freeText={selectedParty ? null : draft.khataDaarNaam || null}
              placeholder="کھاتے سے منتخب کریں یا نیا نام لکھیں…"
              searchPlaceholder="کھاتہ نمبر، نام یا موبائل — یا نیا نام لکھیں"
              emptyText="یہ نام کھاتوں میں نہیں — نیچے سے دستی لکھیں"
              createLabel="دستی نام لکھیں"
              createNeedsSearch
              onCreate={(s) => setDraft((d) => ({ ...d, partyId: null, khataDaarNaam: s.trim() }))}
              loading={parties.isLoading}
              invalid={Boolean(shown.khataDaar)}
            />
          </Field>
          {/* 2 */}
          <Field label="شوگر مل" htmlFor="t-mill" required error={shown.mill} className="@md:col-span-2 @3xl:col-span-1 @5xl:col-span-2">
            <SearchableSelect
              id="t-mill"
              options={millOptions}
              value={draft.millId}
              onChange={(v) => setDraft((d) => ({ ...d, millId: v, millNaam: "" }))}
              freeText={selectedMill ? null : draft.millNaam || null}
              placeholder="مل منتخب کریں یا نام لکھیں…"
              searchPlaceholder="مل کا نام — یا نیا نام لکھیں"
              emptyText="یہ مل فہرست میں نہیں — نیچے سے دستی لکھیں"
              createLabel="دستی نام لکھیں"
              createNeedsSearch
              onCreate={(s) => setDraft((d) => ({ ...d, millId: null, millNaam: s.trim() }))}
              loading={mills.isLoading}
              invalid={Boolean(shown.mill)}
            />
          </Field>
          {/* 3 */}
          <Field label="تاریخ" htmlFor="t-tareekh" required error={shown.tareekh} hint={tareekh ? formatTareekh(tareekh) : undefined}>
            <Input
              id="t-tareekh"
              type="date"
              dir="ltr"
              className="h-11 text-end"
              value={tareekh}
              max={today || undefined}
              aria-invalid={Boolean(shown.tareekh) || undefined}
              onChange={(e) => set("tareekh", e.target.value === today ? "" : e.target.value)}
            />
          </Field>
          {/* 4 */}
          <Field label="ٹوکن نمبر" htmlFor="t-token" hint="حروف، ہندسے اور نشان سب لکھ سکتے ہیں">
            <CodeInput id="t-token" value={draft.token} onChange={(v) => set("token", v)} placeholder="مثلاً: A-1234/25" />
          </Field>
          {/* 5 */}
          <Field label="گاڑی نمبر" htmlFor="t-gaari">
            <CodeInput id="t-gaari" value={draft.gaari} onChange={chooseGaari} placeholder="مثلاً: RYK-1234" list="t-gaari-list" />
            <datalist id="t-gaari-list">
              {gaariyan.data?.map((g) => (
                <option key={g.id} value={g.gaari_number} />
              ))}
            </datalist>
          </Field>
          {/* 6 */}
          <Field label="ڈرائیور کا نام" htmlFor="t-driver">
            <Input id="t-driver" className="h-11" autoComplete="off" value={draft.driver} onChange={(e) => set("driver", e.target.value)} placeholder="مثلاً: محمد اسلم" />
          </Field>
          {/* 7 */}
          <Field label="ڈرائیور کا موبائل نمبر" htmlFor="t-driver-mobile" error={shown.driverMobile}>
            <Input
              id="t-driver-mobile"
              type="tel"
              inputMode="tel"
              dir="ltr"
              className="h-11 text-end"
              autoComplete="off"
              value={draft.driverMobile}
              aria-invalid={Boolean(shown.driverMobile) || undefined}
              onChange={(e) => set("driverMobile", e.target.value)}
              placeholder="03001234567"
            />
          </Field>
          {/* 8 */}
          <Field label="بلٹی / اڈا" htmlFor="t-builty" hint="جہاں سے گاڑی / ٹرالی کرائے پر لی">
            <Input id="t-builty" className="h-11" autoComplete="off" value={draft.builty} onChange={(e) => set("builty", e.target.value)} placeholder="مثلاً: لیاقت پور اڈا" />
          </Field>
          {/* 9 */}
          <Field label="پرمٹ نمبر" htmlFor="t-permit">
            <CodeInput id="t-permit" value={draft.permit} onChange={(v) => set("permit", v)} placeholder="مثلاً: P-55/2026" />
          </Field>
          {/* 10 */}
          <Field label="ورائٹی" htmlFor="t-variety">
            <Input id="t-variety" dir="auto" className="h-11" autoComplete="off" value={draft.variety} onChange={(e) => set("variety", e.target.value)} placeholder="مثلاً: CPF-246" />
          </Field>
          {/* 11 */}
          <Field label="کل وزن" htmlFor="t-kul" required error={shown.kulKg}>
            <NumInput id="t-kul" unit="کلو" value={draft.kulKg} onChange={(v) => set("kulKg", v)} invalid={Boolean(shown.kulKg)} />
          </Field>
          {/* 12 */}
          <Field label="من / کلو" htmlFor="t-mann" hint="کل وزن — 40 کلو کا ایک من">
            <Readout id="t-mann">
              <Num value={kulSplit.mann} /> <small>من</small> <Num format="kg" value={kulSplit.kilo} /> <small>کلو</small>
            </Readout>
          </Field>
          {/* 13 */}
          <Field label="کٹوتی" htmlFor="t-katauti" error={shown.katautiKg}>
            <NumInput id="t-katauti" unit="کلو" value={draft.katautiKg} onChange={(v) => set("katautiKg", v)} invalid={Boolean(shown.katautiKg)} />
          </Field>
          {/* 14 */}
          <Field label="صافی وزن" htmlFor="t-saafi" hint={h.saafiWazanKg > 0 ? `${formatMann(h.saafiMann)} من` : "کل وزن − کٹوتی"}>
            <Readout id="t-saafi">
              <Num format="kg" value={Math.max(h.saafiWazanKg, 0)} /> <small>کلو</small>
            </Readout>
          </Field>
          {/* 15 */}
          <Field label="ریٹ (فی من)" htmlFor="t-rate">
            <NumInput id="t-rate" unit="روپے" value={draft.rate} onChange={(v) => set("rate", v)} />
          </Field>
          {/* 16 */}
          <Field label="گاڑی کرایہ" htmlFor="t-gaari-kiraya">
            <NumInput id="t-gaari-kiraya" unit="روپے" value={draft.gaariKiraya} onChange={(v) => set("gaariKiraya", v)} />
          </Field>
          {/* 17 */}
          <Field label="کرایہ مل" htmlFor="t-mill-kiraya">
            <NumInput id="t-mill-kiraya" unit="روپے" value={draft.millKiraya} onChange={(v) => set("millKiraya", v)} />
          </Field>
          {/* 18 */}
          <Field
            label="بقایا صافی رقم"
            htmlFor="t-baqaya-saafi"
            hint={h.saafiMann > 0 && rate > 0 ? `یاد دہانی: صافی وزن × ریٹ = ${formatRaqam(h.saafiMann * rate)} روپے` : "ہاتھ سے لکھیں"}
          >
            <NumInput id="t-baqaya-saafi" unit="روپے" value={draft.baqayaSaafiRaqam} onChange={(v) => set("baqayaSaafiRaqam", v)} />
          </Field>
          {/* 19 */}
          <Field label="بینک کا نام" htmlFor="t-bank">
            <Input id="t-bank" dir="auto" className="h-11" autoComplete="off" value={draft.bank} onChange={(e) => set("bank", e.target.value)} placeholder="مثلاً: حبیب بینک" />
          </Field>
          {/* 20 */}
          <Field label="آن لائن رقم" htmlFor="t-online">
            <NumInput id="t-online" unit="روپے" value={draft.onlineRaqam} onChange={(v) => set("onlineRaqam", v)} />
          </Field>
          {/* 21 */}
          <Field label="بقایا جات" htmlFor="t-baqaya-jaat" hint="بقایا صافی رقم − آن لائن رقم">
            <Readout id="t-baqaya-jaat" className={cn(h.baqayaJaat < 0 && "text-destructive")}>
              <Raqam value={h.baqayaJaat} />
            </Readout>
          </Field>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
          {editing && (
            <Button type="button" variant="outline" size="lg" onClick={onDoneEditing} disabled={saving}>
              منسوخ کریں
            </Button>
          )}
          <Button type="submit" size="lg" className="min-w-40 text-base" disabled={saving}>
            {saving ? <Loader2 className="animate-spin" /> : <Save className="size-5" />}
            {editing ? "ترمیم محفوظ کریں" : "محفوظ کریں"}
          </Button>
        </div>
      </form>
    </FormSection>
  )
}

// ---------------------------------------------------------------- چھوٹے حصے

/** ٹوکن / گاڑی / پرمٹ — ہر قسم کے حروف، بائیں سے دائیں */
function CodeInput({
  id,
  value,
  onChange,
  placeholder,
  list,
}: {
  id: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  list?: string
}) {
  return (
    <Input
      id={id}
      dir="ltr"
      list={list}
      autoComplete="off"
      spellCheck={false}
      className="h-11 text-end font-num"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  )
}

function NumInput({
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
    <InputGroup className="h-11">
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
        className="text-end font-num text-base font-semibold"
      />
      <InputGroupAddon align="inline-end" className="text-sm text-muted-foreground">
        {unit}
      </InputGroupAddon>
    </InputGroup>
  )
}

/** خودکار حساب والا خانہ (صرف پڑھنے کے لیے) */
function Readout({ id, className, children }: { id: string; className?: string; children: React.ReactNode }) {
  return (
    <output
      id={id}
      aria-live="polite"
      className={cn(
        "flex h-11 items-center justify-end gap-1 rounded-lg bg-secondary px-3 font-semibold text-secondary-foreground [&_small]:text-xs [&_small]:font-normal [&_small]:opacity-75",
        className,
      )}
    >
      {children}
    </output>
  )
}
