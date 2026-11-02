"use client"

import { ThemeProvider } from "next-themes"
import { SWRConfig } from "swr"
import { DirectionProvider } from "@/components/ui/direction"
import { Toaster } from "@/components/ui/sonner"
import { PrintProvider } from "@/components/print/print-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <DirectionProvider dir="rtl">
        <SWRConfig value={{ revalidateOnFocus: true, keepPreviousData: true, errorRetryCount: 2 }}>
          <PrintProvider>{children}</PrintProvider>
        </SWRConfig>
        <Toaster position="top-center" dir="rtl" richColors closeButton />
      </DirectionProvider>
    </ThemeProvider>
  )
}
