import type { Metadata } from "next"
import { ParchiyanView } from "@/components/parchi/parchiyan-view"

export const metadata: Metadata = { title: "تمام پرچیاں" }

export default function ParchiyanPage() {
  return <ParchiyanView />
}
