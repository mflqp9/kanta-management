import type { Metadata } from "next"
import { MillsView } from "@/components/crud/entities"

export const metadata: Metadata = { title: "ملیں" }

export default function MillsPage() {
  return <MillsView />
}
