import Link from "next/link"
import {
  BookOpenText,
  Building2,
  ChartColumnBig,
  ExternalLink,
  Globe,
  LogIn,
  MapPin,
  MessageCircle,
  Phone,
  Printer,
  Scale,
  Sprout,
  UserRound,
} from "lucide-react"
import { PublicHeader } from "@/components/layout/public-header"
import { Button } from "@/components/ui/button"
import { BUSINESS, BUSINESS_PHONE_HREF, DEVELOPER, DEVELOPER_PHONE_HREF, DEVELOPER_WHATSAPP_URL } from "@/lib/config"

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

        {/* سافٹ ویئر بنانے والی کمپنی کا تعارف اور رابطہ */}
        <section aria-labelledby="developer-title" className="border-t bg-muted/40">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:items-center">
            <div>
              <p className="text-sm text-muted-foreground">یہ سافٹ ویئر تیار کیا ہے</p>
              <h2 id="developer-title" className="text-2xl font-bold text-primary">
                <a
                  href={DEVELOPER.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  dir="ltr"
                  lang="en"
                  className="font-num underline-offset-4 hover:underline"
                >
                  {DEVELOPER.naam}
                </a>
              </h2>
              <p className="mt-1 max-w-prose text-sm text-muted-foreground">
                کانٹا کھاتہ سسٹم <span lang="en">{DEVELOPER.naam}</span> نے تیار کیا ہے، اور سافٹ ویئر کی دیکھ بھال اور مدد بھی وہی کرتی ہے۔
                اپنے کاروبار کے لیے ایسا سافٹ ویئر بنوانا ہو تو رابطہ کریں۔
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild>
                  <a href={DEVELOPER_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                    <MessageCircle />
                    واٹس ایپ پر رابطہ کریں
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <a href={DEVELOPER.url} target="_blank" rel="noopener noreferrer">
                    <Globe />
                    ویب سائٹ دیکھیں
                  </a>
                </Button>
              </div>
            </div>

            <ul className="grid gap-2 text-sm" aria-label="رابطہ">
              <DeveloperRabta icon={<Building2 className="size-4" />} label="کمپنی">
                <span dir="ltr" lang="en" className="font-num font-semibold">
                  {DEVELOPER.naam}
                </span>
              </DeveloperRabta>
              <DeveloperRabta icon={<Globe className="size-4" />} label="ویب سائٹ">
                <a href={DEVELOPER.url} target="_blank" rel="noopener noreferrer" dir="ltr" className="font-num text-primary underline-offset-4 hover:underline">
                  {DEVELOPER.website}
                </a>
              </DeveloperRabta>
              <DeveloperRabta icon={<Phone className="size-4" />} label="موبائل">
                <a href={DEVELOPER_PHONE_HREF} dir="ltr" className="font-num text-primary underline-offset-4 hover:underline">
                  {DEVELOPER.phone}
                </a>
              </DeveloperRabta>
              <DeveloperRabta icon={<MessageCircle className="size-4" />} label="واٹس ایپ">
                <a href={DEVELOPER_WHATSAPP_URL} target="_blank" rel="noopener noreferrer" dir="ltr" className="font-num text-primary underline-offset-4 hover:underline">
                  {DEVELOPER.phone}
                </a>
              </DeveloperRabta>
              <DeveloperRabta icon={<FacebookIcon />} label="فیس بک">
                <a href={DEVELOPER.facebookUrl} target="_blank" rel="noopener noreferrer" dir="ltr" className="font-num text-primary underline-offset-4 hover:underline">
                  {DEVELOPER.facebook}
                </a>
              </DeveloperRabta>
            </ul>
          </div>

          <div className="border-t">
            <p className="mx-auto max-w-6xl px-4 py-3 text-center text-xs text-muted-foreground sm:px-6">
              سافٹ ویئر کے جملہ حقوق محفوظ ہیں ©{" "}
              <span dir="ltr" lang="en" className="font-num">
                {DEVELOPER.naam}
              </span>
            </p>
          </div>
        </section>
      </footer>
    </div>
  )
}

/** رابطے کی ایک سطر: نشان، عنوان اور قیمت */
function DeveloperRabta({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <li className="flex min-h-10 items-center gap-3 rounded-xl bg-card px-3 py-1.5 ring-1 ring-foreground/8">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</span>
      <span className="w-16 shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 truncate">{children}</span>
    </li>
  )
}

/** فیس بک کا نشان (lucide میں برانڈ کے نشان نہیں) */
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4 fill-current">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  )
}
