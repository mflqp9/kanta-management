"use client"

import Link from "next/link"
import { Plus, ReceiptText, Search } from "lucide-react"
import { useDeferredValue, useMemo, useState } from "react"
import { toast } from "sonner"
import useSWR from "swr"
import { DateRangeFilter, type DateRange } from "@/components/date-range-filter"
import { EmptyState, ErrorState } from "@/components/empty-state"
import { JinssFilter } from "@/components/jinss"
import { Num, Raqam } from "@/components/num"
import { PageHeader } from "@/components/page-header"
import { ParchiList } from "@/components/parchi/parchi-list"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { useToday } from "@/hooks/use-today"
import { PARCHI_SELECT, type Jinss, type ParchiWithRelations } from "@/lib/database.types"
import { urduError } from "@/lib/errors"
import { refreshAll } from "@/lib/queries"
import { fetchAll, getSupabase } from "@/lib/supabaseClient"

export function ParchiyanView() {
  const today = useToday()
  const [picked, setPicked] = useState<DateRange | null>(null)
  const range = picked ?? { from: today, to: today }
  const [jinss, setJinss] = useState<Jinss | "all">("all")
  const [search, setSearch] = useState("")
  const q = useDeferredValue(search.trim().toLowerCase())

  const { data, error, mutate } = useSWR(
    range.from && range.to ? ["parchiyan", range.from, range.to] : null,
    async ([, from, to]) =>
      (await fetchAll((start, end) =>
        getSupabase()
          .from("wazan_parchi")
          .select(PARCHI_SELECT)
          .gte("tareekh", from)
          .lte("tareekh", to)
          .order("token_number", { ascending: false })
          .range(start, end),
      )) as unknown as ParchiWithRelations[],
  )

  const rows = useMemo(
    () =>
      (data ?? []).filter((r) => {
        if (jinss !== "all" && r.jinss !== jinss) return false
        if (!q) return true
        return [
          r.token_number,
          r.serial_number,
          r.kisan?.naam,
          r.kisan?.walid_ka_naam,
          r.kisan?.gaon,
          r.gaari?.gaari_number,
          r.mill?.mill_ka_naam,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q)
      }),
    [data, jinss, q],
  )

  const totals = useMemo(
    () =>
      rows.reduce(
        (t, r) => ({ kg: t.kg + Number(r.khalis_wazan_kg), mann: t.mann + Number(r.wazan_mann), raqam: t.raqam + Number(r.final_raqam) }),
        { kg: 0, mann: 0, raqam: 0 },
      ),
    [rows],
  )

  async function remove(row: ParchiWithRelations) {
    const { error } = await getSupabase().from("wazan_parchi").delete().eq("id", row.id)
    if (error) {
      toast.error(urduError(error))
      throw error
    }
    toast.success(`پرچی نمبر ${row.token_number} حذف ہو گئی`)
    await mutate()
    refreshAll()
  }

  return (
    <>
      <PageHeader
        title="تمام پرچیاں"
        icon={ReceiptText}
        description="تاریخ کے حساب سے پرچیاں دیکھیں، دوبارہ پرنٹ کریں"
        actions={
          <Button asChild size="lg">
            <Link href="/wazan-entry">
              <Plus className="size-5" />
              نیا وزن اندراج
            </Link>
          </Button>
        }
      />

      <DateRangeFilter value={range} onChange={setPicked} today={today}>
        <JinssFilter value={jinss} onChange={setJinss} />
      </DateRangeFilter>

      <div className="my-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <InputGroup className="h-11 bg-card">
          <InputGroupInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ٹوکن نمبر، کمپیوٹر سیریل، کسان، گاڑی یا مل تلاش کریں…" />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>
        <div className="grid grid-cols-3 gap-2 text-center text-xs sm:flex sm:gap-4 sm:text-start sm:text-sm">
          <Total label="پرچیاں">
            <Num value={rows.length} />
          </Total>
          <Total label="کل من">
            <Num format="mann" value={totals.mann} />
          </Total>
          <Total label="صافی رقم">
            <Raqam value={totals.raqam} unitClassName="max-sm:hidden" />
          </Total>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/8 shadow-xs">
        {error ? (
          <div className="p-4">
            <ErrorState message={urduError(error)} onRetry={() => mutate()} />
          </div>
        ) : data && rows.length === 0 ? (
          <EmptyState
            icon={q ? Search : ReceiptText}
            title={q ? "کوئی پرچی نہیں ملی" : "اس مدت میں کوئی پرچی نہیں"}
            description={q ? "تلاش کے الفاظ بدل کر دیکھیں۔" : "تاریخ بدل کر دیکھیں یا نیا وزن اندراج کریں۔"}
          />
        ) : (
          <ParchiList rows={rows} loading={!data} showDate={range.from !== range.to} onDelete={remove} />
        )}
      </section>
    </>
  )
}

function Total({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-card px-3 py-1.5 ring-1 ring-foreground/8 sm:bg-transparent sm:p-0 sm:ring-0">
      <div className="text-muted-foreground">{label}</div>
      <div className="font-bold">{children}</div>
    </div>
  )
}
