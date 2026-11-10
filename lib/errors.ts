type MaybeError = {
  code?: string
  message?: string
  status?: number
  name?: string
} | null | undefined

/** Supabase / نیٹ ورک کی غلطی کو اردو پیغام میں بدلتا ہے */
export function urduError(error: unknown): string {
  const e = (typeof error === "object" ? error : { message: String(error) }) as MaybeError
  const message = e?.message ?? ""

  switch (e?.code) {
    case "23503":
      return "یہ ریکارڈ پرچیوں یا کھاتے میں استعمال ہو رہا ہے، اس لیے حذف نہیں ہو سکتا۔"
    case "23505":
      return "یہ اندراج پہلے سے موجود ہے۔"
    case "23514":
      if (/serial/i.test(message)) return "کمپیوٹر پرچی سیریل نمبر میں صرف انگریزی حروف اور ہندسے لکھیں۔"
      if (/tareekh_tarteeb/i.test(message)) return "ملازمت چھوڑنے کی تاریخ شمولیت کی تاریخ سے پہلے نہیں ہو سکتی۔"
      return "درج کی گئی قیمتیں درست نہیں — وزن اور کٹوتی دوبارہ چیک کریں۔"
    case "23502":
      return "ضروری خانے خالی ہیں۔"
    case "42501":
    case "PGRST301":
    case "PGRST303":
      return "اجازت نہیں ملی — براہِ کرم دوبارہ لاگ ان کریں۔"
    case "PGRST116":
      return "ریکارڈ نہیں ملا۔"
    case "42P01":
    case "PGRST205":
    case "PGRST202":
      return "ڈیٹا بیس ٹیبل نہیں ملا — پہلے supabase/schema.sql چلائیں۔"
    case "invalid_credentials":
      return "پاس ورڈ غلط ہے۔"
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "بہت زیادہ کوششیں — تھوڑی دیر بعد دوبارہ کوشش کریں۔"
  }

  if (/invalid login credentials/i.test(message)) return "پاس ورڈ غلط ہے۔"
  if (/email not confirmed/i.test(message)) return "ای میل کی تصدیق نہیں ہوئی — Supabase میں صارف کو تصدیق شدہ کریں۔"
  if (/failed to fetch|network|load failed|fetch failed/i.test(message))
    return "انٹرنیٹ کنکشن نہیں — کنکشن چیک کر کے دوبارہ کوشش کریں۔"
  if (/jwt|token/i.test(message)) return "سیشن ختم ہو گیا — براہِ کرم دوبارہ لاگ ان کریں۔"

  return "کچھ غلط ہو گیا، دوبارہ کوشش کریں۔"
}
