"use client"

import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"

/** پوری رہنمائی A4 پر پرنٹ */
export function PrintButton() {
  return (
    <Button size="lg" variant="outline" onClick={() => window.print()}>
      <Printer className="size-5" />
      پرنٹ کریں
    </Button>
  )
}
