import type { Metadata } from "next"
import { PartiesView } from "@/components/crud/entities"

export const metadata: Metadata = { title: "پارٹیاں / کسان" }

export default function PartiesPage() {
  return <PartiesView />
}
