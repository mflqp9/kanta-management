"use client"

import Link from "next/link"
import { ChartColumnBig, Factory, Printer, Scissors, Wallet } from "lucide-react"
import { useMemo, useState } from "react"
import useSWR from "swr"
import { DateRangeFilter, type DateRange } from "@/components/date-range-filter"
import { EmptyState, ErrorState } from "@/components/empty-state"
import { JinssFilter } from "@/components/jinss"
import { Baqaya, Num } from "@/components/num"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToday } from "@/hooks/use-today"
import { BUSINESS } from "@/lib/config"
import type { Jinss, Mill, Party, WazanParchi } from "@/lib/database.types"
import { urduError } from "@/lib/errors"
import { JINSS_LABEL, formatMukhtasarTareekh, formatTareekh, monthStart, partyKaNaam } from "@/lib/format"
import { usePrintPage, A4_REPORT_PAGE } from "@/lib/print-page"
import { useParties } from "@/lib/queries"
import { fetchAll, getSupabase, unwrap } from "@/lib/supabaseClient"
import { cn } from "@/lib/utils"

type Tab = "mill" | "katauti" | "baqaya"

const TABS: { key: Tab; label: string; icon: typeof Factory }[] = [
  { key: "mill", label: "مل وار رپورٹ", icon: Factory },
  { key: "katauti", label: "کٹوتی رپورٹ", icon: Scissors },
  { key: "baqaya", label: "بقایا رپورٹ", icon: Wallet },
]

export function ReportsView() {
  const today = useToday()
  usePrintPage(A4_REPORT_PAGE)
  const [picked, setPicked] = useState<DateRange | null>(null)
  const range = picked ?? { from: today ? monthStart(today) : "", to: today }
  const [tab, setTab] = useState<Tab>("mill")
  const [jinss, setJinss] = useState<Jinss | "all">("all")
  const ready = Boolean(range.from && range.to)
  const activeTab = TABS.find((t) => t.key === tab)!

  return (
    <>
      <PageHeader
        title="رپورٹس"
        icon={ChartColumnBig}
        description="تاریخ کے حساب سے مل وار، کٹوتی اور بقایا رپورٹ"
        actions={
          <Button size="lg" variant="outline" onClick={() => window.print()} disabled={!ready}>
            <Printer className="size-5" />
            پرنٹ رپورٹ
          </Button>
        }
      />

      <div className="mb-4 hidden border-b-2 border-black pt-2 pb-3 print:block">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-2xl font-bold">{BUSINESS.naam}</div>
            <div className="text-sm">{BUSINESS.pata}</div>
            {BUSINESS.phone && (
              <div className="text-sm">
                فون: <Num>{BUSINESS.phone}</Num>
              </div>
            )}
          </div>
          <div className="text-end">
            <div className="text-lg font-bold">{activeTab.label}</div>
            {ready && (
              <div className="text-sm">
                {formatTareekh(range.from)} تا {formatTareekh(range.to)}
                {tab !== "baqaya" && jinss !== "all" && ` — ${JINSS_LABEL[jinss]}`}
              </div>
            )}
          </div>
        </div>
      </div>

      <DateRangeFilter value={range} onChange={setPicked} today={today} className="mb-4">
        {tab !== "baqaya" && <JinssFilter value={jinss} onChange={setJinss} />}
      </DateRangeFilter>

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} className="gap-4">
        <TabsList className="no-scrollbar w-full justify-start overflow-x-auto print:hidden sm:w-fit">
          {TABS.map((t) => (
            <TabsTrigger key={t.key} value={t.key} className="h-9 flex-1 gap-1.5 px-3 sm:flex-none sm:px-4">
              <t.icon className="size-4" />
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="mill">{ready && <MillReport range={range} jinss={jinss} />}</TabsContent>
        <TabsContent value="katauti">{ready && <KatautiReport range={range} jinss={jinss} />}</TabsContent>
        <TabsContent value="baqaya">{ready && <BaqayaReport range={range} />}</TabsContent>
      </Tabs>
    </>
  )
}

// ---------------------------------------------------------------- مل وار

function MillReport({ range, jinss }: { range: DateRange; jinss: Jinss | "all" }) {
  const { data, error, mutate } = useSWR(["report-mill", range.from, range.to, jinss], ([, from, to, j]) =>
    unwrap(getSupabase().rpc("report_mill_wise", { p_from: from, p_to: to, p_jinss: j === "all" ? null : j })),
  )
  if (error) return <ErrorState message={urduError(error)} onRetry={() => mutate()} />
  if (!data) return <LoadingTable />
  if (data.length === 0) return <NoData />

  const t = sum(data, ["parchi_count", "khalis_wazan_kg", "wazan_mann", "katauti_mann", "kul_raqam", "final_raqam"])

  return (
    <ReportCard>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/60 hover:bg-muted/60">
            <TableHead>مل</TableHead>
            <TableHead className="text-end">پرچیاں</TableHead>
            <TableHead className="text-end">خالص وزن (کلو)</TableHead>
            <TableHead className="text-end">وزن (من)</TableHead>
            <TableHead className="text-end">کٹوتی (من)</TableHead>
            <TableHead className="text-end">کل رقم</TableHead>
            <TableHead className="text-end">صافی رقم</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((r) => (
            <TableRow key={r.mill_id ?? "none"}>
              <TableCell className="font-semibold">{r.mill_ka_naam}</TableCell>
              <NumCell value={r.parchi_count} format="number" />
              <NumCell value={r.khalis_wazan_kg} format="kg" />
              <NumCell value={r.wazan_mann} format="mann" strong />
              <NumCell value={r.katauti_mann} format="mann" />
              <NumCell value={r.kul_raqam} format="raqam" />
              <NumCell value={r.final_raqam} format="raqam" strong />
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow className="font-bold">
            <TableCell>میزان</TableCell>
            <NumCell value={t.parchi_count} format="number" />
            <NumCell value={t.khalis_wazan_kg} format="kg" />
            <NumCell value={t.wazan_mann} format="mann" />
            <NumCell value={t.katauti_mann} format="mann" />
            <NumCell value={t.kul_raqam} format="raqam" />
            <NumCell value={t.final_raqam} format="raqam" />
          </TableRow>
        </TableFooter>
      </Table>
    </ReportCard>
  )
}

// ---------------------------------------------------------------- کٹوتی

type KatautiRow = Pick<
  WazanParchi,
  | "id"
  | "token_number"
  | "tareekh"
  | "jinss"
  | "wazan_mann"
  | "mill_katauti_mann"
  | "mill_katauti_kg"
  | "fee_mann_rate"
  | "kul_raqam"
  | "final_raqam"
> & {
  kisan: Pick<Party, "naam" | "walid_ka_naam" | "nisbat"> | null
  mill: Pick<Mill, "mill_ka_naam"> | null
}

function KatautiReport({ range, jinss }: { range: DateRange; jinss: Jinss | "all" }) {
  const { data, error, mutate } = useSWR(["report-katauti", range.from, range.to, jinss], async ([, from, to, j]) => {
    const rows = await fetchAll((start, end) => {
      let q = getSupabase()
        .from("wazan_parchi")
        .select(
          "id, token_number, tareekh, jinss, wazan_mann, mill_katauti_mann, mill_katauti_kg, fee_mann_rate, kul_raqam, final_raqam, kisan:parties(naam, walid_ka_naam, nisbat), mill:mills(mill_ka_naam)",
        )
        .gte("tareekh", from)
        .lte("tareekh", to)
        .gt("mill_katauti_mann", 0)
      if (j !== "all") q = q.eq("jinss", j)
      return q.order("tareekh").order("token_number").range(start, end)
    })
    return rows as unknown as KatautiRow[]
  })

  if (error) return <ErrorState message={urduError(error)} onRetry={() => mutate()} />
  if (!data) return <LoadingTable />
  if (data.length === 0) return <NoData text="اس مدت میں کسی پرچی پر کٹوتی نہیں لگی" />

  const totalMann = data.reduce((s, r) => s + Number(r.wazan_mann), 0)
  const totalKatauti = data.reduce((s, r) => s + Number(r.mill_katauti_mann), 0)
  const totalKatautiKg = data.reduce((s, r) => s + Number(r.mill_katauti_kg), 0)
  const totalRaqam = data.reduce((s, r) => s + (Number(r.kul_raqam) - Number(r.final_raqam)), 0)

  return (
    <ReportCard>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/60 hover:bg-muted/60">
            <TableHead>ٹوکن</TableHead>
            <TableHead>تاریخ</TableHead>
            <TableHead>کسان</TableHead>
            <TableHead>مل</TableHead>
            <TableHead className="text-end">وزن (من)</TableHead>
            <TableHead className="text-end">کٹوتی (کلو)</TableHead>
            <TableHead className="text-end">کٹوتی (من)</TableHead>
            <TableHead className="text-end">فیصد</TableHead>
            <TableHead className="text-end">کٹوتی رقم</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((r) => (
            <TableRow key={r.id}>
              <TableCell>
                <Num className="font-semibold">#{r.token_number}</Num>
              </TableCell>
              <TableCell className="text-muted-foreground print:text-black">{formatMukhtasarTareekh(r.tareekh)}</TableCell>
              <TableCell>
                {partyKaNaam(r.kisan)} <span className="text-xs text-muted-foreground">({JINSS_LABEL[r.jinss]})</span>
              </TableCell>
              <TableCell>{r.mill?.mill_ka_naam ?? "—"}</TableCell>
              <NumCell value={r.wazan_mann} format="mann" />
              <NumCell value={r.mill_katauti_kg} format="kg" strong />
              <NumCell value={r.mill_katauti_mann} format="mann" strong />
              <NumCell value={r.wazan_mann > 0 ? (r.mill_katauti_mann / r.wazan_mann) * 100 : 0} format="number" suffix="%" />
              <NumCell value={Number(r.kul_raqam) - Number(r.final_raqam)} format="raqam" />
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow className="font-bold">
            <TableCell colSpan={4}>
              میزان (<Num value={data.length} /> پرچیاں)
            </TableCell>
            <NumCell value={totalMann} format="mann" />
            <NumCell value={totalKatautiKg} format="kg" />
            <NumCell value={totalKatauti} format="mann" />
            <NumCell value={totalMann > 0 ? (totalKatauti / totalMann) * 100 : 0} format="number" suffix="%" />
            <NumCell value={totalRaqam} format="raqam" />
          </TableRow>
        </TableFooter>
      </Table>
    </ReportCard>
  )
}

// ---------------------------------------------------------------- بقایا

function BaqayaReport({ range }: { range: DateRange }) {
  const { data, error, mutate } = useSWR(["report-baqaya", range.from, range.to], ([, from, to]) =>
    unwrap(getSupabase().rpc("report_baqaya", { p_from: from, p_to: to })),
  )
  // RPC میں والد / ریفرینس نہیں آتا — پارٹیوں کی (پہلے سے کیش) فہرست سے لیں تاکہ «ولد» یا «ریفرینس» درست دکھے
  const parties = useParties()
  const nisbatOf = useMemo(() => new Map(parties.data?.map((p) => [p.id, p.nisbat])), [parties.data])
  if (error ?? parties.error) return <ErrorState message={urduError(error ?? parties.error)} onRetry={() => (mutate(), parties.mutate())} />
  if (!data || !parties.data) return <LoadingTable />
  if (data.length === 0) return <NoData />

  const t = sum(data, ["sabiqa_baqaya", "jama", "banam", "baqaya"])

  return (
    <ReportCard>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/60 hover:bg-muted/60">
            <TableHead>پارٹی</TableHead>
            <TableHead className="hidden sm:table-cell print:table-cell">موضع</TableHead>
            <TableHead className="text-end">سابقہ بقایا</TableHead>
            <TableHead className="text-end">جمع</TableHead>
            <TableHead className="text-end">بنام</TableHead>
            <TableHead className="text-end">موجودہ بقایا</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((r) => (
            <TableRow key={r.party_id}>
              <TableCell>
                <Link href={`/khata/${r.party_id}`} className="font-semibold hover:text-primary">
                  {partyKaNaam({ ...r, nisbat: nisbatOf.get(r.party_id) })}
                </Link>
              </TableCell>
              <TableCell className="hidden sm:table-cell print:table-cell">{r.gaon || "—"}</TableCell>
              <TableCell className="text-end">
                <Baqaya value={Number(r.sabiqa_baqaya)} />
              </TableCell>
              <NumCell value={r.jama} format="raqam" />
              <NumCell value={r.banam} format="raqam" />
              <TableCell className="text-end font-bold">
                <Baqaya value={Number(r.baqaya)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow className="font-bold">
            <TableCell>
              میزان (<Num value={data.length} /> پارٹیاں)
            </TableCell>
            <TableCell className="hidden sm:table-cell print:table-cell" />
            <TableCell className="text-end">
              <Baqaya value={t.sabiqa_baqaya} />
            </TableCell>
            <NumCell value={t.jama} format="raqam" />
            <NumCell value={t.banam} format="raqam" />
            <TableCell className="text-end">
              <Baqaya value={t.baqaya} />
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </ReportCard>
  )
}

// ---------------------------------------------------------------- مددگار

function sum<T extends Record<string, unknown>, K extends keyof T>(rows: T[], keys: K[]) {
  return Object.fromEntries(keys.map((k) => [k, rows.reduce((s, r) => s + Number(r[k] ?? 0), 0)])) as Record<K, number>
}

function NumCell({
  value,
  format,
  strong,
  suffix,
}: {
  value: number
  format: "number" | "kg" | "mann" | "raqam"
  strong?: boolean
  suffix?: string
}) {
  return (
    <TableCell className={cn("text-end", strong && "font-semibold")}>
      <Num value={Number(value)} format={format} />
      {suffix}
    </TableCell>
  )
}

function ReportCard({ children }: { children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/8 shadow-xs print:rounded-none print:ring-0 [&_table]:print:text-[10.5pt]">
      {children}
    </section>
  )
}

function LoadingTable() {
  return (
    <div className="grid gap-2 rounded-2xl bg-card p-3 ring-1 ring-foreground/8">
      {Array.from({ length: 5 }, (_, i) => (
        <Skeleton key={i} className="h-11 rounded-xl" />
      ))}
    </div>
  )
}

function NoData({ text = "اس مدت میں کوئی ریکارڈ نہیں" }: { text?: string }) {
  return (
    <div className="rounded-2xl bg-card ring-1 ring-foreground/8">
      <EmptyState icon={ChartColumnBig} title={text} description="تاریخ کی حد بدل کر دیکھیں۔" />
    </div>
  )
}

