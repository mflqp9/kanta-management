import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
  className,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  icon?: LucideIcon
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div className="flex min-w-0 items-center gap-3">
        {Icon && (
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15 sm:size-12">
            <Icon className="size-5 sm:size-6" />
          </span>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold sm:text-2xl">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 print:hidden">{actions}</div>}
    </div>
  )
}
