import { UserRound } from "lucide-react"
import { ADMIN_NAAM } from "@/lib/config"
import { ADMIN_EMAIL } from "@/lib/supabaseClient"
import { cn } from "@/lib/utils"

/** لاگ ان شدہ ایڈمن — نام اور ای میل (proxy.ts صرف اسی ای میل کو اندر آنے دیتا ہے) */
export function AdminUser({ className, iconClassName }: { className?: string; iconClassName?: string }) {
  return (
    <div className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary",
          iconClassName,
        )}
      >
        <UserRound className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate-nastaliq text-sm font-semibold leading-[1.7]">{ADMIN_NAAM}</div>
        {ADMIN_EMAIL && (
          <div dir="ltr" className="truncate text-end font-num text-xs leading-[1.7] opacity-70">
            {ADMIN_EMAIL}
          </div>
        )}
      </div>
    </div>
  )
}
