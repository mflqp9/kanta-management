import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "").toLowerCase()

/** لاگ ان کے بغیر کھلنے والے صفحات: مرکزی صفحہ اور رہنمائی */
const PUBLIC_PAGES = new Set(["/", "/guide"])

/** ہر صفحے سے پہلے: سیشن تازہ کریں، لاگ آؤٹ صارف کو /login بھیجیں (PUBLIC_PAGES سب کے لیے کھلے ہیں) */
export async function proxy(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname === "/login"
  const isPublicPage = PUBLIC_PAGES.has(request.nextUrl.pathname)

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    // سیٹ اپ مکمل نہیں — لاگ ان صفحہ سیٹ اپ کی ہدایات دکھاتا ہے
    return isLoginPage || isPublicPage ? NextResponse.next() : NextResponse.redirect(new URL("/login", request.url))
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value))
      },
    },
  })

  const { data } = await supabase.auth.getClaims()
  const email = String(data?.claims?.email ?? "").toLowerCase()
  const isAdmin = Boolean(email) && (!ADMIN_EMAIL || email === ADMIN_EMAIL)

  if (!isAdmin && !isLoginPage && !isPublicPage) {
    return redirectWithCookies(request, response, "/login")
  }
  if (isAdmin && isLoginPage) {
    return redirectWithCookies(request, response, "/dashboard")
  }
  return response
}

function redirectWithCookies(request: NextRequest, from: NextResponse, path: string) {
  const redirect = NextResponse.redirect(new URL(path, request.url))
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
  return redirect
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|manifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)"],
}
