import Link from "next/link"
import { Plus } from "lucide-react"
import { Suspense } from "react"
import { AdminUser } from "@/components/layout/admin-user"
import { Brand, BrandMark } from "@/components/layout/brand"
import { LogoutButton } from "@/components/layout/logout-button"
import { MobileMenu } from "@/components/layout/mobile-menu"
import { BottomNav, BottomNavLinks, SidebarNav, SidebarNavLinks } from "@/components/layout/nav-links"
import { TodayLabel } from "@/components/layout/today-label"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { BUSINESS } from "@/lib/config"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      {/* ڈیسک ٹاپ سائیڈبار (دائیں طرف) */}
      <aside className="fixed inset-y-0 start-0 z-30 hidden w-68 flex-col overflow-hidden bg-sidebar text-sidebar-foreground lg:flex print:hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_60%_at_100%_0%,oklch(1_0_0/0.09),transparent_60%)]"
        />
        <div className="relative px-5 pt-6 pb-5">
          <Brand />
        </div>
        <div className="sidebar-scrollbar relative flex-1 overflow-y-auto px-3 pb-4">
          <Suspense fallback={<SidebarNav />}>
            <SidebarNavLinks />
          </Suspense>
        </div>
        <div className="relative flex flex-col gap-2 border-t border-sidebar-border p-3">
          <Button
            asChild
            size="lg"
            className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
          >
            <Link href="/wazan-entry">
              <Plus className="size-5" />
              نیا وزن اندراج
            </Link>
          </Button>
          <LogoutButton className="text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" />
        </div>
      </aside>

      <div className="flex min-h-dvh flex-col lg:ps-68 print:ps-0">
        {/* اوپر والی پٹی */}
        <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur-md supports-backdrop-filter:bg-background/70 print:hidden">
          <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-2 px-3 sm:px-6">
            <MobileMenu />
            <Link href="/dashboard" className="flex min-w-0 items-center gap-2.5 lg:hidden">
              <BrandMark className="size-9 rounded-xl bg-primary text-primary-foreground [&_svg]:size-5" />
              <span className="text-sm font-bold leading-loose text-balance sm:text-base">{BUSINESS.naam}</span>
            </Link>
            <TodayLabel className="hidden lg:flex" />
            <div className="ms-auto flex items-center gap-1">
              <ThemeToggle />
              <LogoutButton compact className="lg:hidden" />
              <AdminUser className="ms-1 hidden max-w-60 border-s ps-3 md:flex" />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-3 pt-4 pb-28 sm:px-6 sm:pt-6 lg:pb-10 print:max-w-none print:p-0">
          {children}
        </main>
      </div>

      {/* موبائل / ٹیبلٹ کا نیچے والا مینو */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden print:hidden">
        <div className="mx-auto max-w-xl">
          <Suspense fallback={<BottomNav />}>
            <BottomNavLinks />
          </Suspense>
        </div>
      </nav>
    </div>
  )
}
