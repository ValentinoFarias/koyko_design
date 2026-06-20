/* =============================================================================
   STUDIO HUB — database access (Neon Postgres)

   The whole studio hub is a single-user tool, so instead of normalised tables
   we keep ALL of its state in ONE row of a `studio_hub_state` table:

     id='default' | tasks (jsonb) | running (jsonb) | plans (jsonb) | updated_at

   That mirrors exactly what used to live in three localStorage keys, so the
   client can read/write the whole blob in one go. No migrations needed when the
   shape of a task or plan changes — it's just JSON.

   Uses @neondatabase/serverless: an HTTP-based Postgres client that works well
   in serverless/Next API routes (no long-lived connection pool to manage).
   ============================================================================= */

import { neon } from '@neondatabase/serverless';

// The shape the client sends/receives. We keep the inner items as `unknown[]`
// here because the server doesn't need to understand Task/Plan internals — it
// just stores and returns them. The client owns the real types.
export type StudioHubState = {
  tasks: unknown[];
  running: Record<string, unknown>;
  plans: unknown[];
};

// Everything lives in a single row identified by this fixed id.
const ROW_ID = 'default';

// Create the SQL client lazily so a missing DATABASE_URL throws a clear error
// at request time, not while Next is building.
function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL environment variable is not set');
  return neon(url);
}

// Read the single state row. Returns sensible empties if the row is missing.
export async function readState(): Promise<StudioHubState> {
  const sql = getSql();
  const rows = (await sql`
    SELECT tasks, running, plans
    FROM studio_hub_state
    WHERE id = ${ROW_ID}
  `) as Array<{ tasks: unknown[]; running: Record<string, unknown>; plans: unknown[] }>;

  const row = rows[0];
  return {
    tasks: row?.tasks ?? [],
    running: row?.running ?? {},
    plans: row?.plans ?? [],
  };
}

// Overwrite the single state row with the client's full state.
// We JSON.stringify + cast `::jsonb` so arrays are stored as JSON (not mistaken
// for a Postgres array literal), then UPSERT so it works whether or not the row
// already exists.
export async function writeState(state: StudioHubState): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO studio_hub_state (id, tasks, running, plans, updated_at)
    VALUES (
      ${ROW_ID},
      ${JSON.stringify(state.tasks)}::jsonb,
      ${JSON.stringify(state.running)}::jsonb,
      ${JSON.stringify(state.plans)}::jsonb,
      now()
    )
    ON CONFLICT (id) DO UPDATE SET
      tasks      = EXCLUDED.tasks,
      running    = EXCLUDED.running,
      plans      = EXCLUDED.plans,
      updated_at = now()
  `;
}
