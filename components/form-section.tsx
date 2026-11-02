import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

/** فارم کا ایک حصہ — عنوان + آئیکن کے ساتھ کارڈ */
export function FormSection({
  title,
  icon: Icon,
  step,
  action,
  children,
  className,
}: {
  title: string
  icon: LucideIcon
  step?: number
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn("rounded-2xl bg-card p-4 ring-1 ring-foreground/8 shadow-xs sm:p-5", className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="relative flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-[1.1rem]" />
            {step && (
              <span className="absolute -end-1 -top-1 flex size-4.5 items-center justify-center rounded-full bg-primary font-num text-[0.65rem] leading-none text-primary-foreground ring-2 ring-card">
                {step}
              </span>
            )}
          </span>
          <h2 className="text-base font-semibold">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

/** لیبل + خانہ + غلطی کا پیغام */
export function Field({
  label,
  htmlFor,
  required,
  error,
  hint,
  className,
  children,
}: {
  label: React.ReactNode
  htmlFor?: string
  required?: boolean
  error?: string
  hint?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("grid content-start gap-1.5", className)}>
      <label htmlFor={htmlFor} className="flex items-center gap-1 text-sm font-medium">
        {label}
        {required && <span className="text-destructive">*</span>}
      </label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : hint ? <div className="text-xs text-muted-foreground">{hint}</div> : null}
    </div>
  )
}
