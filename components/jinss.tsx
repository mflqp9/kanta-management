"use client"

import { Bean, Flower, Flower2, Leaf, Package, Sprout, Wheat, type LucideIcon } from "lucide-react"
import { useId } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Jinss } from "@/lib/database.types"
import { JINSS_LABEL, JINSS_LIST } from "@/lib/format"
import { cn } from "@/lib/utils"

/** ہر جنس کا نشان — وزن اندراج، فلٹر، ڈیش بورڈ اور پرچیوں میں ایک جیسا */
export const JINSS_ICON: Record<Jinss, LucideIcon> = {
  ganna: Leaf,
  kapaas: Flower2,
  gandum: Wheat,
  chawal: Sprout,
  sarson: Flower,
  til: Bean,
  digar: Package,
}

export type JinssFilterValue = Jinss | "all"

/** فلٹر: سب جنس یا ایک جنس — DateRangeFilter کے اندر تاریخ کے خانوں کے ساتھ */
export function JinssFilter({
  value,
  onChange,
  className,
}: {
  value: JinssFilterValue
  onChange: (value: JinssFilterValue) => void
  className?: string
}) {
  const id = useId()
  return (
    <div className={cn("grid min-w-36 flex-1 gap-1 sm:max-w-48", className)}>
      <Label htmlFor={id}>جنس</Label>
      <Select value={value} onValueChange={(v) => onChange(v as JinssFilterValue)}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">سب جنس</SelectItem>
          {JINSS_LIST.map((j) => {
            const Icon = JINSS_ICON[j]
            return (
              <SelectItem key={j} value={j}>
                <Icon className="text-primary" />
                {JINSS_LABEL[j]}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    </div>
  )
}
