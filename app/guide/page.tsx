import type { Metadata } from "next"
import { PublicHeader } from "@/components/layout/public-header"
import { RehnumaiView } from "@/components/rehnumai/rehnumai-view"

export const metadata: Metadata = { title: "رہنمائی" }

/** رہنمائی — مرکزی صفحے سے، لاگ ان کے بغیر۔ لاگ ان کے بعد یہی مواد /rehnumai پر مینو کے ساتھ */
export default function GuidePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <PublicHeader active="guide" />
      <main className="mx-auto w-full max-w-6xl flex-1 px-3 pt-4 pb-10 sm:px-6 sm:pt-6 print:max-w-none print:p-0">
        <RehnumaiView />
      </main>
    </div>
  )
}
