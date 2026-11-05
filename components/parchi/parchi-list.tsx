"use client"

import Link from "next/link"
import { Printer } from "lucide-react"
import { ConfirmDelete } from "@/components/confirm-delete"
import { JINSS_ICON } from "@/components/jinss"
import { Num, Raqam } from "@/components/num"
import { ParchiSlip } from "@/components/print/parchi-slip"
import { usePrint } from "@/components/print/print-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { ParchiWithRelations } from "@/lib/database.types"
import { JINSS_LABEL, formatMukhtasarTareekh, formatWaqt, partyKaNaam } from "@/lib/format"
import { cn } from "@/lib/utils"

/** پرچیوں کی فہرست — موبائل پر کارڈ، بڑی اسکرین پر جدول */
export function ParchiList({
  rows,
  loading,
  showDate,
  onDelete,
}: {
  rows: ParchiWithRelations[]
  loading?: boolean
  showDate?: boolean
  onDelete?: (row: ParchiWithRelations) => Promise<void>
}) {
  const { printSlip } = usePrint()
  const print = (row: ParchiWithRelations) => printSlip(<ParchiSlip parchi={row} copy="نقل" />)

  if (loading) {
    return (
      <div className="grid gap-2 p-3">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  const actions = (row: ParchiWithRelations) => (
    <div className="flex items-center justify-end gap-0.5">
      <Button variant="ghost" size="icon-sm" onClick={() => print(row)} aria-label="پرنٹ کریں" title="پرنٹ کریں">
        <Printer />
      </Button>
      {onDelete && (
        <ConfirmDelete
          title={`پرچی نمبر ${row.token_number} حذف کریں؟`}
          description="یہ پرچی اور اس سے بنا کسان کے کھاتے کا جمع اندراج دونوں ختم ہو جائیں گے۔"
          onConfirm={() => onDelete(row)}
        />
      )}
    </div>
  )

  return (
    <>
      {/* موبائل */}
      <ul className="divide-y md:hidden">
        {rows.map((row) => (
          <li key={row.id} className="flex items-center gap-2.5 py-2.5 ps-3 pe-1.5">
            <TokenBadge token={row.token_number} className="min-w-11 px-1.5 text-xs" />
            <div className="min-w-0 flex-1">
              <Link href={`/khata/${row.kisan_id}`} className="block truncate font-semibold hover:text-primary">
                {partyKaNaam(row.kisan)}
              </Link>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="font-semibold text-primary">{JINSS_LABEL[row.jinss]}</span>
                <span>·</span>
                <span className="whitespace-nowrap">
                  <Num format="mann" value={row.wazan_mann} /> من
                </span>
                <span>·</span>
                <span className="truncate">{showDate ? formatMukhtasarTareekh(row.tareekh) : formatWaqt(row.created_at)}</span>
              </div>
            </div>
            <Raqam value={row.final_raqam} className="text-sm font-bold" unitClassName="hidden" />
            {actions(row)}
          </li>
        ))}
      </ul>

      {/* ٹیبلٹ / ڈیسک ٹاپ */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/60 hover:bg-muted/60">
              <TableHead className="w-20">ٹوکن</TableHead>
              <TableHead>کسان</TableHead>
              <TableHead>جنس</TableHead>
              <TableHead className="hidden lg:table-cell">گاڑی / مل</TableHead>
              <TableHead className="text-end">خالص وزن</TableHead>
              <TableHead className="text-end">من</TableHead>
              <TableHead className="text-end">صافی رقم</TableHead>
              <TableHead className="hidden xl:table-cell">{showDate ? "تاریخ" : "وقت"}</TableHead>
              <TableHead className="w-24 text-end">عمل</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <TokenBadge token={row.token_number} />
                  {row.serial_number && (
                    <Num className="mt-0.5 block max-w-28 truncate text-xs text-muted-foreground">{row.serial_number}</Num>
                  )}
                </TableCell>
                <TableCell>
                  <Link href={`/khata/${row.kisan_id}`} className="font-semibold hover:text-primary">
                    {partyKaNaam(row.kisan)}
                  </Link>
                  {row.kisan?.gaon && <div className="text-xs text-muted-foreground">{row.kisan.gaon}</div>}
                </TableCell>
                <TableCell>
                  <JinssBadge jinss={row.jinss} />
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div>{row.gaari ? <Num>{row.gaari.gaari_number}</Num> : "—"}</div>
                  {row.mill && <div className="text-xs text-muted-foreground">{row.mill.mill_ka_naam}</div>}
                </TableCell>
                <TableCell className="text-end">
                  <Num format="kg" value={row.khalis_wazan_kg} /> <span className="text-xs text-muted-foreground">کلو</span>
                </TableCell>
                <TableCell className="text-end font-semibold">
                  <Num format="mann" value={row.wazan_mann} />
                </TableCell>
                <TableCell className="text-end">
                  <Raqam value={row.final_raqam} className="font-bold" />
                </TableCell>
                <TableCell className="hidden text-muted-foreground xl:table-cell">
                  {showDate ? formatMukhtasarTareekh(row.tareekh) : formatWaqt(row.created_at)}
                </TableCell>
                <TableCell>{actions(row)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}

export function TokenBadge({ token, className }: { token: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-9 min-w-12 items-center justify-center rounded-xl bg-primary/10 px-2 font-num text-sm font-bold text-primary",
        className,
      )}
    >
      #{token}
    </span>
  )
}

export function JinssBadge({ jinss }: { jinss: ParchiWithRelations["jinss"] }) {
  const Icon = JINSS_ICON[jinss]
  return (
    <Badge variant="secondary" className="shrink-0">
      <Icon />
      {JINSS_LABEL[jinss]}
    </Badge>
  )
}
