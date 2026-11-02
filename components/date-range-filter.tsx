"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addDays, monthStart } from "@/lib/format"
import { cn } from "@/lib/utils"

export type DateRange = { from: string; to: string }

export function rangePresets(today: string): { label: string; range: DateRange }[] {
  return [
    { label: "آج", range: { from: today, to: today } },
    { label: "کل", range: { from: addDays(today, -1), to: addDays(today, -1) } },
    { label: "پچھلے 7 دن", range: { from: addDays(today, -6), to: today } },
    { label: "یہ مہینہ", range: { from: monthStart(today), to: today } },
  ]
}

/** تاریخ سے — تاریخ تک فلٹر، فوری انتخاب کے بٹنوں کے ساتھ */
export function DateRangeFilter({
  value,
  onChange,
  today,
  className,
  children,
}: {
  value: DateRange
  onChange: (range: DateRange) => void
  today: string
  className?: string
  children?: React.ReactNode
}) {
  const presets = today ? rangePresets(today) : []

  return (
    <div className={cn("flex flex-col gap-3 rounded-2xl bg-card p-3 ring-1 ring-foreground/8 sm:p-4 print:hidden", className)}>
      <div className="flex flex-wrap items-end gap-3">
        <div className="grid min-w-36 flex-1 gap-1 sm:max-w-48">
          <Label htmlFor="range-from">تاریخ سے</Label>
          <Input
            id="range-from"
            type="date"
            dir="ltr"
            value={value.from}
            max={value.to || undefined}
            onChange={(e) => e.target.value && onChange({ ...value, from: e.target.value })}
          />
        </div>
        <div className="grid min-w-36 flex-1 gap-1 sm:max-w-48">
          <Label htmlFor="range-to">تاریخ تک</Label>
          <Input
            id="range-to"
            type="date"
            dir="ltr"
            value={value.to}
            min={value.from || undefined}
            onChange={(e) => e.target.value && onChange({ ...value, to: e.target.value })}
          />
        </div>
        {children}
      </div>
      {presets.length > 0 && (
        <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
          {presets.map((p) => {
            const active = p.range.from === value.from && p.range.to === value.to
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => onChange(p.range)}
                className={cn(
                  "h-8 shrink-0 rounded-full border px-3.5 text-xs transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:border-primary/40 hover:text-primary",
                )}
              >
                {p.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
