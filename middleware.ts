import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ADMIN_COOKIE, verifySessionToken } from '~/utils/auth'

// Protects the admin panel and its APIs. The login page and login API are
// exempt so an unauthenticated user can actually sign in.
export async function middleware(request: NextRequest) {
  let { pathname } = request.nextUrl

  // Allow the login page and the login/logout API through.
  if (pathname === '/admin/login' || pathname.startsWith('/api/admin/login')) {
    return NextResponse.next()
  }

  let token = request.cookies.get(ADMIN_COOKIE)?.value
  let valid = await verifySessionToken(token)
  if (valid) return NextResponse.next()

  // API routes get a 401; page routes redirect to login.
  if (pathname.startsWith('/api/admin')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  let loginUrl = new URL('/admin/login', request.url)
  loginUrl.searchParams.set('from', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/api/admin/:path*'],
}
