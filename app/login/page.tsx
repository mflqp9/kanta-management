import type { Metadata } from "next"
import Link from "next/link"
import { BookOpenText, House, Printer, Scale, ShieldCheck } from "lucide-react"
import { BrandMark } from "@/components/layout/brand"
import { LoginForm } from "@/components/login-form"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { BUSINESS } from "@/lib/config"

export const metadata: Metadata = { title: "لاگ ان" }

const FEATURES = [
  { icon: Scale, text: "وزن پرچی — خالص وزن، من اور رقم کا خودکار حساب" },
  { icon: BookOpenText, text: "جمع بنام کھاتہ — ہر کسان کا بقایا ایک نظر میں" },
  { icon: Printer, text: "تھرمل پرنٹر پر اردو پرچی" },
]

export default function LoginPage() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* فارم */}
      <div className="relative flex flex-col">
        <div className="flex items-center justify-between gap-2 p-4 sm:p-6">
          <Link href="/" className="flex min-w-0 items-center gap-2.5 lg:invisible">
            <BrandMark className="size-10 bg-primary text-primary-foreground" />
            <span className="text-sm font-bold leading-loose text-balance sm:text-base">{BUSINESS.naam}</span>
          </Link>
          <div className="flex shrink-0 items-center gap-1">
            <Button asChild variant="ghost">
              <Link href="/">
                <House />
                مرکزی صفحہ
              </Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center px-4 pb-16 sm:px-6">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                <ShieldCheck className="size-7" />
              </span>
              <h1 className="text-2xl font-bold sm:text-3xl">خوش آمدید</h1>
              <p className="text-muted-foreground">اپنے کانٹے کے کھاتے میں داخل ہونے کے لیے پاس ورڈ لکھیں۔</p>
            </div>
            <LoginForm />
          </div>
        </div>
        <p className="pb-5 text-center text-xs text-muted-foreground">
          {BUSINESS.naam} · {BUSINESS.pata}
        </p>
      </div>

      {/* برانڈ پینل (ڈیسک ٹاپ) */}
      <div className="relative hidden overflow-hidden bg-sidebar text-sidebar-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_0%_0%,oklch(1_0_0/0.1),transparent_60%),radial-gradient(60%_50%_at_100%_100%,oklch(1_0_0/0.07),transparent_60%)]" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 -start-24 size-96 rounded-full border-[3rem] border-sidebar-accent" />
        <div className="relative flex items-center gap-3">
          <BrandMark className="size-14 rounded-2xl [&_svg]:size-7" />
          <div>
            <div className="text-2xl font-bold">{BUSINESS.naam}</div>
            <div className="text-sm opacity-70">{BUSINESS.pata}</div>
          </div>
        </div>
        <div className="relative max-w-md">
          <h2 className="mb-6 text-3xl font-bold leading-[1.9]">ہر جنس کا وزن، پرچی اور کھاتہ — ایک ہی جگہ</h2>
          <ul className="grid gap-3">
            {FEATURES.map((f) => (
              <li key={f.text} className="flex items-center gap-3 rounded-2xl bg-sidebar-accent p-3 ring-1 ring-sidebar-border">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
                  <f.icon className="size-5" />
                </span>
                <span>{f.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative text-sm opacity-60">صرف مالک کے لیے — محفوظ لاگ ان</div>
      </div>
    </div>
  )
}
