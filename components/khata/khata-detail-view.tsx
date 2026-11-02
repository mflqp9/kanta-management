"use client"

import Link from "next/link"
import { ArrowRight, BookOpenText, MapPin, Pencil, Phone, Plus, Printer, ReceiptText, UserX } from "lucide-react"
import { use, useLayoutEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import useSWR from "swr"
import { ConfirmDelete } from "@/components/confirm-delete"
import { EmptyState, ErrorState } from "@/components/empty-state"
import { KhataEntryDialog } from "@/components/khata/khata-entry-dialog"
import { Baqaya, Num, Raqam } from "@/components/num"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToday } from "@/hooks/use-today"
import { BUSINESS } from "@/lib/config"
import type { KhataIndraj } from "@/lib/database.types"
import { urduError } from "@/lib/errors"
import { formatMukhtasarTareekh, formatTareekh, partyKaNaam } from "@/lib/format"
import { refreshAll } from "@/lib/queries"
import { fetchAll, getSupabase, unwrap } from "@/lib/supabaseClient"
import { cn } from "@/lib/utils"

type LedgerRow = KhataIndraj & { baqaya: number }

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function KhataDetailView({ params }: { params: Promise<{ partyId: string }> }) {
  const { partyId } = use(params)
  const today = useToday()
  const validId = UUID_RE.test(partyId)
  const [dialog, setDialog] = useState<{ entry: KhataIndraj | null } | null>(null)

  useLayoutEffect(() => () => setDialog(null), [])

  const party = useSWR(validId ? ["party", partyId] : null, ([, id]) =>
    unwrap(getSupabase().from("parties").select("*").eq("id", id).maybeSingle()),
  )
  const ledger = useSWR(validId ? ["khata", partyId] : null, ([, id]) =>
    fetchAll<KhataIndraj>((from, to) =>
      getSupabase()
        .from("khata_ledger")
        .select("*")
        .eq("party_id", id)
        .order("tareekh", { ascending: true })
        .order("created_at", { ascending: true })
        .range(from, to),
    ),
  )

  const { rows, jama, banam } = useMemo(() => {
    let jama = 0
    let banam = 0
    const rows: LedgerRow[] = []
    for (const r of ledger.data ?? []) {
      jama += Number(r.jama)
      banam += Number(r.banam)
      rows.push({ ...r, baqaya: jama - banam })
    }
    return { rows, jama, banam }
  }, [ledger.data])

  async function remove(entry: KhataIndraj) {
    const { error } = await getSupabase().from("khata_ledger").delete().eq("id", entry.id)
    if (error) {
      toast.error(urduError(error))
      throw error
    }
    toast.success("اندراج حذف ہو گیا")
    refreshAll()
  }

  if (!validId || (party.data === null && !party.isLoading)) {
    return (
      <EmptyState
        icon={UserX}
        title="یہ کھاتہ نہیں ملا"
        description="ہو سکتا ہے پارٹی حذف ہو چکی ہو یا لنک غلط ہو۔"
        action={
          <Button asChild variant="outline">
            <Link href="/khata">
              <ArrowRight />
              تمام کھاتے
            </Link>
          </Button>
        }
      />
    )
  }

  const error = party.error ?? ledger.error
  const p = party.data
  const baqaya = jama - banam

  return (
    <>
      {/* پرنٹ ہیڈر */}
      <div className="mb-4 hidden border-b-2 border-black pt-2 pb-3 print:block">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-2xl font-bold">{BUSINESS.naam}</div>
            <div className="text-sm">{BUSINESS.pata}</div>
          </div>
          <div className="text-end text-sm">
            <div className="text-lg font-bold">کھاتہ</div>
            <div>پرنٹ: {today && formatTareekh(today)}</div>
          </div>
        </div>
        <div className="mt-2 text-lg">
          <span className="font-bold">{partyKaNaam(p)}</span>
          {p?.gaon && <span> — {p.gaon}</span>}
          {p?.mobile_number && (
            <span>
              {" "}
              — <Num>{p.mobile_number}</Num>
            </span>
          )}
        </div>
      </div>

      {/* پارٹی کارڈ */}
      <div className="mb-5 flex flex-col gap-4 print:hidden">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Button asChild variant="ghost" size="icon" className="shrink-0 rounded-full" aria-label="تمام کھاتے">
              <Link href="/khata">
                <ArrowRight className="size-5" />
              </Link>
            </Button>
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <BookOpenText className="size-6" />
            </span>
            <div className="min-w-0">
              {p ? (
                <>
                  <h1 className="text-xl font-bold text-balance sm:text-2xl">{partyKaNaam(p)}</h1>
                  <div className="flex flex-wrap items-center gap-x-3 text-sm text-muted-foreground">
                    {p.qism && <Badge variant="secondary">{p.qism}</Badge>}
                    {p.gaon && (
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3.5" />
                        {p.gaon}
                      </span>
                    )}
                    {p.mobile_number && (
                      <a href={`tel:${p.mobile_number}`} className="flex items-center gap-1 text-primary">
                        <Phone className="size-3.5" />
                        <Num>{p.mobile_number}</Num>
                      </a>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Skeleton className="mb-2 h-7 w-48" />
                  <Skeleton className="h-4 w-32" />
                </>
              )}
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button size="lg" className="flex-1 sm:flex-none" onClick={() => setDialog({ entry: null })} disabled={!p}>
              <Plus className="size-5" />
              نیا اندراج شامل کریں
            </Button>
            <Button size="lg" variant="outline" className="flex-1 sm:flex-none" onClick={() => window.print()} disabled={!ledger.data}>
              <Printer className="size-5" />
              پرنٹ کھاتہ
            </Button>
          </div>
        </div>

        {/* موبائل پر بڑی رقم کے لیے: جمع + بنام اوپر، بقایا نیچے پوری چوڑائی */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
          <Tile label="کل جمع" loading={!ledger.data}>
            <Raqam value={jama} />
          </Tile>
          <Tile label="کل بنام" loading={!ledger.data}>
            <Raqam value={banam} />
          </Tile>
          <Tile label="بقایا" loading={!ledger.data} strong>
            <Baqaya value={baqaya} />
          </Tile>
        </div>
      </div>

      {error ? (
        <ErrorState message={urduError(error)} onRetry={() => (party.mutate(), ledger.mutate())} />
      ) : !ledger.data ? (
        <div className="grid gap-2 rounded-2xl bg-card p-3 ring-1 ring-foreground/8">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-12 rounded-xl" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl bg-card ring-1 ring-foreground/8">
          <EmptyState
            icon={BookOpenText}
            title="اس کھاتے میں ابھی کوئی اندراج نہیں"
            description="وزن پرچی محفوظ ہوتے ہی یہاں جمع اندراج آ جائے گا، یا دستی ادائیگی درج کریں۔"
            action={
              <Button onClick={() => setDialog({ entry: null })}>
                <Plus />
                نیا اندراج شامل کریں
              </Button>
            }
          />
        </div>
      ) : (
        <section className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/8 shadow-xs print:rounded-none print:ring-0">
          {/* موبائل */}
          <ul className="divide-y md:hidden print:hidden">
            {rows.map((r) => (
              <li key={r.id} className="px-3 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {formatMukhtasarTareekh(r.tareekh)}
                      {r.parchi_id ? <Badge variant="secondary">پرچی</Badge> : r.qism && <Badge variant="outline">{r.qism}</Badge>}
                    </div>
                    <div className="text-sm">{r.tafseel || "—"}</div>
                  </div>
                  <RowActions row={r} onEdit={() => setDialog({ entry: r })} onDelete={() => remove(r)} />
                </div>
                <div className="mt-1.5 grid grid-cols-3 gap-2 text-sm">
                  <span>
                    <span className="text-xs text-muted-foreground">جمع </span>
                    {r.jama > 0 ? <Num format="raqam" value={r.jama} className="font-semibold" /> : "—"}
                  </span>
                  <span>
                    <span className="text-xs text-muted-foreground">بنام </span>
                    {r.banam > 0 ? <Num format="raqam" value={r.banam} className="font-semibold text-destructive" /> : "—"}
                  </span>
                  <span className="text-end">
                    <Baqaya value={r.baqaya} className="font-bold" />
                  </span>
                </div>
              </li>
            ))}
            <li className="flex items-center justify-between bg-secondary px-3 py-3 font-bold text-secondary-foreground">
              <span>موجودہ بقایا</span>
              <Baqaya value={baqaya} />
            </li>
          </ul>

          {/* جدول (ٹیبلٹ، ڈیسک ٹاپ اور پرنٹ) */}
          <div className="hidden md:block print:block">
            <Table className="print:text-[11pt]">
              <TableHeader>
                <TableRow className="bg-muted/60 hover:bg-muted/60">
                  <TableHead className="w-32">تاریخ</TableHead>
                  <TableHead>تفصیل</TableHead>
                  <TableHead className="w-32 text-end">جمع</TableHead>
                  <TableHead className="w-32 text-end">بنام</TableHead>
                  <TableHead className="w-36 text-end">بقایا</TableHead>
                  <TableHead className="w-24 print:hidden" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id} className="print:break-inside-avoid">
                    <TableCell className="text-muted-foreground print:text-black">{formatMukhtasarTareekh(r.tareekh)}</TableCell>
                    <TableCell className="whitespace-normal">
                      <div className="flex items-center gap-2">
                        {r.parchi_id ? (
                          <ReceiptText className="size-4 shrink-0 text-primary print:hidden" />
                        ) : (
                          r.qism && (
                            <Badge variant="outline" className="print:hidden">
                              {r.qism}
                            </Badge>
                          )
                        )}
                        <span>{r.tafseel || "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-end">{r.jama > 0 ? <Num format="raqam" value={r.jama} /> : <Muted />}</TableCell>
                    <TableCell className="text-end text-destructive print:text-black">
                      {r.banam > 0 ? <Num format="raqam" value={r.banam} /> : <Muted />}
                    </TableCell>
                    <TableCell className="text-end font-semibold">
                      <Baqaya value={r.baqaya} />
                    </TableCell>
                    <TableCell className="print:hidden">
                      <RowActions row={r} onEdit={() => setDialog({ entry: r })} onDelete={() => remove(r)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow className="font-bold">
                  <TableCell colSpan={2}>میزان</TableCell>
                  <TableCell className="text-end">
                    <Num format="raqam" value={jama} />
                  </TableCell>
                  <TableCell className="text-end">
                    <Num format="raqam" value={banam} />
                  </TableCell>
                  <TableCell className="text-end">
                    <Baqaya value={baqaya} />
                  </TableCell>
                  <TableCell className="print:hidden" />
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </section>
      )}

      <div className="mt-10 hidden justify-between text-sm print:flex">
        <div className="w-48 border-t border-black pt-1 text-center">دستخط منشی</div>
        <div className="w-48 border-t border-black pt-1 text-center">دستخط پارٹی</div>
      </div>

      {p && (
        <KhataEntryDialog
          open={dialog !== null}
          onOpenChange={(open) => !open && setDialog(null)}
          partyId={p.id}
          partyName={partyKaNaam(p)}
          entry={dialog?.entry}
          today={today}
          onSaved={() => ledger.mutate()}
        />
      )}
    </>
  )
}

function RowActions({ row, onEdit, onDelete }: { row: KhataIndraj; onEdit: () => void; onDelete: () => Promise<void> }) {
  if (row.parchi_id) {
    return (
      <Button asChild variant="ghost" size="icon-sm" title="یہ اندراج وزن پرچی سے بنا ہے — پرچیوں کے صفحے پر دیکھیں">
        <Link href="/parchiyan" aria-label="پرچیاں دیکھیں">
          <ReceiptText />
        </Link>
      </Button>
    )
  }
  return (
    <div className="flex shrink-0 items-center justify-end gap-0.5">
      <Button variant="ghost" size="icon-sm" onClick={onEdit} aria-label="ترمیم کریں" title="ترمیم کریں">
        <Pencil />
      </Button>
      <ConfirmDelete description="یہ کھاتہ اندراج حذف ہو جائے گا اور بقایا دوبارہ حساب ہو گا۔" onConfirm={onDelete} />
    </div>
  )
}

function Tile({ label, loading, strong, children }: { label: string; loading?: boolean; strong?: boolean; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-2xl p-3 ring-1 sm:p-4",
        strong
          ? "col-span-2 bg-primary text-primary-foreground ring-primary sm:col-span-1 [&_.text-destructive]:text-primary-foreground"
          : "bg-card ring-foreground/8",
      )}
    >
      <div className={cn("text-xs sm:text-sm", strong ? "text-primary-foreground/80" : "text-muted-foreground")}>{label}</div>
      {loading ? <Skeleton className="mt-1 h-7 w-20" /> : <div className="text-[0.95rem] font-bold sm:text-xl [&_.opacity-70]:max-sm:hidden">{children}</div>}
    </div>
  )
}

function Muted() {
  return <span className="text-muted-foreground">—</span>
}
