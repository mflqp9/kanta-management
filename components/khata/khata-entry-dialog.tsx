"use client"

import { ArrowDownToLine, ArrowUpFromLine, Loader2, Save } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Field } from "@/components/form-section"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toNumber } from "@/lib/calc"
import type { KhataIndraj, TablesInsert } from "@/lib/database.types"
import { urduError } from "@/lib/errors"
import { refreshAll } from "@/lib/queries"
import { getSupabase } from "@/lib/supabaseClient"
import { cn } from "@/lib/utils"

type Side = "banam" | "jama"

const QISMEN: Record<Side, string[]> = {
  banam: ["نقد ادائیگی", "بینک ادائیگی", "چیک ادائیگی", "ایڈوانس", "کھاد / بیج / دوائی", "دیگر"],
  jama: ["نقد وصولی", "بینک وصولی", "چیک وصولی", "مال کی وصولی", "دیگر"],
}

/** قسم کے حساب سے تفصیل کی مثال — چیک ہو تو چیک نمبر اور بینک یاد دلائیں */
function tafseelPlaceholder(qism: string) {
  if (qism.startsWith("چیک")) return "مثلاً: چیک نمبر 123456، حبیب بینک"
  if (qism.startsWith("بینک")) return "مثلاً: بینک ٹرانسفر، حبیب بینک"
  return "مثلاً: نقد ادائیگی بذریعہ منشی"
}

/** کھاتے میں دستی اندراج (ادائیگی / وصولی) — نیا یا ترمیم */
export function KhataEntryDialog({
  open,
  onOpenChange,
  partyId,
  partyName,
  entry,
  today,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  partyId: string
  partyName: string
  entry?: KhataIndraj | null
  today: string
  onSaved: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{entry ? "اندراج میں ترمیم کریں" : "نیا اندراج شامل کریں"}</DialogTitle>
          <DialogDescription>{partyName} کا کھاتہ</DialogDescription>
        </DialogHeader>
        {open && (
          <EntryForm
            key={entry?.id ?? "new"}
            partyId={partyId}
            entry={entry}
            today={today}
            onDone={() => {
              onOpenChange(false)
              onSaved()
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function EntryForm({
  partyId,
  entry,
  today,
  onDone,
}: {
  partyId: string
  entry?: KhataIndraj | null
  today: string
  onDone: () => void
}) {
  const initialSide: Side = entry && entry.jama > 0 ? "jama" : "banam"
  const [side, setSide] = useState<Side>(initialSide)
  const [tareekh, setTareekh] = useState(entry?.tareekh ?? today)
  const [raqam, setRaqam] = useState(entry ? String(entry.jama > 0 ? entry.jama : entry.banam) : "")
  const [qism, setQism] = useState(entry?.qism ?? QISMEN[initialSide][0])
  const [tafseel, setTafseel] = useState(entry?.tafseel ?? "")
  const [error, setError] = useState<string | null>(null)
  const [dateError, setDateError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  function chooseSide(next: Side) {
    setSide(next)
    if (!QISMEN[next].includes(qism)) setQism(QISMEN[next][0])
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const amount = toNumber(raqam)
    const futureDate = Boolean(tareekh && today && tareekh > today)
    if (!(amount > 0)) setError("رقم لکھیں")
    // date خانے کا max صرف کیلنڈر روکتا ہے، ہاتھ سے لکھی تاریخ نہیں
    if (futureDate) setDateError("آنے والی تاریخ درج نہیں ہو سکتی")
    if (!(amount > 0) || futureDate) return
    setBusy(true)
    const payload: TablesInsert<"khata_ledger"> = {
      party_id: partyId,
      tareekh: tareekh || today,
      jama: side === "jama" ? amount : 0,
      banam: side === "banam" ? amount : 0,
      qism,
      tafseel: tafseel.trim() || qism,
    }
    const { error } = entry
      ? await getSupabase().from("khata_ledger").update(payload).eq("id", entry.id)
      : await getSupabase().from("khata_ledger").insert(payload)
    setBusy(false)
    if (error) {
      toast.error(urduError(error))
      return
    }
    toast.success(entry ? "اندراج اپ ڈیٹ ہو گیا" : "اندراج محفوظ ہو گیا")
    refreshAll()
    onDone()
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      <div role="radiogroup" aria-label="اندراج کی قسم" className="grid grid-cols-2 gap-2">
        <SideButton active={side === "banam"} onClick={() => chooseSide("banam")} icon={ArrowUpFromLine} title="بنام" sub="ادائیگی / ایڈوانس دیا" />
        <SideButton active={side === "jama"} onClick={() => chooseSide("jama")} icon={ArrowDownToLine} title="جمع" sub="رقم یا مال وصول" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="رقم" htmlFor="raqam" required error={error ?? undefined} className="sm:col-span-2">
          <InputGroup className="h-14 rounded-xl">
            <InputGroupInput
              id="raqam"
              dir="ltr"
              inputMode="decimal"
              autoComplete="off"
              autoFocus
              placeholder="0"
              value={raqam}
              aria-invalid={Boolean(error) || undefined}
              onChange={(e) => {
                const v = e.target.value.replace(/[^\d.]/g, "")
                if (/^\d*\.?\d*$/.test(v)) {
                  setRaqam(v)
                  setError(null)
                }
              }}
              className="text-end font-num text-2xl font-semibold"
            />
            <InputGroupAddon align="inline-end" className="text-sm text-muted-foreground">
              روپے
            </InputGroupAddon>
          </InputGroup>
        </Field>
        <Field label="تاریخ" htmlFor="k-tareekh" error={dateError ?? undefined}>
          <Input
            id="k-tareekh"
            type="date"
            dir="ltr"
            className="h-11 text-end"
            value={tareekh}
            max={today}
            aria-invalid={Boolean(dateError) || undefined}
            onChange={(e) => {
              setTareekh(e.target.value)
              setDateError(null)
            }}
          />
        </Field>
        <Field label="قسم" htmlFor="k-qism">
          <Select value={qism} onValueChange={setQism}>
            <SelectTrigger id="k-qism" className="h-11! w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {QISMEN[side].map((q) => (
                <SelectItem key={q} value={q}>
                  {q}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="تفصیل" htmlFor="k-tafseel" className="sm:col-span-2">
          <Textarea id="k-tafseel" rows={2} value={tafseel} onChange={(e) => setTafseel(e.target.value)} placeholder={tafseelPlaceholder(qism)} />
        </Field>
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

function SideButton({
  active,
  onClick,
  icon: Icon,
  title,
  sub,
}: {
  active: boolean
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  title: string
  sub: string
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 rounded-xl border-2 p-3 text-start transition-colors",
        active ? "border-primary bg-primary/8" : "border-border hover:border-primary/40",
      )}
    >
      <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
        <Icon className="size-4.5" />
      </span>
      <span>
        <span className="block font-semibold">{title}</span>
        <span className="block text-xs text-muted-foreground">{sub}</span>
      </span>
    </button>
  )
}
