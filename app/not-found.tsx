import Link from "next/link"
import { ArrowRight, SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-4 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <SearchX className="size-8" />
      </span>
      <div className="font-num text-5xl font-bold text-primary">404</div>
      <h1 className="text-xl font-bold">یہ صفحہ موجود نہیں</h1>
      <p className="text-sm text-muted-foreground">ہو سکتا ہے لنک غلط ہو یا صفحہ ہٹا دیا گیا ہو۔</p>
      <Button asChild>
        <Link href="/dashboard">
          <ArrowRight />
          ڈیش بورڈ پر جائیں
        </Link>
      </Button>
    </div>
  )
}
