"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BOTTOM_NAV, NAV_GROUPS, isActive } from "@/components/layout/nav-config"
import { cn } from "@/lib/utils"

/** سائیڈبار کے لنکس — usePathname کی وجہ سے <Suspense> کے اندر رکھیں */
export function SidebarNavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return <SidebarNav pathname={pathname} onNavigate={onNavigate} />
}

/** pathname کے بغیر (Suspense fallback) یا ساتھ */
export function SidebarNav({ pathname, onNavigate }: { pathname?: string | null; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-5">
      {NAV_GROUPS.map((group) => (
        <div key={group.title} className="flex flex-col gap-1">
          <div className="px-3 text-xs text-sidebar-foreground/55">{group.title}</div>
          {group.items.map((item) => {
            const active = isActive(pathname ?? null, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onNavigate={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex h-11 items-center gap-3 rounded-xl px-3 text-[0.95rem] transition-colors",
                  active
                    ? "bg-sidebar-primary font-semibold text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className={cn("size-[1.15rem] shrink-0", !active && "opacity-80")} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      ))}
    </nav>
  )
}

export function BottomNavLinks() {
  const pathname = usePathname()
  return <BottomNav pathname={pathname} />
}

export function BottomNav({ pathname }: { pathname?: string | null }) {
  return (
    <div className="grid grid-cols-5 items-end px-1">
      {BOTTOM_NAV.map((item) => {
        const active = isActive(pathname ?? null, item.href)
        const center = item.href === "/wazan-entry"
        if (center) {
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className="flex flex-col items-center gap-0.5 pb-1"
            >
              <span
                className={cn(
                  "-mt-6 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg ring-4 ring-background transition-transform active:scale-95",
                  active && "ring-primary/25",
                )}
              >
                <item.icon className="size-6" />
              </span>
              <span className={cn("text-[0.7rem] leading-[1.7]", active ? "font-semibold text-primary" : "text-muted-foreground")}>
                {item.short ?? item.label}
              </span>
            </Link>
          )
        }
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-xl py-1.5 transition-colors",
              active ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span className={cn("flex h-7 w-12 items-center justify-center rounded-full transition-colors", active && "bg-primary/12")}>
              <item.icon className="size-5" />
            </span>
            <span className={cn("text-[0.7rem] leading-[1.7]", active && "font-semibold")}>{item.short ?? item.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
