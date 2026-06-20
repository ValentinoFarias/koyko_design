/* =============================================================================
   API: POST /api/studio-hub/login

   Body: { password: string }
   - Correct password -> sets the signed httpOnly session cookie, returns { ok }.
   - Wrong/missing     -> 401, no cookie.

   Runs on the Node.js runtime (default) because auth uses Node's `crypto`.
   ============================================================================= */

import { NextResponse } from 'next/server';
import { passwordMatches, buildSessionCookie } from '../../../../lib/studio-hub/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // Parse defensively — a missing/garbage body just becomes a failed login.
  const body = await request.json().catch(() => ({}));

  if (!passwordMatches(body?.password)) {
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  const cookie = buildSessionCookie();
  res.cookies.set(cookie.name, cookie.value, cookie.options);
  return res;
}
