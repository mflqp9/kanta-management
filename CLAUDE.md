@AGENTS.md

# کانٹا کھاتہ سسٹم — Project Rules

One weighbridge (کانٹا) business in Liaquatpur. Single admin user. Not SaaS, no multi-tenant code, no `user_id` columns.

## 1. Language & direction
- `<html dir="rtl" lang="ur">`. Every visible string is pure Urdu (اردو رسم الخط) — buttons, labels, placeholders, toasts, errors, empty states, `sr-only` text, `<title>`.
- Standard button words: محفوظ کریں · ترمیم کریں · حذف کریں · نیا شامل کریں · تلاش کریں · پرنٹ کریں · منسوخ کریں · بند کریں.
- Numbers use Latin digits with the `font-num` class (tabular, LTR). Dates via `formatTareekh()` in [lib/format.ts](lib/format.ts) (e.g. "27 اکتوبر، 2026").
- Supabase / network errors are shown through `urduError()` in [lib/errors.ts](lib/errors.ts) — never raw English messages.
- Use logical Tailwind classes only (`ms-/me-/ps-/pe-/start-/end-/text-start`), never `ml-/mr-/left-/right-` for layout.

## 2. Theme — one colour
- Single brand colour: green (`--primary`). White surfaces in light mode, deep-green surfaces in dark mode. Colours come only from the CSS tokens in [app/globals.css](app/globals.css) (`bg-primary`, `text-muted-foreground`, …). No hard-coded hex / Tailwind palette colours in components.
- Red (`destructive`) is allowed only for delete actions, errors and negative balances.
- Light + dark mode via `next-themes` (class strategy). Every new component must look right in both.
- Font: Noto Nastaliq Urdu (`--font-nastaliq`). Nastaliq needs tall line boxes: don't use `leading-none` / `leading-tight` on Urdu text; controls are at least `h-10`.

## 3. Responsive — laptop + tablet + mobile
- Mobile-first. Check every page at 360px, 768px and 1280px.
- Below `lg` the sidebar becomes a sheet + bottom nav; tables become card lists below `md` (see [components/crud/crud-page.tsx](components/crud/crud-page.tsx) for the pattern).
- Touch targets ≥ 40px; numeric inputs use `inputMode="decimal"` and `dir="ltr"`.

## 4. Data & Supabase
- Browser client only: `getSupabase()` from [lib/supabaseClient.ts](lib/supabaseClient.ts). Types in [lib/database.types.ts](lib/database.types.ts) — update them whenever [supabase/schema.sql](supabase/schema.sql) changes.
- Auth: one admin email (`NEXT_PUBLIC_ADMIN_EMAIL`), password only, no signup page. [proxy.ts](proxy.ts) redirects every logged-out request to `/login` except the public pages in `PUBLIC_PAGES` (`/` landing, `/guide`). RLS allows only `is_admin()`.
- Wazan calculation lives in [lib/calc.ts](lib/calc.ts) and is mirrored by the `wazan_parchi_hisaab` trigger — change both together. The `wazan_parchi_khata_sync` trigger writes the کھاتہ جمع entry; the client must not insert it separately.
- Reads that can exceed 1000 rows go through `fetchAll()` or an SQL RPC; aggregates are done in SQL.
- Dates are Pakistan dates (`Asia/Karachi`) — use `todayPK()`.

## 5. Next.js 16 specifics
- `cacheComponents` is on: client hooks that read the URL (`usePathname`, `useParams`, `useSearchParams`) on dynamic routes must sit inside `<Suspense>`.
- Pages stay mounted (React Activity) when navigating away — reset transient state (dialogs, success messages) deliberately.
- Middleware is `proxy.ts` (not `middleware.ts`).

## 6. Printing
- Thermal parchi (80mm): `usePrint().printSlip(<ParchiSlip … />)` from [components/print/print-provider.tsx](components/print/print-provider.tsx).
- A4 pages (کھاتہ, رپورٹس): `window.print()`; hide chrome with `print:hidden`, show print-only headers with `hidden print:block`.
- Printed output is always black on white, in both themes.
