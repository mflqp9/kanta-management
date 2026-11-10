"use client"

import { Pencil, Plus, Search } from "lucide-react"
import { useDeferredValue, useLayoutEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { mutate } from "swr"
import { RecordFormDialog } from "@/components/crud/record-form-dialog"
import type { EntityConfig } from "@/components/crud/types"
import { ConfirmDelete } from "@/components/confirm-delete"
import { EmptyState, ErrorState } from "@/components/empty-state"
import { Num } from "@/components/num"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { urduError } from "@/lib/errors"
import { useTableRows } from "@/lib/queries"
import { getSupabase } from "@/lib/supabaseClient"
import { cn } from "@/lib/utils"

/** ریکارڈ ٹیبلز (پارٹیاں، گاڑیاں، ملیں، ملازمین) کا مشترکہ صفحہ */
export function CrudPage<T extends { id: string }>({ config }: { config: EntityConfig<T> }) {
  const { data, error, isLoading, mutate: reload } = useTableRows<T>(config.table)
  const [search, setSearch] = useState("")
  const deferredSearch = useDeferredValue(search)
  const [dialog, setDialog] = useState<{ record: T | null } | null>(null)

  // صفحہ چھپنے پر (Activity) ڈائیلاگ بند
  useLayoutEffect(() => () => setDialog(null), [])

  const rows = useMemo(() => {
    const all = data ?? []
    const q = deferredSearch.trim().toLowerCase()
    if (!q) return all
    return all.filter((r) => config.searchText(r).toLowerCase().includes(q))
  }, [data, deferredSearch, config])

  async function remove(row: T) {
    const { error } = await getSupabase().from(config.table).delete().eq("id", row.id)
    if (error) {
      toast.error(urduError(error))
      throw error
    }
    toast.success("ریکارڈ حذف ہو گیا")
    await mutate(config.table)
  }

  const actions = (row: T) => (
    <div className="flex items-center justify-end gap-0.5">
      {config.rowActions?.(row)}
      <Button variant="ghost" size="icon-sm" onClick={() => setDialog({ record: row })} aria-label="ترمیم کریں" title="ترمیم کریں">
        <Pencil />
      </Button>
      <ConfirmDelete description={config.deleteDescription(row)} onConfirm={() => remove(row)} />
    </div>
  )

  return (
    <>
      <PageHeader
        title={config.title}
        icon={config.icon}
        description={
          data ? (
            <>
              {config.description} · کل <Num value={data.length} /> ریکارڈ
            </>
          ) : (
            config.description
          )
        }
        actions={
          <Button size="lg" onClick={() => setDialog({ record: null })}>
            <Plus className="size-5" />
            نیا شامل کریں
          </Button>
        }
      />

      <div className="mb-4">
        <InputGroup className="h-11 bg-card">
          <InputGroupInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`${config.singular} تلاش کریں…`}
            aria-label="تلاش کریں"
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          {search && (
            <InputGroupAddon align="inline-end">
              <Badge variant="secondary">
                <Num value={rows.length} /> نتائج
              </Badge>
            </InputGroupAddon>
          )}
        </InputGroup>
      </div>

      {error ? (
        <ErrorState message={urduError(error)} onRetry={() => reload()} />
      ) : isLoading && !data ? (
        <LoadingList />
      ) : rows.length === 0 ? (
        <div className="rounded-2xl bg-card ring-1 ring-foreground/8">
          {search ? (
            <EmptyState icon={Search} title="کوئی ریکارڈ نہیں ملا" description="تلاش کے الفاظ بدل کر دیکھیں۔" />
          ) : (
            <EmptyState
              icon={config.icon}
              title={`ابھی کوئی ${config.singular} درج نہیں`}
              description="نیچے والے بٹن سے پہلا ریکارڈ شامل کریں۔"
              action={
                <Button onClick={() => setDialog({ record: null })}>
                  <Plus />
                  نیا شامل کریں
                </Button>
              }
            />
          )}
        </div>
      ) : (
        <>
          {/* موبائل: کارڈ */}
          <div className="grid gap-2.5 md:hidden">
            {rows.map((row) => (
              <div key={row.id} className="rounded-2xl bg-card p-3.5 ring-1 ring-foreground/8">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{config.cardTitle(row)}</div>
                    {config.cardSubtitle && <div className="truncate text-sm text-muted-foreground">{config.cardSubtitle(row)}</div>}
                  </div>
                  {actions(row)}
                </div>
                {config.cardMeta && <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">{config.cardMeta(row)}</div>}
              </div>
            ))}
            {config.footer && <div className="rounded-2xl bg-secondary p-3.5 text-sm text-secondary-foreground">{config.footer(rows)}</div>}
          </div>

          {/* ٹیبلٹ / ڈیسک ٹاپ: جدول */}
          <div className="hidden overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/8 md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/60 hover:bg-muted/60">
                  <TableHead className={cn("text-center", config.rowNumber ? "w-24" : "w-12")}>{config.rowNumber?.label ?? "#"}</TableHead>
                  {config.columns.map((c) => (
                    <TableHead key={c.label} className={c.className}>
                      {c.label}
                    </TableHead>
                  ))}
                  <TableHead className="w-36 text-end">عمل</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, i) => (
                  <TableRow key={row.id}>
                    <TableCell className="text-center text-muted-foreground">
                      {config.rowNumber ? config.rowNumber.cell(row) : <Num value={i + 1} />}
                    </TableCell>
                    {config.columns.map((c) => (
                      <TableCell key={c.label} className={c.className}>
                        {c.cell(row)}
                      </TableCell>
                    ))}
                    <TableCell>{actions(row)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              {config.footer && (
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={config.columns.length + 2}>{config.footer(rows)}</TableCell>
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </div>
        </>
      )}

      <RecordFormDialog<T>
        open={dialog !== null}
        onOpenChange={(open) => !open && setDialog(null)}
        table={config.table}
        singular={config.singular}
        muannas={config.muannas}
        fields={config.fields}
        record={dialog?.record}
      />
    </>
  )
}

function LoadingList() {
  return (
    <div className="grid gap-2.5 rounded-2xl bg-card p-3 ring-1 ring-foreground/8">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex items-center gap-3 p-1">
          <Skeleton className="size-9 rounded-xl" />
          <div className="grid flex-1 gap-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  )
}
