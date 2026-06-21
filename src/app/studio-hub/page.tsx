'use client';

/* =============================================================================
   STUDIO HUB — internal business OS for Koyko Design Studio

   A private, noindex route (see the sibling layout.tsx) organised into area
   tabs: Dashboard (weekly board + timers + Plan Marea), Sales (Leads CRM),
   Clients (project kanban), and Marketing / Admin (todo lists).

   State persists to a single row of Postgres (Neon) via /api/studio-hub, gated
   behind one password + a signed cookie (see ../../lib/studio-hub/auth.ts).
   The whole state — { tasks, running, plans, leads, projects, todos } — is read
   and written as one JSON blob (see ../../lib/studio-hub/db.ts).

   It's a client component because it relies on browser-only APIs: timers
   (setInterval), drag-and-drop, and the current date.
   ============================================================================= */

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  type FormEvent,
  type ReactNode,
} from 'react';
import styles from './studio-hub.module.css';
import StudioLeads, { type Lead } from './StudioLeads';
import StudioClients, { type Project } from './StudioClients';
import StudioTodos, { type Todo } from './StudioTodos';

/* ---------------------------------------------------------------------------
   Types + constants
   --------------------------------------------------------------------------- */

type Task = {
  id: string;
  title: string;
  category: string; // '' = no category, otherwise one of CATEGORIES
  weekKey: string; // ISO format, e.g. "2025-W24"
  createdAt: number; // epoch ms
  completedAt: number | null; // epoch ms when marked done
  done: boolean;
  failed: boolean;
  failedAt: number | null; // epoch ms when marked failed (manually or auto)
  timeLogged: number; // committed seconds tracked against this task
};

// `running` maps a task id -> the epoch-ms the current timer session started.
// It lives in its own localStorage key so a running timer survives a reload.
type RunningMap = Record<string, number>;

// A user-authored Plan Marea plan: a named checklist that auto-activates (its
// tasks are added to the dashboard) when its activation week arrives.
type PlanTaskTemplate = { title: string; category: string };
type Plan = {
  id: string;
  name: string;
  tasks: PlanTaskTemplate[];
  activationDate: string;       // "YYYY-MM-DD" — the day it should activate
  active: boolean;              // armed/enabled by the user
  activatedWeek: string | null; // weekKey it has already been activated into
};

const CATEGORIES = [
  'DMs',
  'Instagram',
  'Follow-up',
  'Admin',
  'Design',
  'Dev',
  'Other',
] as const;

const STORAGE_KEY = 'koyko-dashboard-tasks';
const RUNNING_KEY = 'koyko-dashboard-running';

// Plan Marea runs for a fixed number of weeks (shown as "Week N of 13").
const PLAN_WEEKS = 13;

/* ---- Plan Marea: user-authored plans ---- */
const MAREA_PLANS_KEY = 'koyko-marea-plans';   // Plan[]

// The fixed weekly checklist activated by Plan Marea (12 tasks, ~3h).
const PLAN_MAREA_TASKS: { title: string; category: string }[] = [
  { title: 'DM en frío — restaurante/negocio Bristol #1', category: 'DMs' },
  { title: 'DM en frío — restaurante/negocio Bristol #2', category: 'DMs' },
  { title: 'DM en frío — restaurante/negocio Bristol #3', category: 'DMs' },
  { title: 'DM en frío — restaurante/negocio Bristol #4', category: 'DMs' },
  { title: 'DM en frío — restaurante/negocio Bristol #5', category: 'DMs' },
  { title: 'Publicar 1 post (portfolio, proceso u opinión)', category: 'Instagram' },
  { title: 'Comentar 5 cuentas de restaurantes/negocios en Bristol', category: 'Instagram' },
  { title: 'Responder todos los DMs y comentarios', category: 'Instagram' },
  { title: 'Follow-up a leads que no respondieron la semana anterior', category: 'Follow-up' },
  { title: 'Mensaje a cliente activo (relación y referidos)', category: 'Follow-up' },
  { title: 'Revisar métricas Instagram (alcance, saves, DMs nuevos)', category: 'Admin' },
  { title: 'Revisión semanal: ¿qué funcionó, qué no? (15 min)', category: 'Admin' },
];

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/* Chart canvas geometry, in SVG viewBox user units. The viewBox scales to fit
   the container, so all positions below are computed against these fixed dims. */
const CW = 820; // canvas width
const CH = 300; // canvas height
const PAD_L = 46;
const PAD_R = 16;
const PAD_T = 16;
const PAD_B = 34;
const PX0 = PAD_L;        // plot-area left
const PX1 = CW - PAD_R;   // plot-area right
const PY0 = PAD_T;        // plot-area top
const PY1 = CH - PAD_B;   // plot-area bottom (baseline)

/* ---------------------------------------------------------------------------
   Date / ISO-week helpers
   ISO 8601: weeks start Monday; week 1 is the week containing Jan 4th.
   --------------------------------------------------------------------------- */

// Monday (local midnight) of the week containing `date`.
function mondayOf(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = (d.getDay() + 6) % 7; // convert Sun=0..Sat=6 -> Mon=0..Sun=6
  d.setDate(d.getDate() - day);
  return d;
}

// ISO week number + ISO week-year for a date.
function isoWeek(date: Date): { year: number; week: number } {
  // Compute on a UTC copy to sidestep daylight-saving edge cases.
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - day + 3); // step to the Thursday of this week
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4)); // Jan 4 ∈ week 1
  const ftDay = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - ftDay + 3);
  const week = 1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * 86400000));
  return { year: d.getUTCFullYear(), week };
}

// "2025-W24" for the week containing `date`.
function weekKeyOf(date: Date): string {
  const { year, week } = isoWeek(date);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

// "Week 24 — Jun 9–15" (handles months spanning the week boundary).
function weekLabelOf(monday: Date): string {
  const { week } = isoWeek(monday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const sameMonth = monday.getMonth() === sunday.getMonth();
  const range = sameMonth
    ? `${MONTHS[monday.getMonth()]} ${monday.getDate()}–${sunday.getDate()}`
    : `${MONTHS[monday.getMonth()]} ${monday.getDate()} – ${MONTHS[sunday.getMonth()]} ${sunday.getDate()}`;
  return `Week ${week} — ${range}`;
}

// "Jun 9" from an epoch timestamp.
function fmtDate(ts: number): string {
  const d = new Date(ts);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

// Seconds -> "HH:MM:SS".
function fmtClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hh = String(Math.floor(s / 3600)).padStart(2, '0');
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

// Collision-resistant id with a fallback for older browsers.
function newId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// "YYYY-MM-DD" for a local date (used by plan persistence).
function dateKeyOf(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Parse a "YYYY-MM-DD" string into a local Date.
function parseISODate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y || 1970, (m || 1) - 1, d || 1);
}

// "15 Jun" from a "YYYY-MM-DD" string.
function fmtNiceDate(s: string): string {
  const d = parseISODate(s);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/* ---- Category colours: brand-aligned, just distinct enough to read a chart.
   Warm tones for the comms/social work, cooler tones for the build work. ---- */
const CATEGORY_COLORS: Record<string, string> = {
  DMs: '#EB5120',         // signal
  Instagram: '#C94418',   // deep
  'Follow-up': '#F2954A', // tangerine
  Admin: '#111111',       // ink
  Design: '#5A8A7B',      // sage
  Dev: '#3F6189',         // slate
  Other: '#9C9389',       // warm grey
};
function catColor(cat: string): string {
  return CATEGORY_COLORS[cat] ?? '#9C9389';
}

// Monday date for a "YYYY-Www" ISO week key — the inverse of weekKeyOf().
function weekKeyToMonday(key: string): Date {
  const [y, w] = key.split('-W').map(Number);
  const jan4 = new Date(y, 0, 4);          // Jan 4 is always inside ISO week 1
  const jan4Day = (jan4.getDay() + 6) % 7; // Mon=0..Sun=6
  const monday = new Date(jan4);
  monday.setDate(jan4.getDate() - jan4Day + (w - 1) * 7);
  return monday;
}

// "YYYY-MM" month bucket for the week a task belongs to.
function monthKeyOfWeek(weekKey: string): string {
  const m = weekKeyToMonday(weekKey);
  return `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}`;
}

// Compact duration for chart axes: "45m", "2h", "1.5h".
function fmtDurShort(secs: number): string {
  if (secs <= 0) return '0';
  if (secs < 60) return `${Math.round(secs)}s`;
  const mins = secs / 60;
  if (mins < 60) return `${Math.round(mins)}m`;
  const hrs = secs / 3600;
  return Number.isInteger(hrs) ? `${hrs}h` : `${hrs.toFixed(1)}h`;
}

// Round a value up to a "nice" axis maximum (1, 2, 2.5, 5, 10 × 10ⁿ).
function niceCeil(v: number): number {
  if (v <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / pow;
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return nice * pow;
}

/* ---------------------------------------------------------------------------
   Component
   --------------------------------------------------------------------------- */

export default function StudioHubPage() {
  // `mounted` gates all browser-dependent UI so the server-rendered HTML and
  // the first client render match (no hydration mismatch from Date). It now also
  // means "the initial load from the database has finished".
  const [mounted, setMounted] = useState(false);

  // Which top-level area tab is showing.
  const [tab, setTab] = useState<
    'dashboard' | 'sales' | 'clients' | 'marketing' | 'admin'
  >('dashboard');

  // Auth gate: null = still checking, false = needs password, true = logged in.
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [loginPw, setLoginPw] = useState('');
  const [loginErr, setLoginErr] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [running, setRunning] = useState<RunningMap>({});

  // `anchor` is the Monday of the week currently being viewed.
  const [anchor, setAnchor] = useState<Date>(() => mondayOf(new Date()));

  // `now` is a 1s heartbeat used only to re-render live (running) timers.
  const [now, setNow] = useState<number>(() => Date.now());

  // Add-task form state.
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');

  // Id of the task showing its inline "Delete?" confirmation, if any.
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  // Time-by-category line chart: granularity + currently hovered period index.
  const [chartGran, setChartGran] = useState<'week' | 'month'>('week');
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  // Report + Plans cards: collapse state, the user's named plans, and drafts.
  const [reportWeek, setReportWeek] = useState<string>(() => weekKeyOf(new Date()));
  const [historyOpen, setHistoryOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(true);
  const [plansOpen, setPlansOpen] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planDraft, setPlanDraft] = useState<Record<string, { title: string; cat: string }>>({});
  const [openPlans, setOpenPlans] = useState<Record<string, boolean>>({}); // per-plan collapse

  // Leads CRM pipeline (Sales tab).
  const [leads, setLeads] = useState<Lead[]>([]);
  // Client projects (Clients tab — stage kanban).
  const [projects, setProjects] = useState<Project[]>([]);
  // Marketing + Admin checklists (one list, split by area in the UI).
  const [todos, setTodos] = useState<Todo[]>([]);

  /* ---- Load state from the database (also re-used right after a login) ---- */
  const loadState = useCallback(async () => {
    try {
      const res = await fetch('/api/studio-hub');

      // 401 = no valid session cookie yet -> show the password gate.
      if (res.status === 401) {
        setAuthed(false);
        setMounted(true);
        return;
      }
      if (!res.ok) throw new Error(`Load failed (${res.status})`);

      const data = (await res.json()) as {
        tasks: Task[];
        running: RunningMap;
        plans: Plan[];
        leads: Lead[];
        projects: Project[];
        todos: Todo[];
      };

      let nextTasks = Array.isArray(data.tasks) ? data.tasks : [];
      let nextRunning =
        data.running && typeof data.running === 'object' ? data.running : {};
      let nextPlans = Array.isArray(data.plans) ? data.plans : [];
      const nextLeads = Array.isArray(data.leads) ? data.leads : [];
      const nextProjects = Array.isArray(data.projects) ? data.projects : [];
      const nextTodos = Array.isArray(data.todos) ? data.todos : [];

      // One-time migration: if the database is still empty but THIS browser has
      // old localStorage data, adopt it so nothing you already logged is lost.
      // (We leave localStorage untouched as a backup; next load the DB wins.)
      const dbEmpty =
        nextTasks.length === 0 &&
        nextPlans.length === 0 &&
        Object.keys(nextRunning).length === 0;
      if (dbEmpty) {
        try {
          const lsTasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
          const lsRunning = JSON.parse(localStorage.getItem(RUNNING_KEY) || '{}');
          const lsPlans = JSON.parse(localStorage.getItem(MAREA_PLANS_KEY) || '[]');
          if (lsTasks.length || lsPlans.length || Object.keys(lsRunning).length) {
            nextTasks = lsTasks;
            nextRunning = lsRunning;
            nextPlans = lsPlans;
            // The save effect below pushes this up to the DB right after mount.
          }
        } catch {
          // Corrupt/blocked localStorage — ignore and carry on.
        }
      }

      // Still no plans anywhere? Seed the classic Plan Marea checklist (off).
      if (nextPlans.length === 0) {
        nextPlans = [
          {
            id: newId(),
            name: 'Plan Marea',
            tasks: PLAN_MAREA_TASKS,
            activationDate: dateKeyOf(mondayOf(new Date())),
            active: false,
            activatedWeek: null,
          },
        ];
      }

      setTasks(nextTasks);
      setRunning(nextRunning);
      setPlans(nextPlans);
      setLeads(nextLeads);
      setProjects(nextProjects);
      setTodos(nextTodos);
      setAuthed(true);
      setMounted(true);
    } catch (err) {
      // Hard failure -> fall back to the login gate instead of a blank crash.
      console.error('studio-hub load error:', err);
      setAuthed(false);
      setMounted(true);
    }
  }, []);

  /* ---- On mount: set the week anchor, then load from the database ---- */
  useEffect(() => {
    setAnchor(mondayOf(new Date()));
    loadState();
  }, [loadState]);

  /* ---- Persist to the database (debounced) whenever state changes ---- */
  // The three old localStorage writes become ONE PUT, fired ~800ms after the
  // last change so rapid edits (and timer ticks) don't spam the network.
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!mounted || authed !== true) return; // never save before load / login
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch('/api/studio-hub', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks, running, plans, leads, projects, todos }),
      }).catch((err) => {
        // Network hiccup — the next change retries with the latest state.
        console.error('studio-hub save error:', err);
      });
    }, 800);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [tasks, running, plans, leads, projects, todos, mounted, authed]);

  /* ---- Password gate submit ---- */
  const handleLogin = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setLoggingIn(true);
      setLoginErr('');
      try {
        const res = await fetch('/api/studio-hub/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: loginPw }),
        });
        if (!res.ok) {
          setLoginErr('Wrong password — try again.');
          setLoggingIn(false);
          return;
        }
        // Logged in: clear the field and pull the data down.
        setLoginPw('');
        setLoggingIn(false);
        await loadState();
      } catch {
        setLoginErr('Network error — try again.');
        setLoggingIn(false);
      }
    },
    [loginPw, loadState],
  );

  /* ---- Auto-activate plans whose activation week has arrived ---- */
  useEffect(() => {
    if (!mounted) return;
    const todayMonday = mondayOf(new Date()).getTime();
    // Plans that are armed, not yet activated, and whose week has been reached.
    const due = plans.filter(
      (p) =>
        p.active &&
        !p.activatedWeek &&
        mondayOf(parseISODate(p.activationDate)).getTime() <= todayMonday,
    );
    if (due.length === 0) return;

    // Add each due plan's tasks into its activation week (dedup by title).
    setTasks((prev) => {
      const next = [...prev];
      for (const p of due) {
        const targetWeek = weekKeyOf(parseISODate(p.activationDate));
        const existing = new Set(next.filter((t) => t.weekKey === targetWeek).map((t) => t.title));
        for (const pt of p.tasks) {
          if (existing.has(pt.title)) continue;
          existing.add(pt.title);
          next.unshift({
            id: newId(),
            title: pt.title,
            category: pt.category,
            weekKey: targetWeek,
            createdAt: Date.now(),
            completedAt: null,
            done: false,
            failed: false,
            failedAt: null,
            timeLogged: 0,
          });
        }
      }
      return next;
    });

    // Mark them activated so they never re-add (until re-armed).
    const dueIds = new Set(due.map((p) => p.id));
    setPlans((prev) =>
      prev.map((p) =>
        dueIds.has(p.id)
          ? { ...p, activatedWeek: weekKeyOf(parseISODate(p.activationDate)) }
          : p,
      ),
    );
  }, [plans, mounted]);

  /* ---- Heartbeat: only tick while at least one timer is running ---- */
  useEffect(() => {
    if (Object.keys(running).length === 0) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [running]);

  /* ---- Auto-fail: every Sunday at 8pm, mark all non-done tasks as failed ---- */
  useEffect(() => {
    if (!mounted || authed !== true) return;

    const tryAutoFail = () => {
      const now = new Date();
      // getDay() === 0 is Sunday; hours >= 20 is 8pm or later
      if (now.getDay() !== 0 || now.getHours() < 20) return;
      const currentWeekKey = weekKeyOf(now);
      setTasks((prev) => {
        const hasEligible = prev.some(
          (t) => t.weekKey === currentWeekKey && !t.done && !t.failed,
        );
        if (!hasEligible) return prev;
        const now2 = Date.now();
        return prev.map((t) =>
          t.weekKey === currentWeekKey && !t.done && !t.failed
            ? { ...t, failed: true, failedAt: now2 }
            : t,
        );
      });
    };

    tryAutoFail(); // fire immediately in case the page loads on Sunday 8pm+
    const id = setInterval(tryAutoFail, 60_000);
    return () => clearInterval(id);
  }, [mounted, authed]);

  /* ---- Derived week data ---- */
  const weekKey = weekKeyOf(anchor);
  const isCurrentWeek = mounted && weekKey === weekKeyOf(new Date());

  // Header indicator, derived from the user's plans (not a hardcoded sprint).
  // 0 active -> "Sin plan activo"; 1 -> "{name} · activo/fecha"; n -> "n planes activos".
  const planTag = useMemo(() => {
    const active = plans.filter((p) => p.active);
    if (active.length === 0) return 'Sin plan activo';
    if (active.length > 1) return `${active.length} planes activos`;
    const p = active[0];
    const reached =
      mondayOf(new Date()).getTime() >= mondayOf(parseISODate(p.activationDate)).getTime();
    const live = Boolean(p.activatedWeek) || reached;
    if (!live) return `${p.name} · ${fmtNiceDate(p.activationDate)}`;
    // Calculate which week of the plan we're currently in
    const startMonday = p.activatedWeek
      ? weekKeyToMonday(p.activatedWeek)
      : mondayOf(parseISODate(p.activationDate));
    const currentMonday = mondayOf(new Date());
    const weekNum = Math.round((currentMonday.getTime() - startMonday.getTime()) / (7 * 86400000)) + 1;
    const clampedWeek = Math.max(1, Math.min(weekNum, PLAN_WEEKS));
    return `${p.name} · Activo · Week ${clampedWeek} of ${PLAN_WEEKS}`;
  }, [plans]);

  const weekTasks = useMemo(
    () => tasks.filter((t) => t.weekKey === weekKey),
    [tasks, weekKey],
  );
  const pending = useMemo(() => weekTasks.filter((t) => !t.done && !t.failed), [weekTasks]);
  const done = useMemo(() => weekTasks.filter((t) => t.done), [weekTasks]);
  const failed = useMemo(() => weekTasks.filter((t) => t.failed && !t.done), [weekTasks]);

  // Report has its own week selector, independent from the board's anchor.
  const reportTasks = useMemo(
    () => tasks.filter((t) => t.weekKey === reportWeek),
    [tasks, reportWeek],
  );
  const reportDone = useMemo(() => reportTasks.filter((t) => t.done), [reportTasks]);

  // Sorted list of week keys that have at least one task (most recent first).
  const taskWeeks = useMemo(() => {
    const keys = [...new Set(tasks.map((t) => t.weekKey))].sort().reverse();
    return keys.slice(0, 8);
  }, [tasks]);

  // Live elapsed seconds for a task = committed time + current running session.
  const elapsedOf = useCallback(
    (t: Task): number => {
      const start = running[t.id];
      return t.timeLogged + (start ? Math.floor((now - start) / 1000) : 0);
    },
    [running, now],
  );

  /* ---- Actions ---- */

  const addTask = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const text = title.trim();
      if (!text) return;
      const task: Task = {
        id: newId(),
        title: text,
        category,
        weekKey, // attach to the week currently in view
        createdAt: Date.now(),
        completedAt: null,
        done: false,
        failed: false,
        failedAt: null,
        timeLogged: 0,
      };
      setTasks((prev) => [task, ...prev]);
      setTitle('');
      setCategory('');
    },
    [title, category, weekKey],
  );

  // Fold any running session into timeLogged and stop the timer.
  const commitTimer = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        const start = running[id];
        if (t.id === id && start) {
          return { ...t, timeLogged: t.timeLogged + Math.floor((Date.now() - start) / 1000) };
        }
        return t;
      }),
    );
    setRunning((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, [running]);

  const startTimer = useCallback((id: string) => {
    setRunning((prev) => ({ ...prev, [id]: Date.now() }));
  }, []);

  const toggleDone = useCallback((id: string) => {
    // Completing a running task also stops + banks its timer.
    commitTimer(id);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, done: !t.done, completedAt: !t.done ? Date.now() : null }
          : t,
      ),
    );
  }, [commitTimer]);

  const toggleFailed = useCallback((id: string) => {
    commitTimer(id);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, failed: !t.failed, failedAt: !t.failed ? Date.now() : null }
          : t,
      ),
    );
  }, [commitTimer]);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setRunning((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setConfirmingDelete(null);
  }, []);

  /* ---- Plan manager actions (report "Plan Marea" tab) ---- */

  const updatePlan = useCallback((id: string, patch: Partial<Plan>) => {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, []);

  const createPlan = useCallback(() => {
    const p: Plan = {
      id: newId(),
      name: 'Nuevo plan',
      tasks: [],
      activationDate: dateKeyOf(mondayOf(new Date())),
      active: false,
      activatedWeek: null,
    };
    setPlans((prev) => [...prev, p]);
    setOpenPlans((prev) => ({ ...prev, [p.id]: true })); // open the new plan for editing
  }, []);

  const deletePlan = useCallback((id: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const togglePlanOpen = useCallback((id: string) => {
    setOpenPlans((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // Toggling a plan on re-arms it (activatedWeek -> null) so it can fire again.
  const togglePlanActive = useCallback((id: string) => {
    setPlans((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, active: !p.active, activatedWeek: !p.active ? null : p.activatedWeek }
          : p,
      ),
    );
  }, []);

  // Changing the date re-arms the plan too.
  const setPlanDate = useCallback((id: string, date: string) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, activationDate: date, activatedWeek: null } : p)),
    );
  }, []);

  const addTaskToPlan = useCallback((id: string) => {
    setPlanDraft((draftState) => {
      const draft = draftState[id];
      const title = draft?.title.trim();
      if (!title) return draftState;
      setPlans((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, tasks: [...p.tasks, { title, category: draft?.cat || '' }] } : p,
        ),
      );
      return { ...draftState, [id]: { title: '', cat: '' } };
    });
  }, []);

  const removeTaskFromPlan = useCallback((id: string, index: number) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, tasks: p.tasks.filter((_, i) => i !== index) } : p)),
    );
  }, []);

  /* ---- Weekly report stats (uses reportWeek, not the board's anchor) ---- */
  const stats = useMemo(() => {
    const total = reportTasks.length;
    const completed = reportDone.length;
    const reportFailed = reportTasks.filter((t) => t.failed && !t.done).length;
    const rate = total ? Math.round((completed / total) * 100) : 0;
    const totalTime = reportTasks.reduce((sum, t) => sum + elapsedOf(t), 0);

    // Count tasks per category (skip empties).
    const byCategory: Record<string, number> = {};
    for (const t of reportTasks) {
      if (!t.category) continue;
      byCategory[t.category] = (byCategory[t.category] ?? 0) + 1;
    }
    const categoryRows = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
    const maxCat = categoryRows.reduce((m, [, n]) => Math.max(m, n), 0);

    return {
      total,
      completed,
      failed: reportFailed,
      pending: total - completed - reportFailed,
      rate,
      totalTime,
      categoryRows,
      maxCat,
    };
  }, [reportTasks, reportDone, elapsedOf]);

  /* ---- Dashboard overview tiles: a pulse across all areas ---- */
  const overview = useMemo(() => {
    const thisWeek = weekKeyOf(new Date());
    const wkTasks = tasks.filter((t) => t.weekKey === thisWeek);
    const wkDone = wkTasks.filter((t) => t.done).length;
    const today = dateKeyOf(new Date());
    return {
      // Clients in active delivery (everything not yet 'live').
      activeProjects: projects.filter((p) => p.stage !== 'live').length,
      // Open leads = anything still in the pipeline (not Won/Lost).
      openLeads: leads.filter((l) => l.status !== 'Won' && l.status !== 'Lost').length,
      // Leads needing a chase today (follow-up due, still open).
      dueFollowUps: leads.filter(
        (l) =>
          l.nextFollowUp &&
          l.status !== 'Won' &&
          l.status !== 'Lost' &&
          l.nextFollowUp <= today,
      ).length,
      // Marketing + Admin checklist items still open.
      pendingTodos: todos.filter((t) => !t.done).length,
      // This week's task completion rate.
      weekPct: wkTasks.length ? Math.round((wkDone / wkTasks.length) * 100) : 0,
    };
  }, [tasks, projects, leads, todos]);

  /* ---- Time-by-category line chart data (weekly or monthly) ---- */
  const chart = useMemo(() => {
    // Bucket tracked seconds: period key -> category -> seconds.
    const buckets = new Map<string, Map<string, number>>();
    for (const t of tasks) {
      if (!t.category) continue; // uncategorised time isn't plotted
      const secs = elapsedOf(t);
      if (secs <= 0) continue;
      const pkey = chartGran === 'week' ? t.weekKey : monthKeyOfWeek(t.weekKey);
      let m = buckets.get(pkey);
      if (!m) { m = new Map(); buckets.set(pkey, m); }
      m.set(t.category, (m.get(t.category) ?? 0) + secs);
    }
    if (buckets.size === 0) return { state: 'empty' as const };

    // Build a continuous, chronological span from the first to the last period
    // that has data, filling the gaps in between with zeros.
    const sorted = [...buckets.keys()].sort(); // zero-padded keys sort correctly
    let periods: string[] = [];
    if (chartGran === 'week') {
      let d = weekKeyToMonday(sorted[0]);
      const end = weekKeyToMonday(sorted[sorted.length - 1]);
      while (d <= end) {
        periods.push(weekKeyOf(d));
        const next = new Date(d);
        next.setDate(d.getDate() + 7);
        d = next;
      }
    } else {
      let [y, mo] = sorted[0].split('-').map(Number);
      const [ly, lm] = sorted[sorted.length - 1].split('-').map(Number);
      while (y < ly || (y === ly && mo <= lm)) {
        periods.push(`${y}-${String(mo).padStart(2, '0')}`);
        mo++;
        if (mo > 12) { mo = 1; y++; }
      }
    }

    // Keep only the most recent window so the axis never gets too crowded.
    const MAX = 12;
    if (periods.length > MAX) periods = periods.slice(periods.length - MAX);

    // Which categories actually have time inside the visible window?
    const visible = new Set(periods);
    const totals = new Map<string, number>();
    for (const [pk, m] of buckets) {
      if (!visible.has(pk)) continue;
      for (const [c, s] of m) totals.set(c, (totals.get(c) ?? 0) + s);
    }
    const cats = CATEGORIES.filter((c) => (totals.get(c) ?? 0) > 0);

    // A line needs at least two periods (and at least one category) to exist.
    if (periods.length < 2 || cats.length === 0) return { state: 'sparse' as const };

    const series = cats.map((cat) => ({
      cat,
      color: catColor(cat),
      total: totals.get(cat) ?? 0,
      points: periods.map((pk) => buckets.get(pk)?.get(cat) ?? 0),
    }));

    // Y-axis maximum, rounded up to a tidy number of hours.
    let peak = 0;
    for (const s of series) for (const v of s.points) peak = Math.max(peak, v);
    const yMax = niceCeil(peak / 3600) * 3600; // nice ceiling, back in seconds

    // Short x-axis labels, thinned so they never collide.
    const labelFor = (pk: string) => {
      if (chartGran === 'week') return `W${pk.split('-W')[1]}`;
      const [yy, mm] = pk.split('-').map(Number);
      return mm === 1 ? `${MONTHS[mm - 1]} '${String(yy).slice(2)}` : MONTHS[mm - 1];
    };
    const step = Math.ceil(periods.length / 8);
    const xLabels = periods.map((pk, i) => ({
      text: labelFor(pk),
      show: i % step === 0 || i === periods.length - 1,
    }));

    // Fuller labels for the hover tooltip header.
    const tipLabels = periods.map((pk) => {
      if (chartGran === 'week') {
        const range = weekLabelOf(weekKeyToMonday(pk)).split('— ')[1];
        return `${labelFor(pk)} · ${range}`;
      }
      const [yy, mm] = pk.split('-').map(Number);
      return `${MONTHS[mm - 1]} ${yy}`;
    });

    return { state: 'ok' as const, periods, series, yMax, xLabels, tipLabels };
  }, [tasks, chartGran, elapsedOf]);

  /* ---- Render a single task row ---- */
  const renderTask = (t: Task) => {
    const isRunning = Boolean(running[t.id]);
    const confirming = confirmingDelete === t.id;

    return (
      <li
        key={t.id}
        className={`${styles.taskRow} ${t.done ? styles.taskRowDone : ''} ${t.failed && !t.done ? styles.taskRowFailed : ''}`}
      >
        <div className={styles.checkGroup}>
          <input
            type="checkbox"
            className={styles.check}
            checked={t.done}
            onChange={() => toggleDone(t.id)}
            aria-label={t.done ? `Mark "${t.title}" as not done` : `Mark "${t.title}" as done`}
          />
          <button
            className={`${styles.failCheck} ${t.failed && !t.done ? styles.failCheckActive : ''}`}
            onClick={() => toggleFailed(t.id)}
            aria-label={t.failed && !t.done ? `Unmark "${t.title}" as failed` : `Mark "${t.title}" as failed`}
            title={t.failed && !t.done ? 'Unmark failed' : 'Mark as failed'}
          />
        </div>

        <div className={styles.taskMain}>
          <div className={`${styles.taskTitle} ${t.done ? styles.taskTitleDone : ''} ${t.failed && !t.done ? styles.taskTitleFailed : ''}`}>
            {t.title}
          </div>
          <div className={styles.taskMeta}>
            {t.category && <span className={styles.chip}>{t.category}</span>}
            <span>Added {fmtDate(t.createdAt)}</span>
            {t.done && t.completedAt && (
              <span className={styles.metaDone}>✓ Done {fmtDate(t.completedAt)}</span>
            )}
            {t.failed && !t.done && t.failedAt && (
              <span className={styles.metaFailed}>✕ Failed {fmtDate(t.failedAt)}</span>
            )}
          </div>
        </div>

        {confirming ? (
          // Inline delete confirmation (no native window.confirm).
          <div className={styles.confirm}>
            <span>Delete?</span>
            <button className={styles.confirmYes} onClick={() => deleteTask(t.id)}>
              Yes
            </button>
            <button className={styles.confirmNo} onClick={() => setConfirmingDelete(null)}>
              Cancel
            </button>
          </div>
        ) : (
          <div className={styles.taskAside}>
            <div className={styles.timer}>
              <span className={`${styles.timerValue} ${isRunning ? styles.timerRunning : ''}`}>
                {fmtClock(elapsedOf(t))}
              </span>
              <div className={styles.timerBtns}>
                {isRunning ? (
                  <>
                    {/* Pause + Stop both bank the elapsed time and halt counting. */}
                    <button
                      className={styles.tBtn}
                      onClick={() => commitTimer(t.id)}
                      aria-label="Pause timer"
                      title="Pause"
                    >
                      ❙❙
                    </button>
                    <button
                      className={styles.tBtn}
                      onClick={() => commitTimer(t.id)}
                      aria-label="Stop timer"
                      title="Stop"
                    >
                      ■
                    </button>
                  </>
                ) : (
                  <button
                    className={`${styles.tBtn} ${styles.tBtnStart}`}
                    onClick={() => startTimer(t.id)}
                    aria-label="Start timer"
                    title={t.timeLogged > 0 ? 'Resume' : 'Start'}
                  >
                    ▶
                  </button>
                )}
              </div>
            </div>

            <button
              className={styles.deleteBtn}
              onClick={() => setConfirmingDelete(t.id)}
              aria-label={`Delete "${t.title}"`}
              title="Delete"
            >
              ⌫
            </button>
          </div>
        )}
      </li>
    );
  };

  /* ---- Build the line chart body (empty / sparse / full SVG) ---- */
  let chartInner: ReactNode;
  if (chart.state === 'empty') {
    chartInner = (
      <p className={styles.chartEmpty}>
        No time tracked yet. Start a task timer and your category trends will appear here.
      </p>
    );
  } else if (chart.state === 'sparse') {
    chartInner = (
      <p className={styles.chartEmpty}>
        Track time across at least two {chartGran === 'week' ? 'weeks' : 'months'} to draw the trend line.
      </p>
    );
  } else {
    const n = chart.periods.length;
    // Map a period index / a duration to SVG coordinates.
    const xAt = (i: number) => PX0 + (n === 1 ? 0 : (i / (n - 1)) * (PX1 - PX0));
    const yAt = (v: number) => PY1 - (v / chart.yMax) * (PY1 - PY0);
    const ticks = [0, 0.25, 0.5, 0.75, 1];
    const tipLeft = hoverIdx != null ? Math.min(94, Math.max(6, (xAt(hoverIdx) / CW) * 100)) : 0;

    chartInner = (
      <>
        <div className={styles.chartScroll}>
          <div className={styles.chartCanvas}>
            <svg
              className={styles.chartSvg}
              viewBox={`0 0 ${CW} ${CH}`}
              role="img"
              aria-label="Line chart of time invested per category over time"
              onMouseMove={(e) => {
                // Snap the hover to the nearest period based on cursor x.
                const rect = e.currentTarget.getBoundingClientRect();
                const svgX = ((e.clientX - rect.left) / rect.width) * CW;
                const idx = Math.round(((svgX - PX0) / (PX1 - PX0)) * (n - 1));
                setHoverIdx(Math.max(0, Math.min(n - 1, idx)));
              }}
              onMouseLeave={() => setHoverIdx(null)}
            >
              {/* Horizontal gridlines + y-axis duration labels */}
              {ticks.map((f, i) => {
                const y = PY1 - f * (PY1 - PY0);
                return (
                  <g key={`g${i}`}>
                    <line className={styles.gridLine} x1={PX0} y1={y} x2={PX1} y2={y} />
                    <text className={styles.axisLabel} x={PX0 - 8} y={y + 3} textAnchor="end">
                      {fmtDurShort(chart.yMax * f)}
                    </text>
                  </g>
                );
              })}

              {/* X-axis period labels (thinned) */}
              {chart.xLabels.map((l, i) =>
                l.show ? (
                  <text key={`x${i}`} className={styles.xLabel} x={xAt(i)} y={CH - 12} textAnchor="middle">
                    {l.text}
                  </text>
                ) : null,
              )}

              {/* Vertical hover guide */}
              {hoverIdx != null && (
                <line className={styles.hoverGuide} x1={xAt(hoverIdx)} y1={PY0} x2={xAt(hoverIdx)} y2={PY1} />
              )}

              {/* One line + dots per category */}
              {chart.series.map((s) => (
                <g key={s.cat}>
                  <polyline
                    className={styles.serieLine}
                    stroke={s.color}
                    points={s.points.map((v, i) => `${xAt(i)},${yAt(v)}`).join(' ')}
                  />
                  {s.points.map((v, i) => (
                    <circle
                      key={i}
                      className={styles.serieDot}
                      fill={s.color}
                      cx={xAt(i)}
                      cy={yAt(v)}
                      r={hoverIdx === i ? 4.5 : 2.5}
                    />
                  ))}
                </g>
              ))}
            </svg>

            {/* Hover tooltip: this period's time per category */}
            {hoverIdx != null && (
              <div className={styles.chartTip} style={{ left: `${tipLeft}%` }}>
                <div className={styles.chartTipPeriod}>{chart.tipLabels[hoverIdx]}</div>
                {chart.series.filter((s) => s.points[hoverIdx] > 0).length === 0 ? (
                  <div className={styles.chartTipRow}><span>No time logged</span></div>
                ) : (
                  chart.series
                    .filter((s) => s.points[hoverIdx] > 0)
                    .map((s) => (
                      <div key={s.cat} className={styles.chartTipRow}>
                        <span>
                          <span className={styles.chartTipDot} style={{ background: s.color }} />
                          {s.cat}
                        </span>
                        <span className={styles.chartTipVal}>{fmtClock(s.points[hoverIdx])}</span>
                      </div>
                    ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Legend: swatch + category + total time in the visible window */}
        <div className={styles.legend}>
          {chart.series.map((s) => (
            <span key={s.cat} className={styles.legendItem}>
              <span className={styles.legendSwatch} style={{ background: s.color }} />
              {s.cat}
              <span className={styles.legendTime}>{fmtClock(s.total)}</span>
            </span>
          ))}
        </div>
      </>
    );
  }

  /* ---- Markup ---- */
  return (
    <main className={styles.hub}>
      <div className={styles.wrap}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>
              <span className={styles.dot} aria-hidden="true" />
              Koyko Design Studio
            </p>
            <h1 className={styles.title}>Studio Hub</h1>
          </div>
          {mounted && (
            <div className={styles.headerRight}>
              {/* Active-plan indicator (derived from the Plans card). */}
              <div className={styles.sprintTag}>{planTag}</div>
              <div className={styles.headerStamp}>
                <div>
                  <strong>{weekKeyOf(new Date())}</strong>
                </div>
                <div>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</div>
              </div>
            </div>
          )}
        </header>

        {/* Everything below depends on the browser; render after mount. */}
        {!mounted ? (
          <p className={styles.empty} style={{ marginTop: 40 }}>Loading…</p>
        ) : authed === false ? (
          /* Password gate — shown until a valid login cookie is present. */
          <form className={styles.login} onSubmit={handleLogin}>
            <p className={styles.loginLabel}>
              This dashboard is private. Enter the password to continue.
            </p>
            <div className={styles.loginRow}>
              <input
                className={styles.addInput}
                type="password"
                value={loginPw}
                onChange={(e) => setLoginPw(e.target.value)}
                placeholder="Password"
                aria-label="Password"
                autoFocus
              />
              <button
                className={styles.addBtn}
                type="submit"
                disabled={loggingIn || !loginPw}
              >
                {loggingIn ? 'Checking…' : 'Unlock'}
              </button>
            </div>
            {loginErr && <p className={styles.loginError}>{loginErr}</p>}
          </form>
        ) : (
          <>
          {/* -------- Tab bar: one button per business area -------- */}
          <nav className={styles.tabBar} aria-label="Studio Hub sections">
            {([
              ['dashboard', 'Dashboard'],
              ['sales', 'Sales'],
              ['clients', 'Clients'],
              ['marketing', 'Marketing'],
              ['admin', 'Admin'],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                className={`${styles.tabBtn} ${tab === key ? styles.tabBtnActive : ''}`}
                onClick={() => setTab(key)}
                aria-current={tab === key}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Each area tab renders its own component. Dashboard (below) keeps
              the original weekly board + report + Plan Marea. */}
          {tab === 'sales' && <StudioLeads leads={leads} setLeads={setLeads} />}
          {tab === 'clients' && <StudioClients projects={projects} setProjects={setProjects} />}
          {tab === 'marketing' && <StudioTodos area="Marketing" todos={todos} setTodos={setTodos} />}
          {tab === 'admin' && <StudioTodos area="Admin" todos={todos} setTodos={setTodos} />}

          {tab === 'dashboard' && (
          <>
          {/* -------- Overview tiles: pulse across all areas -------- */}
          <div className={styles.tiles}>
            <button className={styles.tile} onClick={() => setTab('clients')}>
              <span className={styles.tileNum}>{overview.activeProjects}</span>
              <span className={styles.tileLabel}>Active projects</span>
            </button>
            <button className={styles.tile} onClick={() => setTab('sales')}>
              <span className={styles.tileNum}>{overview.openLeads}</span>
              <span className={styles.tileLabel}>Open leads</span>
            </button>
            <button className={styles.tile} onClick={() => setTab('sales')}>
              <span className={`${styles.tileNum} ${overview.dueFollowUps > 0 ? styles.tileNumAlert : ''}`}>
                {overview.dueFollowUps}
              </span>
              <span className={styles.tileLabel}>Follow-ups due</span>
            </button>
            <button className={styles.tile} onClick={() => setTab('admin')}>
              <span className={styles.tileNum}>{overview.pendingTodos}</span>
              <span className={styles.tileLabel}>Open todos</span>
            </button>
            <div className={styles.tile}>
              <span className={styles.tileNum}>{overview.weekPct}<span className={styles.tilePct}>%</span></span>
              <span className={styles.tileLabel}>Week done</span>
            </div>
          </div>

          <div className={styles.layout}>
            {/* -------- Weekly board -------- */}
            <section aria-label="Weekly task board">
              <nav className={styles.weekNav} aria-label="Week navigation">
                <button
                  className={styles.navArrow}
                  aria-label="Previous week"
                  onClick={() => {
                    const d = new Date(anchor);
                    d.setDate(d.getDate() - 7);
                    setAnchor(d);
                  }}
                >
                  ‹
                </button>
                <button
                  className={styles.navArrow}
                  aria-label="Next week"
                  onClick={() => {
                    const d = new Date(anchor);
                    d.setDate(d.getDate() + 7);
                    setAnchor(d);
                  }}
                >
                  ›
                </button>
                <span className={`${styles.weekLabel} ${isCurrentWeek ? '' : styles.weekLabelAway}`}>
                  {weekLabelOf(anchor)}
                </span>
                <button
                  className={styles.thisWeekBtn}
                  onClick={() => setAnchor(mondayOf(new Date()))}
                  disabled={isCurrentWeek}
                >
                  This week
                </button>
              </nav>

              {/* Add-task form */}
              <form className={styles.addForm} onSubmit={addTask}>
                <input
                  className={styles.addInput}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Add a task for this week…"
                  aria-label="Task title"
                />
                <select
                  className={styles.addSelect}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  aria-label="Task category"
                >
                  <option value="">Category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <button className={styles.addBtn} type="submit" disabled={!title.trim()}>
                  Add
                </button>
              </form>

              {/* To-do section */}
              <div className={styles.sectionLabel}>
                To do <span className={styles.count}>({pending.length})</span>
              </div>
              {pending.length === 0 && done.length === 0 && failed.length === 0 ? (
                <p className={styles.empty}>No tasks this week yet. Add one above.</p>
              ) : pending.length === 0 && failed.length === 0 ? (
                <p className={styles.empty}>All done for this week. Nice.</p>
              ) : pending.length === 0 ? null : (
                <ul className={styles.taskList}>{pending.map(renderTask)}</ul>
              )}

              {/* Done section */}
              {done.length > 0 && (
                <>
                  <div className={`${styles.sectionLabel} ${styles.sectionLabelDone}`}>
                    Done <span className={styles.count}>({done.length})</span>
                  </div>
                  <ul className={styles.taskList}>{done.map(renderTask)}</ul>
                </>
              )}

              {/* Failed section */}
              {failed.length > 0 && (
                <>
                  <div className={`${styles.sectionLabel} ${styles.sectionLabelFailed}`}>
                    Failed <span className={styles.count}>({failed.length})</span>
                  </div>
                  <ul className={styles.taskList}>{failed.map(renderTask)}</ul>
                </>
              )}
            </section>

            {/* -------- Sidebar: Reporte card + Plans card (stacked) -------- */}
            <div className={styles.sidebar}>
              {/* Reporte card — unchanged, collapsible */}
              <aside className={styles.report} aria-label="Weekly report">
                <button
                  className={styles.reportHead}
                  onClick={() => setReportOpen((o) => !o)}
                  aria-expanded={reportOpen}
                >
                  <span>Weekly report</span>
                  <span className={`${styles.reportChevron} ${reportOpen ? styles.reportChevronOpen : ''}`} aria-hidden="true">
                    ▾
                  </span>
                </button>

                {reportOpen && (
                <div className={styles.reportBody}>
                  <div className={styles.rateBlock}>
                    <div className={styles.rateNumber}>
                      {stats.rate}<span>%</span>
                    </div>
                    <div className={styles.rateCaption}>Completion rate</div>
                  </div>

                  <div className={styles.progressTrack}>
                    <div className={styles.progressFill} style={{ width: `${stats.rate}%` }} />
                  </div>

                  <div className={styles.statRow}>
                    <span className={styles.statKey}>Tasks added</span>
                    <span className={styles.statVal}>{stats.total}</span>
                  </div>
                  <div className={styles.statRow}>
                    <span className={styles.statKey}>Completed</span>
                    <span className={styles.statVal}>{stats.completed}</span>
                  </div>
                  <div className={styles.statRow}>
                    <span className={styles.statKey}>Failed</span>
                    <span className={`${styles.statVal} ${stats.failed > 0 ? styles.statValFailed : ''}`}>{stats.failed}</span>
                  </div>
                  <div className={styles.statRow}>
                    <span className={styles.statKey}>Pending</span>
                    <span className={styles.statVal}>{stats.pending}</span>
                  </div>
                  <div className={styles.statRow}>
                    <span className={styles.statKey}>Time tracked</span>
                    <span className={`${styles.statVal} ${styles.statValTime}`}>
                      {fmtClock(stats.totalTime)}
                    </span>
                  </div>

                  {stats.categoryRows.length > 0 && (
                    <div className={styles.breakdown}>
                      <div className={styles.breakdownLabel}>By category</div>
                      {stats.categoryRows.map(([cat, count]) => (
                        <div key={cat} className={styles.catRow}>
                          <div className={styles.catTop}>
                            <span>
                              <span className={styles.catDot} style={{ background: catColor(cat) }} />
                              {cat}
                            </span>
                            <span>{count}</span>
                          </div>
                          <div className={styles.catBarTrack}>
                            <div
                              className={styles.catBarFill}
                              style={{
                                width: `${stats.maxCat ? (count / stats.maxCat) * 100 : 0}%`,
                                background: catColor(cat),
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* History dropdown — bottom of the card */}
                  {taskWeeks.length > 1 && (
                    <div className={styles.historyWrap}>
                      <div className={styles.historyRow}>
                        <button
                          className={styles.historyBtn}
                          onClick={() => setHistoryOpen((o) => !o)}
                          aria-expanded={historyOpen}
                        >
                          History
                          <span className={`${styles.historyChevron} ${historyOpen ? styles.historyChevronOpen : ''}`} aria-hidden="true">▾</span>
                        </button>
                        {reportWeek !== weekKeyOf(new Date()) && (
                          <span className={styles.historyActive}>
                            W{reportWeek.split('-W')[1]}
                            <button
                              className={styles.historyReset}
                              onClick={() => { setReportWeek(weekKeyOf(new Date())); setHistoryOpen(false); }}
                              title="Back to current week"
                            >✕</button>
                          </span>
                        )}
                      </div>
                      {historyOpen && (
                        <div className={styles.historyMenu}>
                          {taskWeeks
                            .filter((wk) => wk !== weekKeyOf(new Date()))
                            .map((wk) => {
                              const monday = weekKeyToMonday(wk);
                              return (
                                <button
                                  key={wk}
                                  className={`${styles.historyItem} ${reportWeek === wk ? styles.historyItemActive : ''}`}
                                  onClick={() => { setReportWeek(wk); setHistoryOpen(false); }}
                                >
                                  {weekLabelOf(monday)}
                                </button>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                )}
              </aside>

              {/* Plans card — new, below the Reporte card */}
              <aside className={styles.report} aria-label="Plans">
                <button
                  className={styles.reportHead}
                  onClick={() => setPlansOpen((o) => !o)}
                  aria-expanded={plansOpen}
                >
                  <span>Plans</span>
                  <span className={`${styles.reportChevron} ${plansOpen ? styles.reportChevronOpen : ''}`} aria-hidden="true">
                    ▾
                  </span>
                </button>

                {plansOpen && (
                <div className={styles.reportBody}>
                  <button className={styles.planNewBtn} onClick={createPlan}>+ Nuevo plan</button>

                  {plans.length === 0 ? (
                    <p className={styles.empty}>No hay planes. Crea uno arriba.</p>
                  ) : (
                    plans.map((p) => {
                      const reached =
                        mondayOf(new Date()).getTime() >=
                        mondayOf(parseISODate(p.activationDate)).getTime();
                      const draft = planDraft[p.id] || { title: '', cat: '' };
                      const open = openPlans[p.id] ?? false;
                      return (
                        <div key={p.id} className={styles.planCard}>
                          <div className={styles.planTop}>
                            <button
                              className={`${styles.planChevron} ${open ? styles.planChevronOpen : ''}`}
                              onClick={() => togglePlanOpen(p.id)}
                              aria-expanded={open}
                              aria-label={open ? 'Colapsar plan' : 'Expandir plan'}
                            >
                              ▸
                            </button>
                            <input
                              className={styles.planName}
                              value={p.name}
                              onChange={(e) => updatePlan(p.id, { name: e.target.value })}
                              aria-label="Nombre del plan"
                            />
                            <button
                              className={styles.planDelete}
                              onClick={() => deletePlan(p.id)}
                              aria-label="Eliminar plan"
                              title="Eliminar plan"
                            >
                              ✕
                            </button>
                          </div>

                          {/* Status badge */}
                          <div className={styles.planStatus}>
                            {!p.active ? (
                              <span className={styles.planBadgeOff}>Inactivo</span>
                            ) : p.activatedWeek ? (
                              <span className={styles.planBadgeDone}>Activado · {p.activatedWeek}</span>
                            ) : reached ? (
                              <span className={styles.planBadgeOn}>Activando…</span>
                            ) : (
                              <span className={styles.planBadgeSched}>
                                Programado · {fmtNiceDate(p.activationDate)}
                              </span>
                            )}
                          </div>

                          {open && (
                          <>
                          {/* Activation date */}
                          <label className={styles.planDateRow}>
                            <span className={styles.planDateLabel}>Se activa el</span>
                            <input
                              type="date"
                              className={styles.planDateInput}
                              value={p.activationDate}
                              onChange={(e) => setPlanDate(p.id, e.target.value)}
                            />
                          </label>

                          {/* Activate / deactivate */}
                          <button
                            className={p.active ? styles.planToggleOff : styles.planToggleOn}
                            onClick={() => togglePlanActive(p.id)}
                          >
                            {p.active ? 'Desactivar Plan Marea' : 'Activar Plan Marea'}
                          </button>

                          {/* Plan task list */}
                          <div className={styles.planTasksLabel}>Tareas ({p.tasks.length})</div>
                          {p.tasks.length > 0 && (
                            <ul className={styles.planTaskList}>
                              {p.tasks.map((t, i) => (
                                <li key={i} className={styles.planTaskItem}>
                                  <span className={styles.planTaskText}>
                                    {t.category && (
                                      <span
                                        className={styles.catDot}
                                        style={{ background: catColor(t.category) }}
                                      />
                                    )}
                                    {t.title}
                                  </span>
                                  <button
                                    className={styles.planTaskDel}
                                    onClick={() => removeTaskFromPlan(p.id, i)}
                                    aria-label="Quitar tarea"
                                    title="Quitar"
                                  >
                                    ×
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}

                          {/* Add task to plan */}
                          <div className={styles.planAddRow}>
                            <input
                              className={styles.planAddInput}
                              value={draft.title}
                              placeholder="Nueva tarea…"
                              onChange={(e) =>
                                setPlanDraft((prev) => ({
                                  ...prev,
                                  [p.id]: { title: e.target.value, cat: draft.cat },
                                }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addTaskToPlan(p.id);
                                }
                              }}
                            />
                            <select
                              className={styles.planAddSelect}
                              value={draft.cat}
                              onChange={(e) =>
                                setPlanDraft((prev) => ({
                                  ...prev,
                                  [p.id]: { title: draft.title, cat: e.target.value },
                                }))
                              }
                              aria-label="Categoría"
                            >
                              <option value="">—</option>
                              {CATEGORIES.map((c) => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                            <button
                              className={styles.planAddBtn}
                              onClick={() => addTaskToPlan(p.id)}
                              aria-label="Añadir tarea al plan"
                            >
                              +
                            </button>
                          </div>
                          </>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
                )}
              </aside>
            </div>
          </div>

          {/* -------- Time-by-category line chart (full width) -------- */}
          <section className={styles.chartSection} aria-label="Time by category over time">
            <div className={styles.chartHead}>
              <div>
                <div className={styles.chartTitle}>Time by category</div>
                <div className={styles.chartSub}>
                  Hours tracked across {chartGran === 'week' ? 'weeks' : 'months'}
                </div>
              </div>
              <div className={styles.segmented} role="tablist" aria-label="Chart granularity">
                <button
                  className={`${styles.segBtn} ${chartGran === 'week' ? styles.segActive : ''}`}
                  onClick={() => { setChartGran('week'); setHoverIdx(null); }}
                  role="tab"
                  aria-selected={chartGran === 'week'}
                >
                  Weeks
                </button>
                <button
                  className={`${styles.segBtn} ${chartGran === 'month' ? styles.segActive : ''}`}
                  onClick={() => { setChartGran('month'); setHoverIdx(null); }}
                  role="tab"
                  aria-selected={chartGran === 'month'}
                >
                  Months
                </button>
              </div>
            </div>
            {chartInner}
          </section>
          </>
          )}
          </>
        )}
      </div>
    </main>
  );
}
