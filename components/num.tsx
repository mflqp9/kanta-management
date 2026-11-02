import { cn } from "@/lib/utils"
import { formatKg, formatMann, formatNumber, formatRaqam } from "@/lib/format"

type Format = "number" | "kg" | "mann" | "raqam"

const FORMATTERS: Record<Format, (v: number) => string> = {
  number: (v) => formatNumber(v),
  kg: formatKg,
  mann: formatMann,
  raqam: formatRaqam,
}

/**
 * نمبر دکھانے کا واحد طریقہ: انگریزی ہندسے، tabular فونٹ، اور LTR تاکہ
 * اردو جملے کے اندر منفی نشان اور کوما صحیح جگہ رہیں۔
 */
export function Num({
  value,
  format = "number",
  children,
  className,
}: {
  value?: number | null
  format?: Format
  children?: React.ReactNode
  className?: string
}) {
  return (
    <span dir="ltr" className={cn("font-num inline-block", className)}>
      {children ?? FORMATTERS[format](Number(value ?? 0))}
    </span>
  )
}

/** رقم + "روپے" */
export function Raqam({ value, className, unitClassName }: { value?: number | null; className?: string; unitClassName?: string }) {
  return (
    <span className={cn("whitespace-nowrap", className)}>
      <Num value={value} format="raqam" /> <span className={cn("text-[0.8em] opacity-70", unitClassName)}>روپے</span>
    </span>
  )
}

/** بقایا: مثبت = جمع (پارٹی کا لینا)، منفی = بنام */
export function Baqaya({ value, className }: { value: number; className?: string }) {
  const negative = value < 0
  return (
    <span className={cn("whitespace-nowrap", negative && "text-destructive", className)}>
      <Num value={Math.abs(value)} format="raqam" />{" "}
      <span className="text-[0.75em] opacity-75">{value === 0 ? "" : negative ? "بنام" : "جمع"}</span>
    </span>
  )
}
