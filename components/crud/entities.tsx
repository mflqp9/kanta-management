"use client"

import Link from "next/link"
import { BookOpenText, Factory, IdCard, MapPin, Phone, ShieldCheck, Truck, Users } from "lucide-react"
import { CrudPage } from "@/components/crud/crud-page"
import type { EntityConfig, FieldDef } from "@/components/crud/types"
import { Num, Raqam } from "@/components/num"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Gaari, Mill, Mulazim, Party } from "@/lib/database.types"
import { NISBAT_LABEL, NISBAT_LIST, formatTareekh, nisbatKaJumla, partyKaNaam, todayPK } from "@/lib/format"
import { cn } from "@/lib/utils"

const dash = <span className="text-muted-foreground">—</span>

// ---------------------------------------------------------------- پارٹیاں
export const PARTY_QISMEN = [
  "کسان",
  "زمیندار",
  "بیوپاری",
  "آڑھتی",
  "ڈرائیور",
  "سیلز اینڈ ریکوری آفیسر",
  "برانچ منیجر",
  "ایم ڈی",
  "گارڈ / چوکیدار",
  "ملازم",
  "دیگر",
]

export const ZAMANAT_LABEL = "ضمانتی کاغذات / ریفرنس"
export const ZAMANAT_PLACEHOLDER = "مثلاً: چیک نمبر 123456 (حبیب بینک)، 500 روپے کا اسٹامپ پیپر، یا ریفرنس کا نام"
export const ZAMANAT_HINT = "رقم یا ایڈوانس دینے پر ضمانت کے طور پر لیے گئے چیک، اسٹامپ پیپر وغیرہ یا ریفرنس کی تفصیل (اختیاری)"

export const PARTY_FIELDS: FieldDef[] = [
  { name: "naam", label: "نام", required: true, placeholder: "مثلاً: محمد اکرم یا فرم کا نام" },
  {
    name: "walid_ka_naam",
    label: "والد کا نام",
    placeholder: "مثلاً: غلام رسول",
    // نام کسی فرم / کاروبار کا ہو تو والد کی جگہ ریفرینس (حوالہ دینے والے) کا نام — parties.nisbat میں محفوظ
    selector: {
      name: "nisbat",
      ariaLabel: "والد یا ریفرینس",
      options: NISBAT_LIST.map((n) => ({ value: n, label: NISBAT_LABEL[n] })),
      defaultValue: "walid",
      labels: { walid: "والد کا نام", reference: "ریفرینس کا نام" },
      placeholders: { walid: "مثلاً: غلام رسول", reference: "مثلاً: محمد اسلم (جس کے حوالے سے آئے)" },
    },
  },
  { name: "mobile_number", label: "موبائل نمبر", type: "tel", placeholder: "03001234567" },
  { name: "mobile_number_2", label: "دوسرا موبائل نمبر", type: "tel", placeholder: "03001234567", hint: "اختیاری" },
  { name: "gaon", label: "موضع", placeholder: "مثلاً: چک نمبر 12" },
  { name: "qism", label: "قسم", type: "select", options: PARTY_QISMEN, defaultValue: "کسان" },
  { name: "zamanat", label: ZAMANAT_LABEL, type: "textarea", placeholder: ZAMANAT_PLACEHOLDER, hint: ZAMANAT_HINT },
]

const partiesConfig: EntityConfig<Party> = {
  table: "parties",
  title: "پارٹیاں / کسان",
  description: "کسانوں اور پارٹیوں کا ریکارڈ",
  icon: Users,
  singular: "پارٹی",
  muannas: true,
  fields: PARTY_FIELDS,
  searchText: (r) =>
    [`#${r.khata_number}`, r.naam, nisbatKaJumla(r), r.gaon, r.mobile_number, r.mobile_number_2, r.qism, r.zamanat].join(" "),
  rowNumber: { label: "کھاتہ نمبر", cell: (r) => <Num className="font-semibold text-primary">{r.khata_number}</Num> },
  columns: [
    {
      label: "نام",
      cell: (r) => (
        <div>
          <div className="font-semibold">{r.naam}</div>
          {nisbatKaJumla(r) && <div className="text-xs text-muted-foreground">{nisbatKaJumla(r)}</div>}
        </div>
      ),
    },
    { label: "موضع", cell: (r) => r.gaon || dash },
    {
      label: "موبائل نمبر",
      cell: (r) =>
        r.mobile_number || r.mobile_number_2 ? (
          <div className="grid">
            {r.mobile_number && <Num>{r.mobile_number}</Num>}
            {r.mobile_number_2 && <Num className="text-muted-foreground">{r.mobile_number_2}</Num>}
          </div>
        ) : (
          dash
        ),
    },
    { label: "قسم", cell: (r) => (r.qism ? <Badge variant="secondary">{r.qism}</Badge> : dash) },
    {
      label: ZAMANAT_LABEL,
      className: "hidden lg:table-cell",
      cell: (r) =>
        r.zamanat ? (
          <span className="flex max-w-56 items-center gap-1.5" title={r.zamanat}>
            <ShieldCheck className="size-4 shrink-0 text-primary" />
            <span className="truncate">{r.zamanat}</span>
          </span>
        ) : (
          dash
        ),
    },
  ],
  cardTitle: (r) => r.naam,
  cardSubtitle: (r) => nisbatKaJumla(r) ?? r.qism,
  cardMeta: (r) => (
    <>
      <Badge>
        کھاتہ نمبر <Num>{r.khata_number}</Num>
      </Badge>
      {r.qism && <Badge variant="secondary">{r.qism}</Badge>}
      {r.gaon && (
        <span className="flex items-center gap-1 text-muted-foreground">
          <MapPin className="size-3.5" />
          {r.gaon}
        </span>
      )}
      {[r.mobile_number, r.mobile_number_2].filter(Boolean).map((m, i) => (
        <a key={i} href={`tel:${m}`} className="flex items-center gap-1 text-primary">
          <Phone className="size-3.5" />
          <Num>{m}</Num>
        </a>
      ))}
      {r.zamanat && (
        <span className="flex items-center gap-1 text-primary">
          <ShieldCheck className="size-3.5" />
          ضمانت درج
        </span>
      )}
    </>
  ),
  rowActions: (r) => (
    <Button asChild variant="ghost" size="icon-sm" className="text-primary hover:text-primary" title="کھاتہ دیکھیں">
      <Link href={`/khata/${r.id}`} aria-label="کھاتہ دیکھیں">
        <BookOpenText />
      </Link>
    </Button>
  ),
  deleteDescription: (r) => (
    <>
      «{partyKaNaam(r)}» کا ریکارڈ حذف ہو جائے گا۔ اگر اس پارٹی کی پرچیاں یا کھاتہ اندراج موجود ہیں تو یہ حذف نہیں ہو گا۔
    </>
  ),
}

// ---------------------------------------------------------------- گاڑیاں
export const GAARI_FIELDS: FieldDef[] = [
  { name: "gaari_number", label: "گاڑی نمبر", required: true, placeholder: "مثلاً: RYK-1234", ltr: true },
  { name: "driver_ka_naam", label: "ڈرائیور کا نام", placeholder: "مثلاً: محمد اسلم" },
]

const gaariyanConfig: EntityConfig<Gaari> = {
  table: "gaariyan",
  title: "گاڑیاں",
  description: "ٹرالیوں، ٹرکوں اور ڈرائیوروں کا ریکارڈ",
  icon: Truck,
  singular: "گاڑی",
  muannas: true,
  fields: GAARI_FIELDS,
  searchText: (r) => [r.gaari_number, r.driver_ka_naam].join(" "),
  columns: [
    { label: "گاڑی نمبر", cell: (r) => <Num className="font-semibold">{r.gaari_number}</Num> },
    { label: "ڈرائیور کا نام", cell: (r) => r.driver_ka_naam || dash },
  ],
  cardTitle: (r) => <Num>{r.gaari_number}</Num>,
  cardSubtitle: (r) => (r.driver_ka_naam ? `ڈرائیور: ${r.driver_ka_naam}` : "ڈرائیور درج نہیں"),
  deleteDescription: (r) => (
    <>
      گاڑی «<Num>{r.gaari_number}</Num>» کا ریکارڈ حذف ہو جائے گا۔ اگر یہ کسی پرچی میں استعمال ہوئی ہے تو حذف نہیں ہو گی۔
    </>
  ),
}

// ---------------------------------------------------------------- ملیں
export const MILL_FIELDS: FieldDef[] = [
  { name: "mill_ka_naam", label: "مل کا نام", required: true, placeholder: "مثلاً: جے ڈی ڈبلیو شوگر مل", full: true },
  { name: "rate_per_mann", label: "ریٹ فی من", type: "number", unit: "روپے", placeholder: "0" },
  {
    name: "katauti_rule",
    label: "کٹوتی کا اصول",
    placeholder: "مثلاً: 2%",
    hint: "فیصد لکھیں (مثلاً 2%) تو وزن اندراج میں کٹوتی خود لگ جائے گی",
  },
]

const millsConfig: EntityConfig<Mill> = {
  table: "mills",
  title: "ملیں",
  description: "شوگر / جننگ ملیں، ریٹ اور کٹوتی",
  icon: Factory,
  singular: "مل",
  muannas: true,
  fields: MILL_FIELDS,
  searchText: (r) => [r.mill_ka_naam, r.katauti_rule].join(" "),
  columns: [
    { label: "مل کا نام", cell: (r) => <span className="font-semibold">{r.mill_ka_naam}</span> },
    { label: "ریٹ فی من", cell: (r) => <Raqam value={r.rate_per_mann} /> },
    { label: "کٹوتی کا اصول", cell: (r) => r.katauti_rule || dash },
  ],
  cardTitle: (r) => r.mill_ka_naam,
  cardMeta: (r) => (
    <>
      <span>
        ریٹ: <Raqam value={r.rate_per_mann} className="font-semibold" /> فی من
      </span>
      {r.katauti_rule && <span className="text-muted-foreground">کٹوتی: {r.katauti_rule}</span>}
    </>
  ),
  deleteDescription: (r) => <>«{r.mill_ka_naam}» حذف ہو جائے گی۔ اگر یہ کسی پرچی میں استعمال ہوئی ہے تو حذف نہیں ہو گی۔</>,
}

// ---------------------------------------------------------------- ملازمین
const mulazmeenConfig: EntityConfig<Mulazim> = {
  table: "mulazmeen",
  title: "ملازمین",
  description: "عملہ اور ماہانہ تنخواہیں",
  icon: IdCard,
  singular: "ملازم",
  fields: [
    { name: "naam", label: "نام", required: true, placeholder: "مثلاً: محمد عرفان" },
    {
      name: "ohda",
      label: "عہدہ",
      placeholder: "مثلاً: منشی",
      suggestions: ["منشی", "کانٹا آپریٹر", "چوکیدار", "مزدور", "ڈرائیور", "اکاؤنٹنٹ"],
    },
    { name: "mahana_tankhwah", label: "ماہانہ تنخواہ", type: "number", unit: "روپے", placeholder: "0", full: true },
    { name: "joining_tareekh", label: "شمولیت کی تاریخ", type: "date", hint: "جس دن ملازمت شروع کی (اختیاری)" },
    {
      name: "leaving_tareekh",
      label: "ملازمت چھوڑنے کی تاریخ",
      type: "date",
      hint: "خالی چھوڑیں اگر ملازم ابھی کام کر رہا ہے",
      notBefore: { field: "joining_tareekh", message: "چھوڑنے کی تاریخ شمولیت کی تاریخ سے پہلے نہیں ہو سکتی" },
    },
  ],
  searchText: (r) => [r.naam, r.ohda, chhorChuka(r) ? "سابق ملازم" : "موجودہ ملازم"].join(" "),
  columns: [
    {
      label: "نام",
      cell: (r) => <span className={cn("font-semibold", chhorChuka(r) && "text-muted-foreground")}>{r.naam}</span>,
    },
    { label: "عہدہ", cell: (r) => (r.ohda ? <Badge variant="secondary">{r.ohda}</Badge> : dash) },
    { label: "ماہانہ تنخواہ", cell: (r) => <Raqam value={r.mahana_tankhwah} /> },
    { label: "شمولیت کی تاریخ", cell: (r) => (r.joining_tareekh ? formatTareekh(r.joining_tareekh) : dash) },
    { label: "ملازمت چھوڑنے کی تاریخ", cell: (r) => <MulazmatHalat r={r} /> },
  ],
  cardTitle: (r) => r.naam,
  cardSubtitle: (r) => r.ohda || "عہدہ درج نہیں",
  cardMeta: (r) => (
    <>
      <span>
        تنخواہ: <Raqam value={r.mahana_tankhwah} className="font-semibold" />
      </span>
      {r.joining_tareekh && <span className="text-muted-foreground">شمولیت: {formatTareekh(r.joining_tareekh)}</span>}
      <MulazmatHalat r={r} />
    </>
  ),
  deleteDescription: (r) => <>«{r.naam}» کا ریکارڈ حذف ہو جائے گا۔</>,
  // تنخواہوں کا مجموعہ صرف موجودہ ملازمین کا — جو ملازمت چھوڑ چکے وہ شامل نہیں
  footer: (rows) => {
    const maujooda = rows.filter((r) => !chhorChuka(r))
    return (
      <div className="flex items-center justify-between gap-3 font-semibold">
        <span>
          موجودہ ملازمین (<Num value={maujooda.length} />) کی کل ماہانہ تنخواہیں
        </span>
        <Raqam value={maujooda.reduce((s, r) => s + Number(r.mahana_tankhwah), 0)} />
      </div>
    )
  },
}

/** ملازم ملازمت چھوڑ چکا ہے؟ (چھوڑنے کی تاریخ آج یا اس سے پہلے کی ہو) */
function chhorChuka(r: Mulazim) {
  return Boolean(r.leaving_tareekh && r.leaving_tareekh <= todayPK())
}

/** «موجودہ» یا «سابق ملازم · 10 نومبر، 2026» (آگے کی تاریخ ہو تو «… کو چھوڑے گا») */
function MulazmatHalat({ r }: { r: Mulazim }) {
  if (!r.leaving_tareekh) return <Badge variant="secondary">موجودہ</Badge>
  if (!chhorChuka(r))
    return (
      <span className="flex flex-wrap items-center gap-1.5">
        <Badge variant="secondary">موجودہ</Badge>
        <span className="text-xs text-muted-foreground">{formatTareekh(r.leaving_tareekh)} کو چھوڑے گا</span>
      </span>
    )
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      <Badge variant="outline">سابق ملازم</Badge>
      <span className="text-muted-foreground">{formatTareekh(r.leaving_tareekh)}</span>
    </span>
  )
}

export function PartiesView() {
  return <CrudPage config={partiesConfig} />
}
export function GaariyanView() {
  return <CrudPage config={gaariyanConfig} />
}
export function MillsView() {
  return <CrudPage config={millsConfig} />
}
export function MulazmeenView() {
  return <CrudPage config={mulazmeenConfig} />
}
