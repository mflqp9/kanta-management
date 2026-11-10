"use client"

import { Pencil } from "lucide-react"
import type { ReactNode } from "react"
import { ConfirmDelete } from "@/components/confirm-delete"
import { Num } from "@/components/num"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { mannAurKilo } from "@/lib/calc"
import type { MillTarseelWithRelations } from "@/lib/database.types"
import { formatTareekh, partyKaNaam } from "@/lib/format"
import { cn } from "@/lib/utils"

type Row = MillTarseelWithRelations

/** کھاتہ دار کا نام — کھاتے سے منتخب ہو تو تازہ نام، ورنہ دستی لکھا */
export const khataDaarKaNaam = (r: Row) => (r.party ? partyKaNaam(r.party) : r.khata_daar_naam)
export const millKaNaam = (r: Row) => r.mill?.mill_ka_naam ?? r.mill_naam

/** تلاش کے لیے ایک قطار کا سارا متن */
export function tarseelSearchText(r: Row) {
  return [
    String(r.tarseel_number),
    khataDaarKaNaam(r),
    r.party ? `#${r.party.khata_number}` : "",
    millKaNaam(r),
    r.token_number,
    r.gaari_number,
    r.driver_naam,
    r.driver_mobile,
    r.builty_adda,
    r.permit_number,
    r.variety,
    r.bank_naam,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
}

const sum = (rows: Row[], key: keyof Row) => rows.reduce((s, r) => s + Number(r[key] ?? 0), 0)

const Khali = () => <span className="text-muted-foreground print:text-black">—</span>
const Matn = ({ v }: { v: string | null }) => (v ? <>{v}</> : <Khali />)
/** کوڈ والے خانے (ٹوکن، گاڑی، پرمٹ، موبائل) — بائیں سے دائیں */
const Code = ({ v }: { v: string | null }) => (v ? <Num>{v}</Num> : <Khali />)
const Kg = ({ v }: { v: number }) => <Num value={v} format="kg" />
const Rs = ({ v }: { v: number }) => (Number(v) ? <Num value={v} format="raqam" /> : <Khali />)

function MannKilo({ kg }: { kg: number }) {
  const { mann, kilo } = mannAurKilo(Math.max(Number(kg), 0))
  return (
    <span className="whitespace-nowrap">
      <Num value={mann} /> <small className="opacity-70">من</small> <Num value={kilo} format="kg" /> <small className="opacity-70">کلو</small>
    </span>
  )
}

/** ترسیل نمبر کا نشان — جیسے پرچی کا ٹوکن */
export function TarseelNumber({ n, className }: { n: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md bg-primary/10 px-1.5 font-semibold whitespace-nowrap text-primary", className)}>
      ترسیل نمبر <Num>{n}</Num>
    </span>
  )
}

function BaqayaJaat({ v }: { v: number }) {
  return <Num value={v} format="raqam" className={cn("font-bold", Number(v) < 0 && "text-destructive print:text-black")} />
}

type Col = {
  label: string
  /** نمبر والا کالم — آخر کی طرف سیدھ */
  num?: boolean
  cell: (r: Row) => ReactNode
  total?: (rows: Row[]) => ReactNode
}

/** کالم بالکل اسی ترتیب میں جیسے فارم کے خانے */
export const TARSEEL_COLUMNS: Col[] = [
  {
    label: "کھاتہ دار",
    cell: (r) => (
      <span className="flex items-center gap-1.5">
        <span className="font-semibold">{khataDaarKaNaam(r)}</span>
        {r.party && (
          <span className="rounded bg-primary/10 px-1 text-xs whitespace-nowrap text-primary print:bg-transparent print:text-black">
            #<Num>{r.party.khata_number}</Num>
          </span>
        )}
      </span>
    ),
  },
  { label: "شوگر مل", cell: (r) => millKaNaam(r) },
  { label: "تاریخ", cell: (r) => formatTareekh(r.tareekh) },
  { label: "ٹوکن نمبر", cell: (r) => <Code v={r.token_number} /> },
  { label: "گاڑی نمبر", cell: (r) => <Code v={r.gaari_number} /> },
  { label: "ڈرائیور کا نام", cell: (r) => <Matn v={r.driver_naam} /> },
  { label: "ڈرائیور موبائل", cell: (r) => <Code v={r.driver_mobile} /> },
  { label: "بلٹی / اڈا", cell: (r) => <Matn v={r.builty_adda} /> },
  { label: "پرمٹ نمبر", cell: (r) => <Code v={r.permit_number} /> },
  { label: "ورائٹی", cell: (r) => <Matn v={r.variety} /> },
  { label: "کل وزن (کلو)", num: true, cell: (r) => <Kg v={r.kul_wazan_kg} />, total: (rows) => <Kg v={sum(rows, "kul_wazan_kg")} /> },
  { label: "من / کلو", num: true, cell: (r) => <MannKilo kg={r.kul_wazan_kg} />, total: (rows) => <MannKilo kg={sum(rows, "kul_wazan_kg")} /> },
  {
    label: "کٹوتی (کلو)",
    num: true,
    cell: (r) => (Number(r.katauti_kg) ? <Kg v={r.katauti_kg} /> : <Khali />),
    total: (rows) => <Kg v={sum(rows, "katauti_kg")} />,
  },
  {
    label: "صافی وزن (کلو)",
    num: true,
    cell: (r) => <Kg v={r.saafi_wazan_kg} />,
    total: (rows) => <Kg v={sum(rows, "saafi_wazan_kg")} />,
  },
  { label: "ریٹ (فی من)", num: true, cell: (r) => <Rs v={r.rate} /> },
  { label: "گاڑی کرایہ", num: true, cell: (r) => <Rs v={r.gaari_kiraya} />, total: (rows) => <Rs v={sum(rows, "gaari_kiraya")} /> },
  { label: "کرایہ مل", num: true, cell: (r) => <Rs v={r.mill_kiraya} />, total: (rows) => <Rs v={sum(rows, "mill_kiraya")} /> },
  {
    label: "بقایا صافی رقم",
    num: true,
    cell: (r) => <Rs v={r.baqaya_saafi_raqam} />,
    total: (rows) => <Rs v={sum(rows, "baqaya_saafi_raqam")} />,
  },
  { label: "بینک کا نام", cell: (r) => <Matn v={r.bank_naam} /> },
  { label: "آن لائن رقم", num: true, cell: (r) => <Rs v={r.online_raqam} />, total: (rows) => <Rs v={sum(rows, "online_raqam")} /> },
  { label: "بقایا جات", num: true, cell: (r) => <BaqayaJaat v={r.baqaya_jaat} />, total: (rows) => <BaqayaJaat v={sum(rows, "baqaya_jaat")} /> },
]

const cellBase = "border-b border-e border-border px-2.5 py-1.5 whitespace-nowrap print:px-1 print:py-0.5 print:whitespace-normal"

/** ایکسل شیٹ جیسا جدول (ٹیبلٹ، ڈیسک ٹاپ اور پرنٹ) + موبائل پر کارڈ */
export function TarseelSheet({
  rows,
  loading,
  editingId,
  onEdit,
  onDelete,
}: {
  rows: Row[]
  loading?: boolean
  editingId?: string | null
  onEdit: (row: Row) => void
  onDelete: (row: Row) => Promise<void>
}) {
  if (loading) {
    return (
      <div className="grid gap-2 rounded-2xl bg-card p-3 ring-1 ring-foreground/8">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  const actions = (r: Row) => (
    <div className="flex items-center justify-end gap-0.5">
      <Button variant="ghost" size="icon-sm" onClick={() => onEdit(r)} aria-label="ترمیم کریں" title="ترمیم کریں">
        <Pencil />
      </Button>
      <ConfirmDelete
        title={`ترسیل نمبر ${r.tarseel_number} حذف کریں؟`}
        description={`«${khataDaarKaNaam(r)}» کا ${formatTareekh(r.tareekh)} والا اندراج حذف ہو جائے گا۔`}
        onConfirm={() => onDelete(r)}
      />
    </div>
  )

  return (
    <>
      {/* موبائل: کارڈ */}
      <ul className="grid gap-2.5 md:hidden print:hidden">
        {rows.map((r) => (
          <li key={r.id} className={cn("rounded-2xl bg-card p-3.5 ring-1 ring-foreground/8", r.id === editingId && "ring-2 ring-primary/50")}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <TarseelNumber n={r.tarseel_number} />
                  <span>·</span>
                  <span>{formatTareekh(r.tareekh)}</span>
                </div>
                <div className="font-semibold">{TARSEEL_COLUMNS[0].cell(r)}</div>
                <div className="text-sm text-muted-foreground">{millKaNaam(r)}</div>
              </div>
              {actions(r)}
            </div>
            <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
              {TARSEEL_COLUMNS.slice(3, -1).map((c) => (
                <div key={c.label} className="flex min-w-0 flex-col">
                  <dt className="text-xs text-muted-foreground">{c.label}</dt>
                  <dd className="truncate">{c.cell(r)}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-2 flex items-center justify-between rounded-xl bg-secondary px-3 py-1.5 text-secondary-foreground">
              <span className="text-sm">بقایا جات</span>
              <BaqayaJaat v={r.baqaya_jaat} />
            </div>
          </li>
        ))}
        <li className="rounded-2xl bg-secondary p-3.5 text-sm text-secondary-foreground">
          <div className="mb-1 font-semibold">
            میزان (<Num value={rows.length} /> اندراج)
          </div>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-1">
            {TARSEEL_COLUMNS.filter((c) => c.total).map((c) => (
              <div key={c.label} className="flex flex-col">
                <dt className="text-xs opacity-75">{c.label}</dt>
                <dd className="font-bold">{c.total!(rows)}</dd>
              </div>
            ))}
          </dl>
        </li>
      </ul>

      {/* ٹیبلٹ / ڈیسک ٹاپ / پرنٹ: ایکسل جیسی شیٹ */}
      <div className="hidden max-h-[75vh] overflow-auto rounded-2xl bg-card ring-1 ring-foreground/8 shadow-xs md:block print:block print:max-h-none print:overflow-visible print:rounded-none print:shadow-none print:ring-0">
        <table className="w-max min-w-full border-separate border-spacing-0 text-sm print:w-full print:text-[7pt] print:leading-[1.6]">
          <thead>
            <tr>
              <th scope="col" className={cn(cellBase, "sticky start-0 top-0 z-30 bg-muted text-center font-semibold print:static")}>
                ترسیل نمبر
              </th>
              {TARSEEL_COLUMNS.map((c) => (
                <th
                  key={c.label}
                  scope="col"
                  className={cn(cellBase, "sticky top-0 z-20 bg-muted text-center font-semibold print:static")}
                >
                  {c.label}
                </th>
              ))}
              <th className={cn(cellBase, "sticky top-0 z-20 bg-muted print:hidden")}>
                <span className="sr-only">عمل</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                className={cn(
                  "group even:bg-muted/30 hover:bg-primary/5 print:break-inside-avoid print:even:bg-transparent",
                  r.id === editingId && "bg-primary/10 even:bg-primary/10",
                )}
              >
                <td className={cn(cellBase, "sticky start-0 z-10 bg-card text-center group-even:bg-muted print:static print:bg-transparent")}>
                  <Num className="font-bold text-primary print:text-black">{r.tarseel_number}</Num>
                </td>
                {TARSEEL_COLUMNS.map((c) => (
                  <td key={c.label} className={cn(cellBase, c.num && "text-end")}>
                    {c.cell(r)}
                  </td>
                ))}
                <td className={cn(cellBase, "px-1 print:hidden")}>{actions(r)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold">
              <td className={cn(cellBase, "sticky start-0 bottom-0 z-30 bg-secondary print:static print:bg-transparent")} />
              <td colSpan={10} className={cn(cellBase, "sticky bottom-0 z-20 bg-secondary text-secondary-foreground print:static print:bg-transparent")}>
                میزان (<Num value={rows.length} /> اندراج)
              </td>
              {TARSEEL_COLUMNS.slice(10).map((c) => (
                <td
                  key={c.label}
                  className={cn(cellBase, "sticky bottom-0 z-20 bg-secondary text-end text-secondary-foreground print:static print:bg-transparent")}
                >
                  {c.total?.(rows)}
                </td>
              ))}
              <td className={cn(cellBase, "sticky bottom-0 z-20 bg-secondary print:hidden")} />
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  )
}
