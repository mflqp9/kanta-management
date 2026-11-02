import Link from "next/link"
import { BookOpenText, ChartColumnBig, ExternalLink, LogIn, MapPin, Phone, Printer, Scale, Sprout, UserRound } from "lucide-react"
import { PublicHeader } from "@/components/layout/public-header"
import { Button } from "@/components/ui/button"
import { BUSINESS, BUSINESS_PHONE_HREF, DEVELOPER } from "@/lib/config"

const SAHULIYAT = [
  { icon: Scale, title: "درست وزن", text: "ہر جنس کی گاڑیوں کا وزن — خالص وزن اور من کا خودکار حساب" },
  { icon: Printer, title: "فوری پرچی", text: "ہر وزن کی چھپی ہوئی اردو پرچی، ٹوکن نمبر کے ساتھ" },
  { icon: BookOpenText, title: "جمع بنام کھاتہ", text: "ہر کسان کا حساب اور بقایا محفوظ اور ایک نظر میں" },
  { icon: ChartColumnBig, title: "مل وار رپورٹ", text: "ہر مل کا وزن، کٹوتی اور رقم — تاریخ کے حساب سے" },
]

/** مرکزی صفحہ — سب کے لیے کھلا؛ یہاں سے لاگ ان */
export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <PublicHeader />

      <main className="flex-1">
        {/* ہیرو — ہیڈر کے نیچے پوری اسکرین؛ سہولیات اسکرول کرنے پر */}
        <section className="relative flex min-h-[calc(100dvh-4rem)] items-center overflow-hidden bg-sidebar text-sidebar-foreground">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_100%_0%,oklch(1_0_0/0.1),transparent_60%),radial-gradient(60%_50%_at_0%_100%,oklch(1_0_0/0.07),transparent_60%)]"
          />
          <div aria-hidden className="pointer-events-none absolute -bottom-32 -inset-e-32 size-96 rounded-full border-[3rem] border-sidebar-accent" />

          <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-center">
            <div>
              <span className="mb-7 inline-flex items-center gap-2 rounded-full bg-sidebar-accent px-4 py-1 text-sm ring-1 ring-sidebar-border">
                <Sprout className="size-4" />
                اجناس کا کانٹا
              </span>
              <h1 className="text-3xl font-bold leading-loose sm:text-4xl">{BUSINESS.naam}</h1>
              <p className="mt-4 text-lg font-semibold leading-[2.1] text-balance sm:text-xl">
                کپاس، گندم، چاول، گنا، سرسوں اور تل کی خرید و فروخت کا مرکز
              </p>
              {BUSINESS.malik && (
                <p className="mt-5 text-lg leading-[2.1]">
                  <span className="opacity-70">پروپرائٹر: </span>
                  <span className="font-semibold">{BUSINESS.malik}</span>
                </p>
              )}
              <p className="mt-5 max-w-xl text-lg opacity-85">ہر جنس کا وزن، پرچی اور کھاتہ — ایک ہی جگہ</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                >
                  <Link href="/login">
                    <LogIn className="size-5 rtl:-scale-x-100" />
                    لاگ ان کریں
                  </Link>
                </Button>
                {BUSINESS_PHONE_HREF && (
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-sidebar-border bg-transparent text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground dark:border-sidebar-border dark:bg-transparent dark:hover:bg-sidebar-accent"
                  >
                    <a href={BUSINESS_PHONE_HREF}>
                      <Phone className="size-5" />
                      کال کریں
                    </a>
                  </Button>
                )}
              </div>
            </div>

            <div className="rounded-3xl bg-sidebar-accent p-5 ring-1 ring-sidebar-border sm:p-6">
              <h2 className="mb-4 text-lg font-bold">رابطہ</h2>
              <ul className="grid gap-3">
                {BUSINESS.malik && (
                  <li className="flex items-center gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
                      <UserRound className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs opacity-70">پروپرائٹر</div>
                      <div>{BUSINESS.malik}</div>
                    </div>
                  </li>
                )}
                <li className="flex items-center gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
                    <MapPin className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs opacity-70">پتہ</div>
                    <div>{BUSINESS.pata}</div>
                  </div>
                </li>
                {BUSINESS_PHONE_HREF && (
                  <li className="flex items-center gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
                      <Phone className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs opacity-70">فون</div>
                      <a href={BUSINESS_PHONE_HREF} dir="ltr" className="font-num text-lg hover:underline">
                        {BUSINESS.phone}
                      </a>
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <h2 className="text-2xl font-bold">ہماری سہولیات</h2>
          <p className="text-muted-foreground">ہر گاڑی کا وزن اور ہر کسان کا حساب کمپیوٹر پر محفوظ</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SAHULIYAT.map((s) => (
              <div key={s.title} className="rounded-2xl border bg-card p-5 text-card-foreground">
                <span className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <s.icon className="size-6" />
                </span>
                <h3 className="font-bold">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-1 px-4 py-6 text-center text-sm text-muted-foreground sm:flex-row sm:justify-between">
          <span>
            {BUSINESS.naam} · {BUSINESS.pata}
          </span>
          {/* بنانے والے کا نام — مالک کی ہدایت پر انگریزی میں */}
          <span dir="ltr" lang="en" className="font-num">
            This product is developed by{" "}
            <a
              href={DEVELOPER.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-primary underline-offset-4 hover:underline"
            >
              {DEVELOPER.naam}
              <ExternalLink className="size-3.5" />
            </a>
          </span>
        </div>
      </footer>
    </div>
  )
}
