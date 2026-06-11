// Admin session auth using WebCrypto HMAC-SHA256, so the SAME code verifies in
// both the Edge middleware and Node API routes. A session is a signed token:
//   `<expiryMs>.<hex-hmac(expiryMs)>`
// No secrets or user data are stored in it — possession of a valid signature is
// the proof of login. Keep ADMIN_SESSION_SECRET private.

export const ADMIN_COOKIE = 'admin_session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7 // 7 days

function getSecret(): string {
  let secret = process.env.ADMIN_SESSION_SECRET
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not set')
  return secret
}

let encoder = new TextEncoder()

async function hmac(message: string): Promise<string> {
  let key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  let sig = await crypto.subtle.sign('HMAC', key, encoder.encode(message))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/** Creates a signed session token valid for SESSION_TTL_MS. */
export async function createSessionToken(): Promise<string> {
  let expiry = String(Date.now() + SESSION_TTL_MS)
  let sig = await hmac(expiry)
  return `${expiry}.${sig}`
}

/** Constant-time-ish verification of a session token (signature + expiry). */
export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false
  let [expiry, sig] = token.split('.')
  if (!expiry || !sig) return false
  if (Number(expiry) < Date.now()) return false
  let expected = await hmac(expiry)
  if (expected.length !== sig.length) return false
  // length-safe compare
  let diff = 0
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i)
  }
  return diff === 0
}

export const SESSION_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000
