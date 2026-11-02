"use client"

import { Loader2, Trash2 } from "lucide-react"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

/** "حذف کریں" بٹن + تصدیقی ڈائیلاگ۔ onConfirm غلطی پر throw کرے تو ڈائیلاگ کھلا رہتا ہے */
export function ConfirmDelete({
  title = "کیا آپ واقعی حذف کرنا چاہتے ہیں؟",
  description,
  onConfirm,
  trigger,
}: {
  title?: string
  description: React.ReactNode
  onConfirm: () => Promise<void>
  trigger?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  async function confirm() {
    setBusy(true)
    try {
      await onConfirm()
      setOpen(false)
    } catch {
      // پیغام onConfirm خود دکھاتا ہے
    } finally {
      setBusy(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="icon-sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" aria-label="حذف کریں" title="حذف کریں">
            <Trash2 />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>منسوخ کریں</AlertDialogCancel>
          <Button variant="destructive" onClick={confirm} disabled={busy} className="bg-destructive text-white hover:bg-destructive/90">
            {busy ? <Loader2 className="animate-spin" /> : <Trash2 />}
            حذف کریں
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
