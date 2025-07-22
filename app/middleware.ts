import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  try {
    // Skip middleware for API routes, static files, and auth
    if (
      request.nextUrl.pathname.startsWith("/api") ||
      request.nextUrl.pathname.startsWith("/_next") ||
      request.nextUrl.pathname.startsWith("/auth") ||
      request.nextUrl.pathname.includes(".")
    ) {
      return NextResponse.next()
    }

    // Simple redirect logic without i18n
    return NextResponse.next()
  } catch (e) {
    console.error("Middleware error:", e)
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
