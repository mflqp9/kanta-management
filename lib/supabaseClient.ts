import { createBrowserClient } from "@supabase/ssr"
import type { PostgrestError } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
/** واحد ایڈمن کی ای میل — لاگ ان صفحہ صرف پاس ورڈ مانگتا ہے */
export const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? ""

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY)

type KantaClient = ReturnType<typeof createBrowserClient<Database>>

let client: KantaClient | undefined

/**
 * براؤزر کا Supabase کلائنٹ (سیشن کوکیز میں رہتا ہے تاکہ proxy.ts اسے پڑھ سکے)۔
 * صرف event handlers / effects / SWR fetchers کے اندر بلائیں، render کے دوران نہیں۔
 */
export function getSupabase(): KantaClient {
  client ??= createBrowserClient<Database>(SUPABASE_URL, SUPABASE_KEY)
  return client
}

type Result<T> = { data: T | null; error: PostgrestError | null }

/** کامیاب جواب کا ڈیٹا ٹائپ (Supabase کے success | failure یونین میں سے) */
type OkData<R extends { data: unknown }> = [Extract<R, { error: null }>] extends [never]
  ? NonNullable<R["data"]>
  : Extract<R, { error: null }>["data"]

/** Supabase کا جواب کھول کر ڈیٹا واپس کرتا ہے، غلطی ہو تو throw */
export async function unwrap<R extends { data: unknown; error: PostgrestError | null }>(query: PromiseLike<R>): Promise<OkData<R>> {
  const { data, error } = await query
  if (error) throw error
  return data as OkData<R>
}

const PAGE_SIZE = 1000

/**
 * Supabase ایک درخواست میں زیادہ سے زیادہ 1000 قطاریں دیتا ہے —
 * یہ مددگار صفحہ بہ صفحہ سب قطاریں لے آتا ہے۔
 */
export async function fetchAll<T>(build: (from: number, to: number) => PromiseLike<Result<T[]>>): Promise<T[]> {
  const rows: T[] = []
  for (let from = 0; ; from += PAGE_SIZE) {
    const page = await unwrap(build(from, from + PAGE_SIZE - 1))
    rows.push(...(page ?? []))
    if (!page || page.length < PAGE_SIZE) return rows
  }
}
