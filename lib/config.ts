// کاروبار کی معلومات — پرچی، کھاتے اور ہیڈر میں دکھائی جاتی ہیں (.env.local سے بدلیں)

export const BUSINESS = {
  naam: process.env.NEXT_PUBLIC_BUSINESS_NAME || "کانٹا کھاتہ",
  pata: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || "لیاقت پور، ضلع رحیم یار خان",
  phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || "",
  /** پروپرائٹر (مالک) کا نام — مرکزی صفحے پر */
  malik: process.env.NEXT_PUBLIC_BUSINESS_OWNER || "",
}

/** فون نمبر سے tel: لنک — "(+92) 300 1234 567" → "tel:+923001234567" */
export const BUSINESS_PHONE_HREF = BUSINESS.phone ? `tel:${BUSINESS.phone.replace(/[^\d+]/g, "")}` : ""

/** سافٹ ویئر بنانے والا — مرکزی صفحے کے فوٹر اور وزن پرچی کے آخر میں (مالک کی ہدایت پر انگریزی میں) */
export const DEVELOPER = {
  naam: "KodeVision",
  website: "www.kodevision.com",
  url: "https://kodevision.com",
  phone: "03008684287",
  facebook: "facebook.com/kodevision",
  facebookUrl: "https://www.facebook.com/kodevision",
}

/** "03008684287" → بین الاقوامی "923008684287" (کال اور واٹس ایپ لنک کے لیے) */
const DEVELOPER_PHONE_INTL = DEVELOPER.phone.replace(/\D/g, "").replace(/^0/, "92")
export const DEVELOPER_PHONE_HREF = `tel:+${DEVELOPER_PHONE_INTL}`
export const DEVELOPER_WHATSAPP_URL = `https://wa.me/${DEVELOPER_PHONE_INTL}`

/** لاگ ان شدہ ایڈمن کا نام — ہیڈر اور موبائل مینو میں ای میل کے ساتھ */
export const ADMIN_NAAM = process.env.NEXT_PUBLIC_ADMIN_NAME || "ایڈمن"
