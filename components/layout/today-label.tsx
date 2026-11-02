"use client"

import { CalendarDays } from "lucide-react"
import { useToday } from "@/hooks/use-today"
import { formatDin, formatTareekh } from "@/lib/format"
import { cn } from "@/lib/utils"

export function TodayLabel({ className }: { className?: string }) {
  const today = useToday()
  return (
    <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
      <CalendarDays className="size-4 shrink-0" />
      <span className="min-w-28">{today ? `${formatDin(today)}، ${formatTareekh(today)}` : " "}</span>
    </div>
  )
}
