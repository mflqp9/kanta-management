import {
  BookOpenText,
  ChartColumnBig,
  Factory,
  GraduationCap,
  IdCard,
  LayoutDashboard,
  ReceiptText,
  Scale,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react"

export type NavItem = {
  href: string
  label: string
  /** نیچے والے موبائل مینو میں مختصر نام */
  short?: string
  icon: LucideIcon
}

export const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "روزمرہ کام",
    items: [
      { href: "/dashboard", label: "ڈیش بورڈ", short: "ڈیش بورڈ", icon: LayoutDashboard },
      { href: "/wazan-entry", label: "وزن اندراج", short: "وزن", icon: Scale },
      { href: "/parchiyan", label: "تمام پرچیاں", short: "پرچیاں", icon: ReceiptText },
      { href: "/khata", label: "جمع بنام کھاتہ", short: "کھاتہ", icon: BookOpenText },
    ],
  },
  {
    title: "ریکارڈ",
    items: [
      { href: "/parties", label: "پارٹیاں / کسان", icon: Users },
      { href: "/gaariyan", label: "گاڑیاں", icon: Truck },
      { href: "/mills", label: "ملیں", icon: Factory },
      { href: "/mulazmeen", label: "ملازمین", icon: IdCard },
    ],
  },
  {
    title: "تجزیہ",
    items: [{ href: "/reports", label: "رپورٹس", short: "رپورٹس", icon: ChartColumnBig }],
  },
  {
    title: "مدد",
    items: [{ href: "/rehnumai", label: "رہنمائی", icon: GraduationCap }],
  },
]

export const ALL_NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items)

/** موبائل کے نیچے والے مینو کے آئٹمز (درمیان میں وزن اندراج) */
export const BOTTOM_NAV = ["/dashboard", "/khata", "/wazan-entry", "/parchiyan", "/reports"].map(
  (href) => ALL_NAV_ITEMS.find((i) => i.href === href)!,
)

export function isActive(pathname: string | null, href: string) {
  if (!pathname) return false
  return pathname === href || pathname.startsWith(`${href}/`)
}
