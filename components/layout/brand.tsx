import { Scale } from "lucide-react"
import { BUSINESS } from "@/lib/config"
import { cn } from "@/lib/utils"

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm",
        className,
      )}
    >
      <Scale className="size-6" />
    </span>
  )
}

export function Brand({ subtitle = "وزن پرچی و جمع بنام کھاتہ" }: { subtitle?: string }) {
  return (
    <div className="flex items-center gap-3">
      <BrandMark />
      <div className="min-w-0">
        <div className="text-lg font-bold leading-loose text-balance">{BUSINESS.naam}</div>
        <div className="truncate-nastaliq text-xs leading-[1.7] opacity-70">{subtitle}</div>
      </div>
    </div>
  )
}
