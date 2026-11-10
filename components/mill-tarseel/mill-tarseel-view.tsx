"use client"

import { FileSpreadsheet, FilterX, Printer, Search } from "lucide-react"
import { useDeferredValue, useLayoutEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import useSWR from "swr"
import { EmptyState, ErrorState } from "@/components/empty-state"
import { TarseelForm } from "@/components/mill-tarseel/tarseel-form"
import { TarseelSheet, khataDaarKaNaam, millKaNaam, tarseelSearchText } from "@/components/mill-tarseel/tarseel-sheet"
import { Num } from "@/components/num"
import { PageHeader } from "@/components/page-header"
import { SearchableSelect, type SelectOption } from "@/components/searchable-select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToday } from "@/hooks/use-today"
import { BUSINESS } from "@/lib/config"
import { MILL_TARSEEL_SELECT, type MillTarseelWithRelations } from "@/lib/database.types"
import { urduError } from "@/lib/errors"
import { addDays, formatTareekh, monthStart } from "@/lib/format"
import { MILL_REGISTER_PAGE, usePrintPage } from "@/lib/print-page"
import { fetchAll, getSupabase } from "@/lib/supabaseClient"
import { cn } from "@/lib/utils"

type Row = MillTarseelWithRelations

const ALL = "__all__"

type Adaigi = "all" | "baqaya" | "ada"
const ADAIGI_LABEL: Record<Adaigi, string> = { all: "سب", baqaya: "صرف بقایا والے", ada: "پوری ادا شدہ" }

/** سب فلٹر اختیاری — کچھ منتخب نہ ہو تو پورا ریکارڈ */
type Filters = {
  from: string
  to: string
  /** کھاتہ دار: "p:<party id>" یا "n:<دستی نام>" */
  khataDaar: string | null
  /** منتخب کھاتہ دار کا نام — تاریخ بدلنے سے فہرست میں نہ رہے تو بھی بٹن پر دکھے */
  khataDaarLabel: string
  mill: string
  builty: string
  bank: string
  variety: string
  adaigi: Adaigi
}

const NO_FILTERS: Filters = {
  from: "",
  to: "",
  khataDaar: null,
  khataDaarLabel: "",
  mill: ALL,
  builty: ALL,
  bank: ALL,
  variety: ALL,
  adaigi: "all",
}

const khataDaarKey = (r: Row) => (r.party_id ? `p:${r.party_id}` : `n:${r.khata_daar_naam.trim()}`)

/** ڈیٹا میں موجود الگ الگ قیمتیں (فلٹر کی فہرست کے لیے) */
function distinct(rows: Row[], pick: (r: Row) => string | null) {
  return [...new Set(rows.map((r) => pick(r)?.trim()).filter((v): v is string => Boolean(v)))].sort((a, b) => a.localeCompare(b, "ur"))
}

/** مل ترسیل رجسٹر: اوپر فارم، پھر رپورٹ کے فلٹر، نیچے ایکسل جیسی شیٹ — پرنٹ A4 افقی (landscape) */
export function MillTarseelView() {
  const today = useToday()
  usePrintPage(MILL_REGISTER_PAGE)
  const [f, setF] = useState<Filters>(NO_FILTERS)
  const [search, setSearch] = useState("")
  const q = useDeferredValue(search.trim().toLowerCase())
  const [editing, setEditing] = useState<Row | null>(null)
  const formRef = useRef<HTMLDivElement>(null)

  // صفحہ چھپنے پر (Activity) ادھوری ترمیم بند
  useLayoutEffect(() => () => setEditing(null), [])

  const setFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => setF((prev) => ({ ...prev, [key]: value }))

  // تاریخ کی حد ڈیٹا بیس میں لگتی ہے، باقی فلٹر اسی ڈیٹا پر
  const { data, error, mutate } = useSWR(["mill-tarseel", f.from, f.to], async ([, from, to]) =>
    (await fetchAll((start, end) => {
      let query = getSupabase().from("mill_tarseel").select(MILL_TARSEEL_SELECT)
      if (from) query = query.gte("tareekh", from)
      if (to) query = query.lte("tareekh", to)
      // ترسیل نمبر کی ترتیب سے: اوپر 1، پھر 2، 3 … (پرانی تاریخ بعد میں درج ہو تو بھی اپنے نمبر پر)
      return query.order("tarseel_number", { ascending: true }).range(start, end)
    })) as unknown as Row[],
  )

  const options = useMemo(() => {
    const all = data ?? []
    const khataDaar = new Map<string, SelectOption>()
    for (const r of all) {
      const key = khataDaarKey(r)
      if (!khataDaar.has(key))
        khataDaar.set(key, {
          value: key,
          label: khataDaarKaNaam(r),
          hint: r.party ? `کھاتہ نمبر ${r.party.khata_number}` : "دستی نام",
          keywords: r.party ? [String(r.party.khata_number), `#${r.party.khata_number}`] : [],
        })
    }
    return {
      khataDaar: [...khataDaar.values()].sort((a, b) => a.label.localeCompare(b.label, "ur")),
      mill: distinct(all, millKaNaam),
      builty: distinct(all, (r) => r.builty_adda),
      bank: distinct(all, (r) => r.bank_naam),
      variety: distinct(all, (r) => r.variety),
    }
  }, [data])

  // «#12» لکھیں تو صرف ترسیل نمبر 12؛ باقی ہر لفظ پوری قطار میں تلاش
  const numberQ = /^#\d+$/.test(q) ? q.slice(1) : null
  const rows = useMemo(
    () =>
      (data ?? []).filter(
        (r) =>
          (!f.khataDaar || khataDaarKey(r) === f.khataDaar) &&
          (f.mill === ALL || millKaNaam(r) === f.mill) &&
          (f.builty === ALL || r.builty_adda?.trim() === f.builty) &&
          (f.bank === ALL || r.bank_naam?.trim() === f.bank) &&
          (f.variety === ALL || r.variety?.trim() === f.variety) &&
          (f.adaigi === "all" || (f.adaigi === "baqaya" ? Number(r.baqaya_jaat) !== 0 : Number(r.baqaya_jaat) === 0)) &&
          (!q || (numberQ ? String(r.tarseel_number) === numberQ : tarseelSearchText(r).includes(q))),
      ),
    [data, f, q, numberQ],
  )

  // پرنٹ ہیڈر اور «فلٹر صاف کریں» کے لیے: کون سے فلٹر لگے ہیں
  const lagayFilter = [
    f.khataDaar && `کھاتہ دار: ${f.khataDaarLabel}`,
    f.mill !== ALL && `مل: ${f.mill}`,
    f.builty !== ALL && `بلٹی / اڈا: ${f.builty}`,
    f.bank !== ALL && `بینک: ${f.bank}`,
    f.variety !== ALL && `ورائٹی: ${f.variety}`,
    f.adaigi !== "all" && ADAIGI_LABEL[f.adaigi],
    q && `تلاش: ${search.trim()}`,
  ].filter(Boolean) as string[]
  const koiFilter = Boolean(f.from || f.to || lagayFilter.length)

  const presets: { label: string; from: string; to: string }[] = today
    ? [
        { label: "آج", from: today, to: today },
        { label: "کل", from: addDays(today, -1), to: addDays(today, -1) },
        { label: "پچھلے 7 دن", from: addDays(today, -6), to: today },
        { label: "یہ مہینہ", from: monthStart(today), to: today },
        { label: "تمام تاریخیں", from: "", to: "" },
      ]
    : []

  function edit(row: Row) {
    setEditing(row)
    requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }))
  }

  async function remove(row: Row) {
    const { error } = await getSupabase().from("mill_tarseel").delete().eq("id", row.id)
    if (error) {
      toast.error(urduError(error))
      throw error
    }
    toast.success("اندراج حذف ہو گیا")
    if (editing?.id === row.id) setEditing(null)
    await mutate()
  }

  function resetFilters() {
    setF(NO_FILTERS)
    setSearch("")
  }

  const muddat =
    f.from && f.to
      ? f.from === f.to
        ? formatTareekh(f.from)
        : `${formatTareekh(f.from)} تا ${formatTareekh(f.to)}`
      : f.from
        ? `${formatTareekh(f.from)} سے`
        : f.to
          ? `${formatTareekh(f.to)} تک`
          : "تمام تاریخیں"

  return (
    <div>
      {/* پرنٹ ہیڈر */}
      <div className="mb-3 hidden border-b-2 border-black pb-2 print:block">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xl font-bold">{BUSINESS.naam}</div>
            <div className="text-xs">{BUSINESS.pata}</div>
            {BUSINESS.phone && (
              <div className="text-xs">
                فون: <Num>{BUSINESS.phone}</Num>
              </div>
            )}
          </div>
          <div className="text-end text-xs">
            <div className="text-lg font-bold">مل ترسیل رجسٹر</div>
            <div>مدت: {muddat}</div>
            {lagayFilter.map((l) => (
              <div key={l}>{l}</div>
            ))}
            <div>پرنٹ: {today && formatTareekh(today)}</div>
          </div>
        </div>
      </div>

      <PageHeader
        className="print:hidden"
        title="مل ترسیل رجسٹر"
        icon={FileSpreadsheet}
        description="شوگر مل کو بھیجی گئی ہر گاڑی کا وزن، کرایہ اور ادائیگی — ایکسل شیٹ کی طرح"
        actions={
          <Button size="lg" variant="outline" onClick={() => window.print()} disabled={!data || rows.length === 0}>
            <Printer className="size-5" />
            پرنٹ رپورٹ
          </Button>
        }
      />

      <div ref={formRef} className="mb-5 scroll-mt-20">
        <TarseelForm today={today} editing={editing} onDoneEditing={() => setEditing(null)} onSaved={() => mutate()} />
      </div>

      {/* رپورٹ کے فلٹر — سب اختیاری */}
      <section aria-labelledby="t-filter-title" className="@container rounded-2xl bg-card p-3 ring-1 ring-foreground/8 sm:p-4 print:hidden">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 id="t-filter-title" className="font-semibold">
            رپورٹ کے فلٹر <span className="text-sm font-normal text-muted-foreground">(سب اختیاری — کچھ نہ چنیں تو پورا ریکارڈ)</span>
          </h2>
          <Button variant="ghost" onClick={resetFilters} disabled={!koiFilter}>
            <FilterX />
            فلٹر صاف کریں
          </Button>
        </div>

        <div className="mb-3 flex flex-wrap gap-1.5" role="group" aria-label="فوری تاریخ">
          {presets.map((p) => {
            const active = f.from === p.from && f.to === p.to
            return (
              <Button
                key={p.label}
                type="button"
                size="sm"
                variant={active ? "default" : "outline"}
                className="h-9"
                aria-pressed={active}
                onClick={() => setF((prev) => ({ ...prev, from: p.from, to: p.to }))}
              >
                {p.label}
              </Button>
            )
          })}
        </div>

        <div className="grid gap-3 @md:grid-cols-2 @3xl:grid-cols-4">
          <FilterField label="تاریخ سے" htmlFor="tf-from">
            <Input
              id="tf-from"
              type="date"
              dir="ltr"
              className="h-10 text-end"
              value={f.from}
              max={f.to || undefined}
              onChange={(e) => setFilter("from", e.target.value)}
            />
          </FilterField>
          <FilterField label="تاریخ تک" htmlFor="tf-to">
            <Input
              id="tf-to"
              type="date"
              dir="ltr"
              className="h-10 text-end"
              value={f.to}
              min={f.from || undefined}
              onChange={(e) => setFilter("to", e.target.value)}
            />
          </FilterField>
          <FilterField label="کھاتہ دار" htmlFor="tf-khata" className="@md:col-span-2">
            <SearchableSelect
              id="tf-khata"
              className="h-10"
              options={options.khataDaar}
              value={f.khataDaar}
              onChange={(v) =>
                setF((prev) => ({
                  ...prev,
                  khataDaar: v,
                  khataDaarLabel: options.khataDaar.find((o) => o.value === v)?.label ?? "",
                }))
              }
              freeText={f.khataDaar && !options.khataDaar.some((o) => o.value === f.khataDaar) ? f.khataDaarLabel : null}
              placeholder="تمام کھاتہ دار"
              searchPlaceholder="کھاتہ دار کا نام یا کھاتہ نمبر…"
              emptyText="اس مدت میں یہ نام نہیں"
              loading={!data}
            />
          </FilterField>
          <ListFilter id="tf-mill" label="شوگر مل" all="تمام ملیں" value={f.mill} items={options.mill} onChange={(v) => setFilter("mill", v)} />
          <ListFilter id="tf-builty" label="بلٹی / اڈا" all="تمام اڈے" value={f.builty} items={options.builty} onChange={(v) => setFilter("builty", v)} />
          <ListFilter id="tf-bank" label="بینک" all="تمام بینک" value={f.bank} items={options.bank} onChange={(v) => setFilter("bank", v)} />
          <ListFilter id="tf-variety" label="ورائٹی" all="تمام ورائٹیاں" value={f.variety} items={options.variety} onChange={(v) => setFilter("variety", v)} />
          <FilterField label="ادائیگی کی حالت" htmlFor="tf-adaigi">
            <Select value={f.adaigi} onValueChange={(v) => setFilter("adaigi", v as Adaigi)}>
              <SelectTrigger id="tf-adaigi" className="h-10! w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(ADAIGI_LABEL) as Adaigi[]).map((a) => (
                  <SelectItem key={a} value={a}>
                    {ADAIGI_LABEL[a]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>
          <FilterField label="تلاش" htmlFor="tf-search" className="@md:col-span-2 @3xl:col-span-3">
            <InputGroup className="h-10">
              <InputGroupInput
                id="tf-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ترسیل نمبر (مثلاً #12)، ٹوکن، گاڑی، ڈرائیور، پرمٹ یا کوئی بھی بات…"
              />
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
            </InputGroup>
          </FilterField>
        </div>

        <p className="mt-3 text-sm text-muted-foreground" aria-live="polite">
          مدت: <span className="text-foreground">{muddat}</span> ·{" "}
          {data ? (
            <>
              <Num value={rows.length} /> اندراج
            </>
          ) : (
            "لوڈ ہو رہا ہے…"
          )}
        </p>
      </section>

      <div className="mt-4">
        {error ? (
          <ErrorState message={urduError(error)} onRetry={() => mutate()} />
        ) : data && rows.length === 0 ? (
          <div className="rounded-2xl bg-card ring-1 ring-foreground/8">
            <EmptyState
              icon={koiFilter ? Search : FileSpreadsheet}
              title={koiFilter ? "ان فلٹرز سے کوئی اندراج نہیں ملا" : "ابھی کوئی اندراج نہیں"}
              description={koiFilter ? "فلٹر بدلیں یا «فلٹر صاف کریں» دبائیں۔" : "اوپر کے فارم سے پہلا اندراج کریں۔"}
            />
          </div>
        ) : (
          <TarseelSheet rows={rows} loading={!data} editingId={editing?.id} onEdit={edit} onDelete={remove} />
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- چھوٹے حصے

function FilterField({
  label,
  htmlFor,
  className,
  children,
}: {
  label: string
  htmlFor: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("grid content-start gap-1", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  )
}

/** ڈیٹا میں موجود قیمتوں کی فہرست والا فلٹر — پہلا اختیار «تمام …» */
function ListFilter({
  id,
  label,
  all,
  value,
  items,
  onChange,
}: {
  id: string
  label: string
  all: string
  value: string
  items: string[]
  onChange: (v: string) => void
}) {
  // منتخب قیمت تاریخ بدلنے سے فہرست میں نہ رہے تو بھی دکھے
  const list = value !== ALL && !items.includes(value) ? [value, ...items] : items
  return (
    <FilterField label={label} htmlFor={id}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="h-10! w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{all}</SelectItem>
          {list.map((v) => (
            <SelectItem key={v} value={v}>
              {v}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FilterField>
  )
}
