import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, Noto_Nastaliq_Urdu } from "next/font/google"
import { Providers } from "@/components/providers"
import { BUSINESS } from "@/lib/config"
import "./globals.css"

const nastaliq = Noto_Nastaliq_Urdu({
  variable: "--font-nastaliq",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: BUSINESS.naam,
    template: `%s — ${BUSINESS.naam}`,
  },
  description: `${BUSINESS.naam} — وزن پرچی اور جمع بنام کھاتہ، ${BUSINESS.pata}`,
  applicationName: BUSINESS.naam,
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#166534" },
    { media: "(prefers-color-scheme: dark)", color: "#0c1612" },
  ],
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      dir="rtl"
      lang="ur"
      suppressHydrationWarning
      className={`${nastaliq.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
