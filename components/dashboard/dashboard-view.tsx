"use client"

import Link from "next/link"
import { ArrowLeft, ChartColumnBig, HandCoins, Plus, ReceiptText, Scale, Wallet } from "lucide-react"
import useSWR from "swr"
import { EmptyState, ErrorState } from "@/components/empty-state"
import { JINSS_ICON } from "@/components/jinss"
import { Num, Raqam } from "@/components/num"
import { ParchiList } from "@/components/parchi/parchi-list"
import { StatCard } from "@/components/stat-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToday } from "@/hooks/use-today"
import { PARCHI_SELECT, type Jinss, type ParchiWithRelations, type RpcReturn } from "@/lib/database.types"
import { urduError } from "@/lib/errors"
import { JINSS_LABEL, JINSS_LIST, formatDin, formatTareekh } from "@/lib/format"
import { getSupabase, unwrap } from "@/lib/supabaseClient"
import { cn } from "@/lib/utils"

type JinssWazan = RpcReturn<"dashboard_jinss_wazan">[number]

export function DashboardView() {
  const today = useToday()

  const stats = useSWR(today ? ["dashboard", today] : null, ([, date]) =>
    unwrap(getSupabase().rpc("dashboard_stats", { p_tareekh: date }).single()),
  )

  const recent = useSWR(today ? ["recent-parchiyan", today] : null, async ([, date]) => {
    const rows = await unwrap(
      getSupabase()
        .from("wazan_parchi")
        .select(PARCHI_SELECT)
        .eq("tareekh", date)
        .order("token_number", { ascending: false })
        .limit(10),
    )
    return rows as unknown as ParchiWithRelations[]
  })

  const jinssWazan = useSWR(today ? ["dashboard-jinss", today] : null, ([, date]) =>
    unwrap(getSupabase().rpc("dashboard_jinss_wazan", { p_tareekh: date })),
  )

  const s = stats.data
  const loading = !s && !stats.error
  const jw = jinssWazan.data
  const kulMann = jw?.reduce((t, r) => t + Number(r.wazan_mann), 0) ?? 0
  const kulKg = jw?.reduce((t, r) => t + Number(r.khalis_wazan_kg), 0) ?? 0

  return (
    <>
      {/* خوش آمدید */}
      <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground lg:hidden">{today ? `${formatDin(today)}، ${formatTareekh(today)}` : " "}</p>
          <h1 className="text-2xl font-bold sm:text-3xl">آج کا خلاصہ</h1>
        </div>
        <div className="flex gap-2">
          <Button asChild size="lg" className="flex-1 sm:flex-none">
            <Link href="/wazan-entry">
              <Plus className="size-5" />
              نیا وزن اندراج
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="flex-1 sm:flex-none">
            <Link href="/reports">
              <ChartColumnBig className="size-5" />
              رپورٹس
            </Link>
          </Button>
        </div>
      </div>

      {stats.error && (
        <div className="mb-4">
          <ErrorState message={urduError(stats.error)} onRetry={() => stats.mutate()} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard
          title="آج کا کل وزن"
          icon={Scale}
          loading={!jw && !jinssWazan.error}
          value={
            <>
              <Num format="mann" value={kulMann} /> <span className="text-sm font-normal">من</span>
            </>
          }
          sub={
            <>
              <Num format="kg" value={kulKg} /> کلو — تمام اجناس
            </>
          }
        />
        <StatCard
          title="آج کی پرچیاں"
          icon={ReceiptText}
          loading={loading}
          value={<Num value={s?.parchi_count} />}
          sub={
            <>
              <Num value={jw?.length ?? 0} /> اجناس کی
            </>
          }
        />
        <StatCard
          title="کل بقایا جات"
          icon={Wallet}
          loading={loading}
          value={<Raqam value={s?.kul_baqaya} unitClassName="text-sm font-normal" />}
          sub="تمام پارٹیوں کا جمع − بنام"
        />
        <StatCard
          title="آج کی آمدن"
          icon={HandCoins}
          loading={loading}
          highlight
          value={<Raqam value={s?.aaj_ki_aamdan} unitClassName="text-sm font-normal" />}
          sub={
            <>
              آج کی <Num value={s?.parchi_count} /> پرچیوں کی صافی رقم
            </>
          }
        />
      </div>

      {/* جنس وار وزن */}
      <section className="mt-5 rounded-2xl bg-card p-4 ring-1 ring-foreground/8 shadow-xs sm:mt-6 sm:p-5">
        <h2 className="mb-3 font-semibold">آج کا وزن — جنس وار</h2>
        {jinssWazan.error ? (
          <ErrorState message={urduError(jinssWazan.error)} onRetry={() => jinssWazan.mutate()} />
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 xl:grid-cols-7">
            {JINSS_LIST.map((j) => (
              <JinssTile key={j} jinss={j} row={jw?.find((r) => r.jinss === j)} loading={!jw} />
            ))}
          </div>
        )}
      </section>

      {/* تازہ پرچیاں */}
      <section className="mt-5 overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/8 shadow-xs sm:mt-6">
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ReceiptText className="size-[1.1rem]" />
            </span>
            <h2 className="font-semibold">آج کی 10 تازہ پرچیاں</h2>
          </div>
          <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary">
            <Link href="/parchiyan">
              تمام پرچیاں
              <ArrowLeft />
            </Link>
          </Button>
        </div>
        {recent.error ? (
          <div className="p-4">
            <ErrorState message={urduError(recent.error)} onRetry={() => recent.mutate()} />
          </div>
        ) : recent.data && recent.data.length === 0 ? (
          <EmptyState
            icon={ReceiptText}
            title="آج ابھی تک کوئی پرچی نہیں بنی"
            description="پہلی گاڑی کا وزن درج کریں — حساب اور کھاتہ خود بن جائے گا۔"
            action={
              <Button asChild>
                <Link href="/wazan-entry">
                  <Plus />
                  وزن اندراج کریں
                </Link>
              </Button>
            }
          />
        ) : (
          <ParchiList rows={recent.data ?? []} loading={!recent.data} />
        )}
      </section>
    </>
  )
}

/** ایک جنس کا آج کا وزن — پرچی نہ بنی ہو تو مدھم */
function JinssTile({ jinss, row, loading }: { jinss: Jinss; row?: JinssWazan; loading: boolean }) {
  const Icon = JINSS_ICON[jinss]
  const has = Boolean(row && row.parchi_count > 0)
  return (
    <div className={cn("rounded-xl p-3 ring-1", has ? "bg-primary/6 ring-primary/20" : "bg-muted/40 ring-foreground/8")}>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg",
            has ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
          )}
        >
          <Icon className="size-4" />
        </span>
        <span className="font-semibold">{JINSS_LABEL[jinss]}</span>
      </div>
      {loading ? (
        <Skeleton className="mt-2 h-6 w-20" />
      ) : (
        <>
          <div className={cn("mt-1.5 text-lg font-bold", !has && "text-muted-foreground")}>
            <Num format="mann" value={row?.wazan_mann ?? 0} /> <span className="text-xs font-normal">من</span>
          </div>
          <div className="text-xs text-muted-foreground">
            <Num value={row?.parchi_count ?? 0} /> پرچیاں · <Num format="kg" value={row?.khalis_wazan_kg ?? 0} /> کلو
          </div>
        </>
      )}
    </div>
  )
}
