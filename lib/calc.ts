// وزن پرچی کا حساب — supabase/schema.sql کے ٹرگر `wazan_parchi_hisaab` جیسا ہی

import type { KatautiUnit } from "@/lib/database.types"

export const KG_PER_MANN = 40

export type HisaabInput = {
  kulWazanKg: number
  khaliWazanKg: number
  rate: number
  katautiMann: number
}

export type Hisaab = {
  khalisWazanKg: number
  wazanMann: number
  kulRaqam: number
  katautiRaqam: number
  finalRaqam: number
}

export function round(value: number, digits = 2) {
  const f = 10 ** digits
  return Math.round((value + Number.EPSILON) * f) / f
}

export function hisaab({ kulWazanKg, khaliWazanKg, rate, katautiMann }: HisaabInput): Hisaab {
  const khalisWazanKg = round(kulWazanKg - khaliWazanKg, 2)
  const wazanMann = round(khalisWazanKg / KG_PER_MANN, 6)
  const kulRaqam = round(wazanMann * rate)
  const finalRaqam = round((wazanMann - katautiMann) * rate)
  return {
    khalisWazanKg,
    wazanMann,
    kulRaqam,
    katautiRaqam: round(kulRaqam - finalRaqam),
    finalRaqam,
  }
}

/**
 * مل کٹوتی کو من میں بدلتا ہے — پرچی کا سارا حساب (اور ڈیٹا بیس کا mill_katauti_mann) من میں ہے۔
 * کلو ÷ 40؛ ڈیٹا بیس کا خودکار کالم mill_katauti_kg واپس × 40 کرتا ہے۔
 */
export function katautiKoMann(value: number, unit: KatautiUnit) {
  return unit === "kg" ? round(value / KG_PER_MANN, 6) : value
}

/** مل کے فیصد اصول سے خودکار کٹوتی، منتخب اکائی میں (کلو 2 اعشاریہ، من 3 اعشاریہ تک) */
export function khudkarKatauti(khalisWazanKg: number, feesad: number, unit: KatautiUnit) {
  const kg = (khalisWazanKg * feesad) / 100
  return unit === "kg" ? round(kg, 2) : round(kg / KG_PER_MANN, 3)
}

/** کلو کو "من + کلو" میں توڑتا ہے: 8,120 کلو → 203 من 0 کلو */
export function mannAurKilo(kg: number) {
  const mann = Math.floor(kg / KG_PER_MANN)
  return { mann, kilo: round(kg - mann * KG_PER_MANN, 2) }
}

/** "2%" یا "2.5 فیصد" جیسا کٹوتی اصول ہو تو فیصد واپس کرتا ہے، ورنہ null */
export function katautiFeesad(rule: string | null | undefined): number | null {
  if (!rule) return null
  const match = rule.match(/(\d+(?:\.\d+)?)\s*(?:%|٪|فیصد)/)
  return match ? Number(match[1]) : null
}

/** فارم کی خالی/غلط ان پٹ کو نمبر میں بدلتا ہے */
export function toNumber(value: string | number | null | undefined): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0
  if (!value) return 0
  const n = Number(String(value).replace(/,/g, "").trim())
  return Number.isFinite(n) ? n : 0
}
