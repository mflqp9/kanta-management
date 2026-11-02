import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 px-4 py-12 text-center", className)}>
      <span className="mb-1 flex size-14 items-center justify-center rounded-2xl bg-primary/8 text-primary">
        <Icon className="size-7" />
      </span>
      <div className="text-base font-semibold">{title}</div>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-8 text-center text-sm text-destructive">
      <div>{message}</div>
      {onRetry && (
        <button type="button" onClick={onRetry} className="font-semibold underline underline-offset-4">
          دوبارہ کوشش کریں
        </button>
      )}
    </div>
  )
}
