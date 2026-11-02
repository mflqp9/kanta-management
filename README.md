# کانٹا کھاتہ — Kanta Khata System

Single-owner weighbridge (کانٹا) app for Liaquatpur: وزن پرچی with automatic calculation, thermal Urdu slip, جمع بنام کھاتہ, and reports. Pure Urdu RTL UI, green & white theme, light/dark mode, works on laptop, tablet and mobile.

Stack: Next.js 16 (App Router, Turbopack) · Tailwind CSS 4 · shadcn/ui (Radix, RTL) · Supabase (Auth + Postgres) · SWR.

## Setup (one time)

1. **Supabase project** — create one at supabase.com.
2. **Admin email** — open [supabase/schema.sql](supabase/schema.sql), replace `admin@example.com` inside `is_admin()` with your email.
3. **Run the SQL** — Supabase Dashboard → SQL Editor → paste the whole file → Run. (Safe to re-run; it never drops anything.)
4. **Create the admin user** — Authentication → Users → *Add user* → same email + a strong password, tick *Auto Confirm User*.
5. **Disable sign-ups** — Authentication → Sign In / Providers → turn off *Allow new users to sign up*.
6. **Env** — copy `.env.example` to `.env` (or `.env.local`) and fill in the URL, publishable (or anon) key, the same admin email, and your business name/address/phone.
7. Run:

   ```bash
   npm install
   npm run dev      # http://localhost:3000
   ```

Production: `npm run build && npm start`, or deploy to Vercel with the same env variables.

## Pages

| Route | صفحہ |
| --- | --- |
| `/` | مرکزی صفحہ (public landing) — business name, address, phone, سہولیات, لاگ ان button |
| `/guide` | رہنمائی (public) — module-wise Urdu user guide, linked from the landing header |
| `/login` | لاگ ان (password only — email comes from env; no signup by design) |
| `/dashboard` | ڈیش بورڈ — today's total and per-جنس weight (گنا، کپاس، گندم، چاول، سرسوں، تل، دیگر), کل بقایا, آج کی آمدن, latest 10 پرچیاں |
| `/wazan-entry` | وزن اندراج — live calculation, save, thermal print (Ctrl+S / Ctrl+P) |
| `/parchiyan` | تمام پرچیاں — date filter, search, reprint, delete |
| `/khata`, `/khata/[partyId]` | کھاتہ list and ledger with running بقایا, manual entries, A4 print |
| `/parties`, `/gaariyan`, `/mills`, `/mulazmeen` | CRUD records |
| `/reports` | مل وار · کٹوتی · بقایا reports with date range and print |
| `/rehnumai` | رہنمائی inside the app menu — same guide as `/guide` (content in `components/rehnumai/rehnumai-view.tsx`) |

## How the money flows

- `khalis_wazan_kg = kul − khali`, `wazan_mann = khalis / 40`, `kul_raqam = mann × rate`, `final_raqam = (mann − katauti) × rate` — computed live in [lib/calc.ts](lib/calc.ts) and enforced again by the `wazan_parchi_hisaab` trigger.
- Saving a parchi fires the `wazan_parchi_khata_sync` trigger, which writes a **جمع** entry (final_raqam) into the kisan's کھاتہ. Deleting the parchi removes that entry too.
- Manual payments/advances to a party are **بنام**; بقایا = جمع − بنام.
- A mill whose کٹوتی rule is a percentage (e.g. `2%`) auto-fills کٹوتی on the entry form.

## Printing

- **Parchi**: 80mm thermal. In the browser print dialog pick the thermal printer, margins *None*, scale 100%.
- **Khata / reports**: A4, black on white in both themes.

Project rules for anyone extending this app are in [CLAUDE.md](CLAUDE.md).
