-- =============================================================================
-- STUDIO HUB — database schema  (Neon Postgres, project "koyko-studio-hub")
--
-- This file is documentation + a recovery script. Next.js does NOT run it
-- automatically. If you ever need to recreate the table (new Neon project,
-- accidental drop, etc.), paste this into the Neon SQL editor or run:
--
--   psql "$DATABASE_URL" -f src/lib/studio-hub/schema.sql
--
-- Design decision: one row, three JSONB columns.
-- Instead of normalised tables, the entire studio-hub state is stored as a
-- single JSON blob per "user" (always just the one row with id='default').
-- This mirrors the old localStorage shape exactly, so no data transformation
-- is needed and no migrations are required when the shape of a task/plan
-- changes — it's just JSON.
-- =============================================================================

CREATE TABLE IF NOT EXISTS studio_hub_state (
  -- Fixed primary key — we only ever have one row.
  id          text PRIMARY KEY DEFAULT 'default',

  -- The blobs that used to live in localStorage (+ leads, added later):
  --   tasks   → Task[]       (weekly task list)
  --   running → RunningMap   (task id → timer start timestamp)
  --   plans   → Plan[]       (user-authored Plan Marea plans)
  --   leads   → Lead[]       (CRM pipeline leads)
  tasks       jsonb        NOT NULL DEFAULT '[]'::jsonb,
  running     jsonb        NOT NULL DEFAULT '{}'::jsonb,
  plans       jsonb        NOT NULL DEFAULT '[]'::jsonb,
  leads       jsonb        NOT NULL DEFAULT '[]'::jsonb,

  -- Timestamp of the last write (useful for debugging / auditing).
  updated_at  timestamptz  NOT NULL DEFAULT now()
);

-- Migration for tables created before the `leads` column existed.
-- (Safe to re-run: IF NOT EXISTS makes this a no-op once applied.)
ALTER TABLE studio_hub_state
  ADD COLUMN IF NOT EXISTS leads jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Seed the single default row if it doesn't exist yet.
-- (Safe to re-run: ON CONFLICT does nothing if the row is already there.)
INSERT INTO studio_hub_state (id)
VALUES ('default')
ON CONFLICT (id) DO NOTHING;
