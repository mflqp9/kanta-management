"use client"

import { RotateCcw, TriangleAlert } from "lucide-react"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function AppError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <TriangleAlert className="size-7" />
      </span>
      <h1 className="text-xl font-bold">کچھ غلط ہو گیا</h1>
      <p className="max-w-sm text-sm text-muted-foreground">صفحہ لوڈ نہیں ہو سکا۔ انٹرنیٹ چیک کر کے دوبارہ کوشش کریں۔</p>
      <Button onClick={() => retry()}>
        <RotateCcw />
        دوبارہ کوشش کریں
      </Button>
    </div>
  )
}
