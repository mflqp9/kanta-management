import type { Jinss, KatautiUnit, WazanParchi } from "@/lib/database.types"

const TIME_ZONE = "Asia/Karachi"

const numberFormatters = new Map<string, Intl.NumberFormat>()

function numberFormatter(maxFraction: number, minFraction = 0) {
  const key = `${minFraction}-${maxFraction}`
  let f = numberFormatters.get(key)
  if (!f) {
    f = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: minFraction,
      maximumFractionDigits: maxFraction,
    })
    numberFormatters.set(key, f)
  }
  return f
}

/** 1234567.5 → "1,234,567.5" */
export function formatNumber(value: number | null | undefined, maxFraction = 2) {
  return numberFormatter(maxFraction).format(Number(value ?? 0))
}

/** وزن کلو میں */
export function formatKg(value: number | null | undefined) {
  return formatNumber(value, 2)
}

/** وزن من میں (زیادہ سے زیادہ 3 اعشاریہ) */
export function formatMann(value: number | null | undefined) {
  return formatNumber(value, 3)
}

/** رقم روپوں میں */
export function formatRaqam(value: number | null | undefined) {
  return formatNumber(value, 2)
}

const tareekhFormatter = new Intl.DateTimeFormat("ur-PK", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: TIME_ZONE,
})
const mukhtasarTareekhFormatter = new Intl.DateTimeFormat("ur-PK", {
  day: "numeric",
  month: "short",
  timeZone: TIME_ZONE,
})
const dinFormatter = new Intl.DateTimeFormat("ur-PK", { weekday: "long", timeZone: TIME_ZONE })
const waqtFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: TIME_ZONE,
})
const isoFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE })

/** "2026-10-27" یا Date → "27 اکتوبر، 2026" */
export function formatTareekh(value: string | Date | null | undefined) {
  if (!value) return "—"
  return tareekhFormatter.format(toDate(value))
}

/** "27 اکتوبر" — جدولوں میں مختصر تاریخ */
export function formatMukhtasarTareekh(value: string | Date | null | undefined) {
  if (!value) return "—"
  return mukhtasarTareekhFormatter.format(toDate(value))
}

/** "منگل" */
export function formatDin(value: string | Date) {
  return dinFormatter.format(toDate(value))
}

/** "4:30 شام" */
export function formatWaqt(value: string | Date | null | undefined) {
  if (!value) return "—"
  const parts = waqtFormatter.formatToParts(toDate(value))
  const hour = parts.find((p) => p.type === "hour")?.value
  const minute = parts.find((p) => p.type === "minute")?.value
  const pm = parts.find((p) => p.type === "dayPeriod")?.value === "PM"
  const h = Number(hour)
  const hissa = !pm ? (h === 12 || h < 4 ? "رات" : "صبح") : h === 12 || h < 4 ? "دوپہر" : h < 7 ? "شام" : "رات"
  return `${hour}:${minute} ${hissa}`
}

/** پاکستان کی آج کی تاریخ "YYYY-MM-DD" میں */
export function todayPK() {
  return isoFormatter.format(new Date())
}

/** کسی تاریخ میں دن جمع / تفریق — "YYYY-MM-DD" */
export function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/** مہینے کی پہلی تاریخ */
export function monthStart(iso: string) {
  return `${iso.slice(0, 8)}01`
}

function toDate(value: string | Date) {
  if (value instanceof Date) return value
  // صرف تاریخ ہو تو دوپہر رکھیں تاکہ ٹائم زون سے دن نہ بدلے
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00+05:00`) : new Date(value)
}

/** اجناس — اسی ترتیب سے ہر جگہ دکھائی جاتی ہیں (supabase/schema.sql کی jinss پابندی جیسی) */
export const JINSS_LABEL: Record<Jinss, string> = {
  ganna: "گنا",
  kapaas: "کپاس",
  gandum: "گندم",
  chawal: "چاول",
  sarson: "سرسوں",
  til: "تل",
  digar: "دیگر",
}

export const JINSS_LIST = Object.keys(JINSS_LABEL) as Jinss[]

/** مل کٹوتی کی اکائیاں — فہرست میں پہلی (کلوگرام) ڈیفالٹ ہے */
export const KATAUTI_UNIT_LABEL: Record<KatautiUnit, string> = {
  kg: "کلوگرام",
  mann: "من",
}

export const KATAUTI_UNIT_LIST = Object.keys(KATAUTI_UNIT_LABEL) as KatautiUnit[]

/** پرچی کی کٹوتی اسی اکائی میں جس میں لکھی گئی تھی: { n: "120", unit: "کلو" } */
export function katautiKiTafseel(parchi: Pick<WazanParchi, "mill_katauti_unit" | "mill_katauti_kg" | "mill_katauti_mann">) {
  return parchi.mill_katauti_unit === "kg"
    ? { n: formatKg(parchi.mill_katauti_kg), unit: "کلو" }
    : { n: formatMann(parchi.mill_katauti_mann), unit: "من" }
}

/** سیریل: صرف انگریزی حروف اور ہندسے — اردو / عربی ہندسے انگریزی میں بدل جاتے ہیں، باقی سب ہٹ جاتا ہے */
export function cleanSerial(value: string) {
  return value
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[^A-Za-z0-9]/g, "")
}

/** پارٹی کا پورا نام: "محمد اکرم ولد غلام رسول" */
export function partyKaNaam(party: { naam: string; walid_ka_naam?: string | null } | null | undefined) {
  if (!party) return "—"
  return party.walid_ka_naam ? `${party.naam} ولد ${party.walid_ka_naam}` : party.naam
}
