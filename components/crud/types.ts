import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import type { TABLE_ORDER } from "@/lib/queries"

export type CrudTable = keyof typeof TABLE_ORDER

export type FieldDef = {
  name: string
  label: string
  type?: "text" | "number" | "tel" | "select" | "textarea"
  /** select کے اختیارات */
  options?: string[]
  /** ٹیکسٹ خانے کے لیے تجاویز (datalist) */
  suggestions?: string[]
  required?: boolean
  placeholder?: string
  /** نئے ریکارڈ میں پہلے سے بھرا ہوا */
  defaultValue?: string
  /** نمبر / موبائل — بائیں سے دائیں */
  ltr?: boolean
  /** دو کالم کی پوری چوڑائی */
  full?: boolean
  unit?: string
  hint?: string
}

export type ColumnDef<T> = {
  label: string
  cell: (row: T) => ReactNode
  className?: string
}

export type EntityConfig<T extends { id: string }> = {
  table: CrudTable
  title: string
  description: string
  icon: LucideIcon
  singular: string
  /** مؤنث نام (پارٹی، گاڑی، مل) — "نئی … محفوظ ہو گئی" */
  muannas?: boolean
  fields: FieldDef[]
  columns: ColumnDef<T>[]
  searchText: (row: T) => string
  /** موبائل کارڈ */
  cardTitle: (row: T) => ReactNode
  cardSubtitle?: (row: T) => ReactNode
  cardMeta?: (row: T) => ReactNode
  rowActions?: (row: T) => ReactNode
  deleteDescription: (row: T) => ReactNode
  footer?: (rows: T[]) => ReactNode
}
