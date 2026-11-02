import Link from "next/link"
import { GraduationCap, LogIn } from "lucide-react"
import { BrandMark } from "@/components/layout/brand"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { BUSINESS } from "@/lib/config"
import { cn } from "@/lib/utils"

/** لاگ ان کے بغیر کھلنے والے صفحات (مرکزی صفحہ، رہنمائی) کی اوپر والی پٹی */
export function PublicHeader({ active }: { active?: "guide" }) {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur-md supports-backdrop-filter:bg-background/70 print:hidden">
      {/* موبائل پر جگہ کم: پیڈنگ اور فاصلے چھوٹے تاکہ کاروبار کا نام دو سطروں میں پورا آئے */}
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-1.5 px-3 sm:gap-2 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-2.5">
          <BrandMark className="size-9 shrink-0 rounded-xl bg-primary text-primary-foreground [&_svg]:size-5" />
          <span className="text-sm font-bold leading-loose text-balance sm:text-base">{BUSINESS.naam}</span>
        </Link>
        <nav className="ms-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
          <Button
            asChild
            variant="ghost"
            className={cn("max-sm:size-10 max-sm:px-0", active === "guide" && "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary")}
          >
            <Link href="/guide" aria-current={active === "guide" ? "page" : undefined} aria-label="رہنمائی">
              <GraduationCap className="size-5" />
              <span className="max-sm:sr-only">رہنمائی</span>
            </Link>
          </Button>
          <ThemeToggle />
          {/* بہت تنگ اسکرین (360px سے کم) پر صرف نشان */}
          <Button asChild className="max-[22.5rem]:size-10 max-[22.5rem]:px-0">
            <Link href="/login" aria-label="لاگ ان">
              <LogIn className="rtl:-scale-x-100" />
              <span className="max-[22.5rem]:sr-only">لاگ ان</span>
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
