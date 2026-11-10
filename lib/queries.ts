"use client"

import useSWR, { mutate } from "swr"
import { fetchAll, getSupabase } from "@/lib/supabaseClient"
import type { Gaari, Mill, Mulazim, Party, TableName } from "@/lib/database.types"

type Order = { column: string; ascending?: boolean }

export const TABLE_ORDER: Record<Exclude<TableName, "wazan_parchi" | "khata_ledger" | "mill_tarseel">, Order> = {
  parties: { column: "khata_number", ascending: true },
  gaariyan: { column: "gaari_number", ascending: true },
  mills: { column: "mill_ka_naam", ascending: true },
  mulazmeen: { column: "naam", ascending: true },
}

/** کسی ریکارڈ ٹیبل کی پوری فہرست (SWR key = ٹیبل کا نام) */
export function fetchTable<T>(table: keyof typeof TABLE_ORDER) {
  const order = TABLE_ORDER[table]
  return fetchAll<T>((from, to) =>
    getSupabase()
      .from(table)
      .select("*")
      .order(order.column, { ascending: order.ascending ?? true })
      .range(from, to) as unknown as PromiseLike<{ data: T[] | null; error: null }>,
  )
}

export function useTableRows<T>(table: keyof typeof TABLE_ORDER) {
  return useSWR<T[]>(table, () => fetchTable<T>(table))
}

/** پرچی یا کھاتہ بدلنے کے بعد: ڈیش بورڈ، کھاتے، رپورٹس سب تازہ کریں */
export function refreshAll() {
  return mutate(() => true)
}

export const useParties = () => useTableRows<Party>("parties")
export const useGaariyan = () => useTableRows<Gaari>("gaariyan")
export const useMills = () => useTableRows<Mill>("mills")
export const useMulazmeen = () => useTableRows<Mulazim>("mulazmeen")
