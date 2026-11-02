import type { Metadata } from "next"
import { RehnumaiView } from "@/components/rehnumai/rehnumai-view"

export const metadata: Metadata = { title: "رہنمائی" }

export default function RehnumaiPage() {
  return <RehnumaiView />
}
