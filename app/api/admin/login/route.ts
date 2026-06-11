import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'
import { ADMIN_COOKIE, createSessionToken, SESSION_MAX_AGE_SECONDS } from '~/utils/auth'

// POST { password } → sets a signed session cookie on success.
export async function POST(request: NextRequest) {
  try {
    let { password } = await request.json()
    let expected = process.env.ADMIN_PASSWORD
    if (!expected) {
      return Response.json({ message: 'ADMIN_PASSWORD 未配置' }, { status: 500 })
    }
    if (typeof password !== 'string' || password !== expected) {
      return Response.json({ message: '密码错误' }, { status: 401 })
    }

    let token = await createSessionToken()
    let store = await cookies()
    store.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: SESSION_MAX_AGE_SECONDS,
    })
    return Response.json({ ok: true })
  } catch (e) {
    console.error(e)
    return Response.json({ message: 'Internal Server Error!' }, { status: 500 })
  }
}

// DELETE → clears the session cookie (logout).
export async function DELETE() {
  let store = await cookies()
  store.delete(ADMIN_COOKIE)
  return Response.json({ ok: true })
}
