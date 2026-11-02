"use client"

import { Loader2, Save } from "lucide-react"
import { useId, useLayoutEffect, useState } from "react"
import { toast } from "sonner"
import { mutate } from "swr"
import type { CrudTable, FieldDef } from "@/components/crud/types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toNumber } from "@/lib/calc"
import { urduError } from "@/lib/errors"
import { getSupabase } from "@/lib/supabaseClient"
import { cn } from "@/lib/utils"

type Values = Record<string, string>

function initialValues(fields: FieldDef[], record?: Record<string, unknown> | null, prefill?: Values): Values {
  return Object.fromEntries(
    fields.map((f) => {
      const v = record?.[f.name]
      return [f.name, v === null || v === undefined ? (prefill?.[f.name] ?? f.defaultValue ?? "") : String(v)]
    }),
  )
}

function toPayload(fields: FieldDef[], values: Values) {
  return Object.fromEntries(
    fields.map((f) => {
      const raw = values[f.name]?.trim() ?? ""
      if (f.type === "number") return [f.name, toNumber(raw)]
      return [f.name, raw === "" ? null : raw]
    }),
  )
}

/**
 * نیا ریکارڈ / ترمیم کا ڈائیلاگ — fields کی فہرست سے فارم خود بنتا ہے۔
 * محفوظ ہونے پر SWR کی فہرست (key = ٹیبل) تازہ ہو جاتی ہے۔
 */
export function RecordFormDialog<T extends { id: string }>({
  open,
  onOpenChange,
  table,
  singular,
  muannas,
  fields,
  record,
  prefill,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: CrudTable
  singular: string
  /** مؤنث نام (پارٹی، گاڑی، مل) */
  muannas?: boolean
  fields: FieldDef[]
  record?: T | null
  prefill?: Values
  onSaved?: (row: T) => void
}) {
  const isEdit = Boolean(record)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? `${singular} میں ترمیم کریں` : `${muannas ? "نئی" : "نیا"} ${singular} شامل کریں`}</DialogTitle>
          <DialogDescription>ستارے (*) والے خانے ضروری ہیں۔</DialogDescription>
        </DialogHeader>
        {open && (
          <RecordForm
            key={record?.id ?? "new"}
            table={table}
            singular={singular}
            muannas={muannas}
            fields={fields}
            record={record}
            prefill={prefill}
            onDone={(row) => {
              onOpenChange(false)
              onSaved?.(row as T)
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function RecordForm<T extends { id: string }>({
  table,
  singular,
  muannas,
  fields,
  record,
  prefill,
  onDone,
}: {
  table: CrudTable
  singular: string
  muannas?: boolean
  fields: FieldDef[]
  record?: T | null
  prefill?: Values
  onDone: (row: T) => void
}) {
  const formId = useId()
  const [values, setValues] = useState<Values>(() =>
    initialValues(fields, record as Record<string, unknown> | null, prefill),
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)

  // Activity سے چھپنے پر غلطیوں کے پیغام صاف
  useLayoutEffect(() => () => setErrors({}), [])

  function set(name: string, value: string) {
    setValues((v) => ({ ...v, [name]: value }))
    if (errors[name]) setErrors((prev) => Object.fromEntries(Object.entries(prev).filter(([key]) => key !== name)))
  }

  function validate() {
    const next: Record<string, string> = {}
    for (const f of fields) {
      const raw = values[f.name]?.trim() ?? ""
      if (f.required && !raw) next[f.name] = `${f.label} لکھنا ضروری ہے`
      else if (f.type === "number" && raw && (!Number.isFinite(Number(raw.replace(/,/g, ""))) || toNumber(raw) < 0))
        next[f.name] = "درست نمبر لکھیں"
      else if (f.type === "tel" && raw && !/^[0-9+\-\s]{7,15}$/.test(raw)) next[f.name] = "درست موبائل نمبر لکھیں"
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setBusy(true)
    const payload = toPayload(fields, values)
    const query = record
      ? getSupabase().from(table).update(payload as never).eq("id", record.id)
      : getSupabase().from(table).insert(payload as never)
    const { data, error } = await query.select().single()
    setBusy(false)
    if (error) {
      toast.error(urduError(error))
      return
    }
    toast.success(
      record
        ? `${singular} کا ریکارڈ اپ ڈیٹ ہو گیا`
        : muannas
          ? `نئی ${singular} محفوظ ہو گئی`
          : `نیا ${singular} محفوظ ہو گیا`,
    )
    await mutate(table)
    onDone(data as unknown as T)
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => {
          const id = `${formId}-${f.name}`
          const error = errors[f.name]
          return (
            <div key={f.name} className={cn("grid gap-1.5", (f.full || f.type === "textarea") && "sm:col-span-2")}>
              <Label htmlFor={id}>
                {f.label}
                {f.required && <span className="text-destructive">*</span>}
                {f.unit && <span className="text-xs font-normal text-muted-foreground">({f.unit})</span>}
              </Label>
              {f.type === "select" ? (
                <Select value={values[f.name] || undefined} onValueChange={(v) => set(f.name, v)}>
                  <SelectTrigger id={id} className="w-full" aria-invalid={Boolean(error) || undefined}>
                    <SelectValue placeholder={f.placeholder ?? "منتخب کریں"} />
                  </SelectTrigger>
                  <SelectContent>
                    {f.options?.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : f.type === "textarea" ? (
                <Textarea
                  id={id}
                  value={values[f.name]}
                  placeholder={f.placeholder}
                  onChange={(e) => set(f.name, e.target.value)}
                  aria-invalid={Boolean(error) || undefined}
                />
              ) : (
                <>
                  <Input
                    id={id}
                    type={f.type === "tel" ? "tel" : "text"}
                    inputMode={f.type === "number" ? "decimal" : f.type === "tel" ? "tel" : undefined}
                    dir={f.ltr || f.type === "number" || f.type === "tel" ? "ltr" : undefined}
                    className={cn("h-11", (f.ltr || f.type === "number" || f.type === "tel") && "text-end")}
                    value={values[f.name]}
                    placeholder={f.placeholder}
                    list={f.suggestions ? `${id}-list` : undefined}
                    autoComplete="off"
                    onChange={(e) => set(f.name, e.target.value)}
                    aria-invalid={Boolean(error) || undefined}
                  />
                  {f.suggestions && (
                    <datalist id={`${id}-list`}>
                      {f.suggestions.map((s) => (
                        <option key={s} value={s} />
                      ))}
                    </datalist>
                  )}
                </>
              )}
              {error ? (
                <p className="text-xs text-destructive">{error}</p>
              ) : (
                f.hint && <p className="text-xs text-muted-foreground">{f.hint}</p>
              )}
            </div>
          )
        })}
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={busy}>
            منسوخ کریں
          </Button>
        </DialogClose>
        <Button type="submit" disabled={busy} className="min-w-32">
          {busy ? <Loader2 className="animate-spin" /> : <Save />}
          محفوظ کریں
        </Button>
      </DialogFooter>
    </form>
  )
}
