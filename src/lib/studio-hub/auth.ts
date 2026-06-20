/* =============================================================================
   STUDIO HUB — authentication (single password + signed cookie)

   The hub used to be "secret URL, no login". Now that it has a public API
   backed by a real database, we gate it behind ONE password (yours):

     1. You POST the password to /api/studio-hub/login.
     2. If it matches STUDIO_HUB_PASSWORD, we set an httpOnly cookie whose value
        is signed (HMAC-SHA256) with STUDIO_HUB_SECRET and carries an expiry.
     3. Every /api/studio-hub call re-checks that cookie before touching data.

   The signature means the cookie can't be forged without the secret, and
   httpOnly means page JavaScript (or an XSS) can't read it. No user table, no
   sessions table — overkill for a one-person tool.
   ============================================================================= */

import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'studio_hub_auth';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // stay logged in for 30 days

function getSecret(): string {
  const s = process.env.STUDIO_HUB_SECRET;
  if (!s) throw new Error('STUDIO_HUB_SECRET environment variable is not set');
  return s;
}

// HMAC-sign an expiry timestamp -> hex signature.
function signExpiry(expiry: number): string {
  return createHmac('sha256', getSecret()).update(String(expiry)).digest('hex');
}

// Constant-time string compare (avoids leaking length/contents via timing).
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

// Compare a submitted password to the configured one, in constant time.
export function passwordMatches(submitted: unknown): boolean {
  const expected = process.env.STUDIO_HUB_PASSWORD;
  if (!expected) throw new Error('STUDIO_HUB_PASSWORD environment variable is not set');
  if (typeof submitted !== 'string') return false;
  return safeEqual(submitted, expected);
}

// The cookie name + value + options for a fresh 30-day session. The route
// handler sets this on its NextResponse.
export function buildSessionCookie() {
  const expiry = Date.now() + MAX_AGE_SECONDS * 1000;
  const value = `${expiry}.${signExpiry(expiry)}`;
  return {
    name: COOKIE_NAME,
    value,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS-only in prod
      sameSite: 'lax' as const,
      path: '/',
      maxAge: MAX_AGE_SECONDS,
    },
  };
}

// Read + verify the request cookie. True only if the signature checks out and
// the expiry is still in the future.
export async function isAuthed(): Promise<boolean> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return false;

  const [expiryStr, sig] = raw.split('.');
  if (!expiryStr || !sig) return false;

  const expiry = Number(expiryStr);
  if (!Number.isFinite(expiry) || Date.now() > expiry) return false;

  return safeEqual(sig, signExpiry(expiry));
}
