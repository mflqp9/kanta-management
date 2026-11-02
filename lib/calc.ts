// وزن پرچی کا حساب — supabase/schema.sql کے ٹرگر `wazan_parchi_hisaab` جیسا ہی

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
