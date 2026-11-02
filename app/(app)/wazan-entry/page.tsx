import type { Metadata } from "next"
import { WazanEntryForm } from "@/components/wazan/wazan-entry-form"

export const metadata: Metadata = { title: "وزن اندراج" }

export default function WazanEntryPage() {
  return <WazanEntryForm />
}
