"use client"

import { useSyncExternalStore } from "react"
import { todayPK } from "@/lib/format"

function subscribe(onChange: () => void) {
  // آدھی رات کو تاریخ بدلنے پر یا ٹیب پر واپس آنے پر تازہ کریں
  const timer = window.setInterval(onChange, 60_000)
  document.addEventListener("visibilitychange", onChange)
  return () => {
    window.clearInterval(timer)
    document.removeEventListener("visibilitychange", onChange)
  }
}

/**
 * پاکستان کی آج کی تاریخ "YYYY-MM-DD"۔ سرور / prerender پر خالی ("") ہوتی ہے
 * تاکہ بلڈ کے وقت کی تاریخ HTML میں نہ جم جائے۔
 */
export function useToday() {
  return useSyncExternalStore(subscribe, todayPK, () => "")
}
