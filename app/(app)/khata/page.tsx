import type { Metadata } from "next"
import { KhataIndexView } from "@/components/khata/khata-index-view"

export const metadata: Metadata = { title: "جمع بنام کھاتہ" }

export default function KhataPage() {
  return <KhataIndexView />
}
