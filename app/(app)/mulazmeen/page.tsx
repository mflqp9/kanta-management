import type { Metadata } from "next"
import { MulazmeenView } from "@/components/crud/entities"

export const metadata: Metadata = { title: "ملازمین" }

export default function MulazmeenPage() {
  return <MulazmeenView />
}
