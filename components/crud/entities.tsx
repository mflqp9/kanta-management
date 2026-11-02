"use client"

import Link from "next/link"
import { BookOpenText, Factory, IdCard, MapPin, Phone, Truck, Users } from "lucide-react"
import { CrudPage } from "@/components/crud/crud-page"
import type { EntityConfig, FieldDef } from "@/components/crud/types"
import { Num, Raqam } from "@/components/num"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Gaari, Mill, Mulazim, Party } from "@/lib/database.types"
import { partyKaNaam } from "@/lib/format"

const dash = <span className="text-muted-foreground">—</span>

// ---------------------------------------------------------------- پارٹیاں
export const PARTY_QISMEN = ["کسان", "بیوپاری", "آڑھتی", "ڈرائیور", "دیگر"]

export const PARTY_FIELDS: FieldDef[] = [
  { name: "naam", label: "نام", required: true, placeholder: "مثلاً: محمد اکرم" },
  { name: "walid_ka_naam", label: "والد کا نام", placeholder: "مثلاً: غلام رسول" },
  { name: "mobile_number", label: "موبائل نمبر", type: "tel", placeholder: "03001234567" },
  { name: "gaon", label: "گاؤں", placeholder: "مثلاً: چک نمبر 12" },
  { name: "qism", label: "قسم", type: "select", options: PARTY_QISMEN, defaultValue: "کسان", full: true },
]

const partiesConfig: EntityConfig<Party> = {
  table: "parties",
  title: "پارٹیاں / کسان",
  description: "کسانوں اور پارٹیوں کا ریکارڈ",
  icon: Users,
  singular: "پارٹی",
  muannas: true,
  fields: PARTY_FIELDS,
  searchText: (r) => [r.naam, r.walid_ka_naam, r.gaon, r.mobile_number, r.qism].join(" "),
  columns: [
    {
      label: "نام",
      cell: (r) => (
        <div>
          <div className="font-semibold">{r.naam}</div>
          {r.walid_ka_naam && <div className="text-xs text-muted-foreground">ولد {r.walid_ka_naam}</div>}
        </div>
      ),
    },
    { label: "گاؤں", cell: (r) => r.gaon || dash },
    { label: "موبائل نمبر", cell: (r) => (r.mobile_number ? <Num>{r.mobile_number}</Num> : dash) },
    { label: "قسم", cell: (r) => (r.qism ? <Badge variant="secondary">{r.qism}</Badge> : dash) },
  ],
  cardTitle: (r) => r.naam,
  cardSubtitle: (r) => (r.walid_ka_naam ? `ولد ${r.walid_ka_naam}` : r.qism),
  cardMeta: (r) => (
    <>
      {r.qism && <Badge variant="secondary">{r.qism}</Badge>}
      {r.gaon && (
        <span className="flex items-center gap-1 text-muted-foreground">
          <MapPin className="size-3.5" />
          {r.gaon}
        </span>
      )}
      {r.mobile_number && (
        <a href={`tel:${r.mobile_number}`} className="flex items-center gap-1 text-primary">
          <Phone className="size-3.5" />
          <Num>{r.mobile_number}</Num>
        </a>
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
  ],
  searchText: (r) => [r.naam, r.ohda].join(" "),
  columns: [
    { label: "نام", cell: (r) => <span className="font-semibold">{r.naam}</span> },
    { label: "عہدہ", cell: (r) => (r.ohda ? <Badge variant="secondary">{r.ohda}</Badge> : dash) },
    { label: "ماہانہ تنخواہ", cell: (r) => <Raqam value={r.mahana_tankhwah} /> },
  ],
  cardTitle: (r) => r.naam,
  cardSubtitle: (r) => r.ohda || "عہدہ درج نہیں",
  cardMeta: (r) => (
    <span>
      تنخواہ: <Raqam value={r.mahana_tankhwah} className="font-semibold" />
    </span>
  ),
  deleteDescription: (r) => <>«{r.naam}» کا ریکارڈ حذف ہو جائے گا۔</>,
  footer: (rows) => (
    <div className="flex items-center justify-between font-semibold">
      <span>کل ماہانہ تنخواہیں</span>
      <Raqam value={rows.reduce((s, r) => s + Number(r.mahana_tankhwah), 0)} />
    </div>
  ),
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
