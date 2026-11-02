"use client"

import { Eye, EyeOff, Loader2, LockKeyhole, LogIn, TriangleAlert } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { urduError } from "@/lib/errors"
import { ADMIN_EMAIL, getSupabase, isSupabaseConfigured } from "@/lib/supabaseClient"

export function LoginForm() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setupMissing = !isSupabaseConfigured || !ADMIN_EMAIL

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!password) {
      setError("پاس ورڈ لکھیں")
      return
    }
    setBusy(true)
    setError(null)
    const { error } = await getSupabase().auth.signInWithPassword({ email: ADMIN_EMAIL, password })
    if (error) {
      setBusy(false)
      setError(urduError(error))
      return
    }
    router.replace("/dashboard")
    router.refresh()
  }

  if (setupMissing) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
        <div className="mb-2 flex items-center gap-2 font-semibold text-destructive">
          <TriangleAlert className="size-5" />
          سیٹ اپ مکمل نہیں
        </div>
        <p className="mb-2">
          پروجیکٹ کی جڑ میں <code className="font-num">.env</code> فائل بنا کر یہ تین چیزیں لکھیں، پھر سرور دوبارہ چلائیں:
        </p>
        <pre dir="ltr" className="overflow-x-auto rounded-lg bg-background p-3 text-start font-mono text-xs leading-6">
          {`NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
NEXT_PUBLIC_ADMIN_EMAIL=...`}
        </pre>
      </div>
    )
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-5">
      <div className="grid gap-2">
        <Label htmlFor="password">پاس ورڈ</Label>
        <InputGroup className="h-12 rounded-xl">
          <InputGroupAddon>
            <LockKeyhole />
          </InputGroupAddon>
          <InputGroupInput
            id="password"
            type={show ? "text" : "password"}
            dir="ltr"
            autoComplete="current-password"
            autoFocus
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError(null)
            }}
            aria-invalid={Boolean(error) || undefined}
            placeholder="••••••••"
            className="text-end font-num text-lg"
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="icon-sm"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "پاس ورڈ چھپائیں" : "پاس ورڈ دکھائیں"}
            >
              {show ? <EyeOff /> : <Eye />}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>

      <Button type="submit" size="lg" className="h-12 text-base" disabled={busy}>
        {busy ? <Loader2 className="animate-spin" /> : <LogIn className="size-5 rtl:-scale-x-100" />}
        لاگ ان کریں
      </Button>
    </form>
  )
}
