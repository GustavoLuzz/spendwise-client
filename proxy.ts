import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  const { pathname } = request.nextUrl

  const isAuthRoute = pathname === "/login" || pathname === "/signup"
  const isLoginApiRoute = pathname === "/api/auth/login"
  const isBackendApiRoute = pathname.startsWith("/api/backend/")

  if (isLoginApiRoute || isBackendApiRoute) {
    return NextResponse.next()
  }

  if (!isAuthRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)"],
}
