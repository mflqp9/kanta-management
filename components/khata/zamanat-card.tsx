"use client"

import { Loader2, Pencil, Plus, Save, ShieldCheck } from "lucide-react"
import { useLayoutEffect, useState } from "react"
import { toast } from "sonner"
import { mutate } from "swr"
import { ZAMANAT_HINT, ZAMANAT_LABEL, ZAMANAT_PLACEHOLDER } from "@/components/crud/entities"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { Party } from "@/lib/database.types"
import { urduError } from "@/lib/errors"
import { getSupabase } from "@/lib/supabaseClient"
import { cn } from "@/lib/utils"

/**
 * کھاتے کے صفحے پر پارٹی کے ضمانتی کاغذات (چیک، اسٹامپ پیپر وغیرہ)۔
 * یہاں پارٹی کا صرف یہی خانہ بدلا جا سکتا ہے — باقی معلومات پارٹیوں کے صفحے سے۔
 */
export function ZamanatCard({ party, onSaved }: { party: Party; onSaved: (zamanat: string | null) => void }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState("")
  const [busy, setBusy] = useState(false)
  const zamanat = party.zamanat?.trim() || null

  // صفحہ چھپنے پر (Activity) ادھوری ترمیم بند
  useLayoutEffect(() => () => setEditing(false), [])

  function startEdit() {
    setValue(zamanat ?? "")
    setEditing(true)
  }

  async function save() {
    const next = value.trim() || null
    if (next === zamanat) {
      setEditing(false)
      return
    }
    setBusy(true)
    const { error } = await getSupabase().from("parties").update({ zamanat: next }).eq("id", party.id)
    setBusy(false)
    if (error) {
      toast.error(urduError(error))
      return
    }
    toast.success(next ? "ضمانتی کاغذات / ریفرنس کی تفصیل محفوظ ہو گئی" : "ضمانتی کاغذات / ریفرنس کا خانہ خالی کر دیا گیا")
    setEditing(false)
    onSaved(next)
    mutate("parties")
  }

  return (
    <section
      aria-labelledby="zamanat-title"
      className={cn(
        "rounded-2xl p-4 ring-1 shadow-xs",
        zamanat && !editing ? "bg-secondary/60 ring-primary/25" : "bg-card ring-foreground/8",
      )}
    >
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ShieldCheck className="size-[1.1rem]" />
        </span>
        <h2 id="zamanat-title" className="font-semibold">
          {ZAMANAT_LABEL}
        </h2>
        {!editing && (
          <Button variant="outline" className="ms-auto" onClick={startEdit}>
            {zamanat ? <Pencil /> : <Plus />}
            {zamanat ? "ترمیم کریں" : "نیا شامل کریں"}
          </Button>
        )}
      </div>

      {editing ? (
        <form
          className="mt-3 grid gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            save()
          }}
        >
          <Textarea
            id="zamanat"
            rows={3}
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setEditing(false)
            }}
            placeholder={ZAMANAT_PLACEHOLDER}
            aria-label={ZAMANAT_LABEL}
            aria-describedby="zamanat-hint"
          />
          <p id="zamanat-hint" className="text-xs text-muted-foreground">
            {ZAMANAT_HINT}
          </p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setEditing(false)} disabled={busy}>
              منسوخ کریں
            </Button>
            <Button type="submit" disabled={busy} className="min-w-32">
              {busy ? <Loader2 className="animate-spin" /> : <Save />}
              محفوظ کریں
            </Button>
          </div>
        </form>
      ) : zamanat ? (
        <p className="mt-2 text-sm whitespace-pre-line">{zamanat}</p>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">اس پارٹی کے کوئی ضمانتی کاغذات یا ریفرنس درج نہیں۔</p>
      )}
    </section>
  )
}
