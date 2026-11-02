import type { Metadata } from "next"
import { Suspense } from "react"
import { KhataDetailView } from "@/components/khata/khata-detail-view"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = { title: "کھاتہ" }

export default function KhataDetailPage({ params }: PageProps<"/khata/[partyId]">) {
  return (
    <Suspense fallback={<KhataSkeleton />}>
      <KhataDetailView params={params} />
    </Suspense>
  )
}

function KhataSkeleton() {
  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-3">
        <Skeleton className="size-12 rounded-2xl" />
        <div className="grid gap-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>
      <Skeleton className="h-72 rounded-2xl" />
    </div>
  )
}
