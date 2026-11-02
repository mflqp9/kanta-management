"use client"

import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { getSupabase } from "@/lib/supabaseClient"
import { urduError } from "@/lib/errors"
import { cn } from "@/lib/utils"

export function LogoutButton({ className, compact }: { className?: string; compact?: boolean }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function logout() {
    setBusy(true)
    const { error } = await getSupabase().auth.signOut()
    setBusy(false)
    if (error) {
      toast.error(urduError(error))
      return
    }
    router.replace("/login")
    router.refresh()
  }

  if (compact) {
    return (
      <Button variant="ghost" size="icon" className={cn("rounded-full", className)} onClick={logout} disabled={busy} aria-label="لاگ آؤٹ" title="لاگ آؤٹ">
        <LogOut className="size-5 rtl:-scale-x-100" />
      </Button>
    )
  }

  return (
    <Button variant="ghost" className={cn("w-full justify-start gap-3", className)} onClick={logout} disabled={busy}>
      <LogOut className="size-[1.15rem] rtl:-scale-x-100" />
      لاگ آؤٹ
    </Button>
  )
}
