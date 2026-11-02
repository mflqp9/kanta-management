"use client"

import { createContext, use, useCallback, useEffect, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"

type PrintContextValue = {
  /** 80mm تھرمل پرنٹر کے لیے پرچی پرنٹ کریں */
  printSlip: (slip: ReactNode) => void
}

const PrintContext = createContext<PrintContextValue | null>(null)

const SLIP_PAGE_CSS = "@page { size: 80mm auto; margin: 0; }"

export function PrintProvider({ children }: { children: ReactNode }) {
  const [job, setJob] = useState<{ id: number; slip: ReactNode } | null>(null)

  const printSlip = useCallback((slip: ReactNode) => {
    setJob((prev) => ({ id: (prev?.id ?? 0) + 1, slip }))
  }, [])

  useEffect(() => {
    if (!job) return
    const html = document.documentElement
    const pageStyle = document.createElement("style")
    pageStyle.textContent = SLIP_PAGE_CSS
    document.head.append(pageStyle)
    html.dataset.print = "slip"

    let cancelled = false
    const finish = () => {
      delete html.dataset.print
      pageStyle.remove()
      setJob((current) => (current?.id === job.id ? null : current))
    }
    window.addEventListener("afterprint", finish, { once: true })

    // فونٹ لوڈ اور پرچی رینڈر ہونے کے بعد پرنٹ ڈائیلاگ کھولیں
    document.fonts.ready.then(() => {
      requestAnimationFrame(() => {
        if (!cancelled) window.print()
      })
    })

    return () => {
      cancelled = true
      window.removeEventListener("afterprint", finish)
      delete html.dataset.print
      pageStyle.remove()
    }
  }, [job])

  return (
    <PrintContext value={{ printSlip }}>
      {children}
      {job && createPortal(<div id="slip-print-root">{job.slip}</div>, document.body)}
    </PrintContext>
  )
}

export function usePrint() {
  const ctx = use(PrintContext)
  if (!ctx) throw new Error("usePrint must be used inside <PrintProvider>")
  return ctx
}
