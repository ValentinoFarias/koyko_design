/* =============================================================================
   API: /api/studio-hub   (GET = read state, PUT = save state)

   Both methods require a valid login cookie (see ../../../lib/studio-hub/auth).
   - GET  -> { tasks, running, plans }   (401 if not logged in)
   - PUT  -> saves the posted { tasks, running, plans }, returns { ok: true }

   This runs on the Node.js runtime (default) because the auth helpers use
   Node's `crypto`.
   ============================================================================= */

import { NextResponse } from 'next/server';
import { isAuthed } from '../../../lib/studio-hub/auth';
import { readState, writeState } from '../../../lib/studio-hub/db';

// Never cache: this is live, per-request user data.
export const dynamic = 'force-dynamic';

// Turn an unknown thrown value into a readable message for logs/responses.
function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

// --- Read the whole studio-hub state ---
export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const state = await readState();
    return NextResponse.json(state);
  } catch (e) {
    console.error('studio-hub GET error:', e);
    return NextResponse.json({ error: errorMessage(e) }, { status: 500 });
  }
}

// --- Overwrite the whole studio-hub state ---
export async function PUT(request: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();

    // Defensive normalisation: only accept the three expected shapes, so a
    // malformed body can never corrupt the row.
    const state = {
      tasks: Array.isArray(body?.tasks) ? body.tasks : [],
      running:
        body?.running && typeof body.running === 'object' && !Array.isArray(body.running)
          ? body.running
          : {},
      plans: Array.isArray(body?.plans) ? body.plans : [],
      leads: Array.isArray(body?.leads) ? body.leads : [],
      projects: Array.isArray(body?.projects) ? body.projects : [],
      todos: Array.isArray(body?.todos) ? body.todos : [],
    };

    await writeState(state);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('studio-hub PUT error:', e);
    return NextResponse.json({ error: errorMessage(e) }, { status: 500 });
  }
}
