"use client"

import Link from "next/link"
import { ArrowDownUp, BookOpenText, ChevronLeft, MapPin, Search, Users } from "lucide-react"
import { useDeferredValue, useMemo, useState } from "react"
import useSWR from "swr"
import { EmptyState, ErrorState } from "@/components/empty-state"
import { Baqaya, Num, Raqam } from "@/components/num"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import type { PartyBaqaya } from "@/lib/database.types"
import { urduError } from "@/lib/errors"
import { formatMukhtasarTareekh, nisbatKaJumla } from "@/lib/format"
import { fetchAll, getSupabase } from "@/lib/supabaseClient"
import { cn } from "@/lib/utils"

type Filter = "baqaya" | "all"

/** فہرست کی ترتیب — پہلی (کھاتہ نمبر) ڈیفالٹ */
type Tarteeb = "khata" | "baqaya"
const TARTEEB_LABEL: Record<Tarteeb, string> = {
  khata: "کھاتہ نمبر",
  baqaya: "زیادہ بقایا پہلے",
}

export function KhataIndexView() {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<Filter>("baqaya")
  const [tarteeb, setTarteeb] = useState<Tarteeb>("khata")
  const q = useDeferredValue(search.trim().toLowerCase())

  const { data, error, mutate } = useSWR("party_baqaya", () =>
    fetchAll<PartyBaqaya>((from, to) =>
      getSupabase().from("party_baqaya").select("*").order("khata_number").range(from, to),
    ),
  )

  const totals = useMemo(
    () =>
      (data ?? []).reduce(
        (t, r) => ({ jama: t.jama + Number(r.kul_jama), banam: t.banam + Number(r.kul_banam) }),
        { jama: 0, banam: 0 },
      ),
    [data],
  )

  const rows = useMemo(() => {
    // صرف نمبر لکھا ہو (مثلاً 12 یا #12) تو وہی کھاتہ نمبر سب سے اوپر، اور «کھاتے والے» فلٹر کے باوجود نظر آئے
    const number = /^#?\d+$/.test(q) ? q.replace("#", "") : null
    const isNumber = (r: PartyBaqaya) => number !== null && String(r.khata_number) === number
    return (data ?? [])
      .filter((r) => isNumber(r) || (filter === "baqaya" ? Number(r.baqaya) !== 0 || Number(r.indraj_count) > 0 : true))
      .filter(
        (r) =>
          !q ||
          isNumber(r) ||
          [`#${r.khata_number}`, r.naam, nisbatKaJumla(r), r.gaon, r.mobile_number, r.mobile_number_2].join(" ").toLowerCase().includes(q),
      )
      // نمبر سے تلاش ہو تو وہی کھاتہ سب سے اوپر؛ پھر منتخب ترتیب:
      // کھاتہ نمبر (1، 2، 3 …) یا زیادہ بقایا پہلے (جمع ہو یا بنام، بڑی رقم اوپر — برابر ہو تو کھاتہ نمبر سے)
      .sort(
        (a, b) =>
          Number(isNumber(b)) - Number(isNumber(a)) ||
          (tarteeb === "baqaya" ? Math.abs(Number(b.baqaya)) - Math.abs(Number(a.baqaya)) : 0) ||
          Number(a.khata_number) - Number(b.khata_number),
      )
  }, [data, filter, q, tarteeb])

  return (
    <>
      <PageHeader title="جمع بنام کھاتہ" icon={BookOpenText} description="ہر پارٹی کا جمع، بنام اور بقایا" />

      {/* موبائل پر لاکھوں / کروڑوں کی رقم تین تنگ خانوں میں نہیں سماتی: جمع + بنام اوپر، بقایا نیچے پوری چوڑائی */}
      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
        <SummaryTile label="کل جمع" value={<Raqam value={totals.jama} />} loading={!data} />
        <SummaryTile label="کل بنام" value={<Raqam value={totals.banam} />} loading={!data} />
        <SummaryTile label="کل بقایا" value={<Baqaya value={totals.jama - totals.banam} />} loading={!data} strong />
      </div>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <InputGroup className="h-11 bg-card">
          <InputGroupInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="کھاتہ نمبر، پارٹی کا نام، موضع یا موبائل تلاش کریں…" />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>
        <Select value={tarteeb} onValueChange={(v) => setTarteeb(v as Tarteeb)}>
          <SelectTrigger aria-label="ترتیب" className="h-11! w-full shrink-0 bg-card sm:w-56">
            <span className="flex min-w-0 items-center gap-1.5">
              <ArrowDownUp className="text-muted-foreground" />
              <span className="text-muted-foreground">ترتیب:</span>
              <SelectValue />
            </span>
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(TARTEEB_LABEL) as Tarteeb[]).map((t) => (
              <SelectItem key={t} value={t}>
                {TARTEEB_LABEL[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex h-11 shrink-0 items-center gap-1 rounded-lg bg-muted p-1">
          {(
            [
              ["baqaya", "کھاتے والے"],
              ["all", "تمام پارٹیاں"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={cn(
                "h-9 flex-1 rounded-md px-3 text-sm whitespace-nowrap transition-colors",
                filter === key ? "bg-background font-semibold shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/8 shadow-xs">
        {error ? (
          <div className="p-4">
            <ErrorState message={urduError(error)} onRetry={() => mutate()} />
          </div>
        ) : !data ? (
          <div className="grid gap-2 p-3">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={q ? Search : Users}
            title={q ? "کوئی پارٹی نہیں ملی" : "ابھی کوئی کھاتہ نہیں"}
            description={q ? "تلاش کے الفاظ بدل کر دیکھیں۔" : "وزن پرچی محفوظ ہوتے ہی کسان کا کھاتہ خود بن جاتا ہے۔"}
            action={
              !q && (
                <Button asChild variant="outline">
                  <Link href="/parties">پارٹیاں دیکھیں</Link>
                </Button>
              )
            }
          />
        ) : (
          <ul className="divide-y">
            {rows.map((r) => (
              <li key={r.id}>
                <Link href={`/khata/${r.id}`} className="flex items-center gap-3 px-3 py-3 transition-colors hover:bg-muted/50 sm:px-5">
                  <span
                    className="flex h-10 min-w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 px-1.5 text-primary"
                    title={`کھاتہ نمبر ${r.khata_number}`}
                  >
                    <span className="sr-only">کھاتہ نمبر </span>
                    <Num className="text-base font-bold">{r.khata_number}</Num>
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">
                      {r.naam}
                      {nisbatKaJumla(r) && <span className="text-sm font-normal text-muted-foreground"> {nisbatKaJumla(r)}</span>}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                      {r.gaon && (
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3" />
                          {r.gaon}
                        </span>
                      )}
                      <span>
                        <Num value={r.indraj_count} /> اندراج
                      </span>
                      {r.aakhri_tareekh && <span>آخری: {formatMukhtasarTareekh(r.aakhri_tareekh)}</span>}
                    </div>
                  </div>
                  <div className="hidden text-end text-sm sm:block">
                    <div className="text-xs text-muted-foreground">جمع / بنام</div>
                    <Num format="raqam" value={r.kul_jama} /> / <Num format="raqam" value={r.kul_banam} />
                  </div>
                  <div className="min-w-24 text-end">
                    <div className="text-xs text-muted-foreground">بقایا</div>
                    <Baqaya value={Number(r.baqaya)} className="font-bold" />
                  </div>
                  <ChevronLeft className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}

function SummaryTile({ label, value, loading, strong }: { label: string; value: React.ReactNode; loading?: boolean; strong?: boolean }) {
  return (
    <div className={cn("min-w-0 rounded-2xl p-3 ring-1 sm:p-4", strong ? "col-span-2 bg-primary text-primary-foreground ring-primary sm:col-span-1 [&_.text-destructive]:text-primary-foreground" : "bg-card ring-foreground/8")}>
      <div className={cn("text-xs sm:text-sm", strong ? "text-primary-foreground/80" : "text-muted-foreground")}>{label}</div>
      {loading ? <Skeleton className="mt-1 h-7 w-20" /> : <div className="text-[0.95rem] font-bold sm:text-xl [&_.opacity-70]:max-sm:hidden">{value}</div>}
    </div>
  )
}
