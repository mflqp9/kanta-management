import type { LucideIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  loading,
  highlight,
}: {
  title: string
  value: React.ReactNode
  sub?: React.ReactNode
  icon: LucideIcon
  loading?: boolean
  highlight?: boolean
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-4 ring-1 sm:p-5",
        highlight
          ? "bg-primary text-primary-foreground ring-primary shadow-lg shadow-primary/20"
          : "bg-card text-card-foreground ring-foreground/8 shadow-xs",
      )}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -end-8 -top-10 size-32 rounded-full",
          highlight ? "bg-primary-foreground/10" : "bg-primary/6",
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className={cn("text-sm", highlight ? "text-primary-foreground/85" : "text-muted-foreground")}>{title}</div>
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl",
            highlight ? "bg-primary-foreground/15" : "bg-primary/10 text-primary",
          )}
        >
          <Icon className="size-5" />
        </span>
      </div>
      <div className="relative mt-1">
        {loading ? (
          <Skeleton className={cn("h-9 w-32", highlight && "bg-primary-foreground/20")} />
        ) : (
          <div className="text-xl font-bold sm:text-2xl xl:text-[1.7rem]">{value}</div>
        )}
        {sub && (
          <div className={cn("mt-1 text-xs", highlight ? "text-primary-foreground/80" : "text-muted-foreground")}>
            {loading ? <Skeleton className={cn("h-4 w-24", highlight && "bg-primary-foreground/20")} /> : sub}
          </div>
        )}
      </div>
    </div>
  )
}
