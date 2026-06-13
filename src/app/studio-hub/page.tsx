'use client';

/* =============================================================================
   STUDIO HUB — private weekly task manager + time tracker (Koyko Design Studio)

   This is an internal, URL-only page (no public link, marked noindex in the
   sibling layout.tsx). Everything lives client-side and persists to
   localStorage — no backend, no auth.

   It's a client component because it relies on browser-only APIs:
   localStorage, timers (setInterval), and the current date.
   ============================================================================= */

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  type FormEvent,
  type ReactNode,
} from 'react';
import styles from './studio-hub.module.css';

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
  timeLogged: number; // committed seconds tracked against this task
};

// `running` maps a task id -> the epoch-ms the current timer session started.
// It lives in its own localStorage key so a running timer survives a reload.
type RunningMap = Record<string, number>;

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
  // the first client render match (no hydration mismatch from Date/localStorage).
  const [mounted, setMounted] = useState(false);

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

  // Report panel collapse state (open by default on desktop).
  const [reportOpen, setReportOpen] = useState(true);

  // Time-by-category line chart: granularity + currently hovered period index.
  const [chartGran, setChartGran] = useState<'week' | 'month'>('week');
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  /* ---- Load persisted state once, on mount ---- */
  useEffect(() => {
    setAnchor(mondayOf(new Date()));
    try {
      const rawTasks = localStorage.getItem(STORAGE_KEY);
      if (rawTasks) setTasks(JSON.parse(rawTasks));
      const rawRunning = localStorage.getItem(RUNNING_KEY);
      if (rawRunning) setRunning(JSON.parse(rawRunning));
    } catch {
      // Corrupt/blocked storage — start clean rather than crash.
    }
    setMounted(true);
  }, []);

  /* ---- Persist on change (only after mount, so we never overwrite with []) ---- */
  useEffect(() => {
    if (mounted) localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks, mounted]);

  useEffect(() => {
    if (mounted) localStorage.setItem(RUNNING_KEY, JSON.stringify(running));
  }, [running, mounted]);

  /* ---- Heartbeat: only tick while at least one timer is running ---- */
  useEffect(() => {
    if (Object.keys(running).length === 0) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [running]);

  /* ---- Derived week data ---- */
  const weekKey = weekKeyOf(anchor);
  const isCurrentWeek = mounted && weekKey === weekKeyOf(new Date());

  const weekTasks = useMemo(
    () => tasks.filter((t) => t.weekKey === weekKey),
    [tasks, weekKey],
  );
  const pending = useMemo(() => weekTasks.filter((t) => !t.done), [weekTasks]);
  const done = useMemo(() => weekTasks.filter((t) => t.done), [weekTasks]);

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

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setRunning((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setConfirmingDelete(null);
  }, []);

  /* ---- Weekly report stats ---- */
  const stats = useMemo(() => {
    const total = weekTasks.length;
    const completed = done.length;
    const rate = total ? Math.round((completed / total) * 100) : 0;
    const totalTime = weekTasks.reduce((sum, t) => sum + elapsedOf(t), 0);

    // Count tasks per category (skip empties).
    const byCategory: Record<string, number> = {};
    for (const t of weekTasks) {
      if (!t.category) continue;
      byCategory[t.category] = (byCategory[t.category] ?? 0) + 1;
    }
    const categoryRows = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
    const maxCat = categoryRows.reduce((m, [, n]) => Math.max(m, n), 0);

    return {
      total,
      completed,
      pending: total - completed,
      rate,
      totalTime,
      categoryRows,
      maxCat,
    };
  }, [weekTasks, done, elapsedOf]);

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
        className={`${styles.taskRow} ${t.done ? styles.taskRowDone : ''}`}
      >
        <input
          type="checkbox"
          className={styles.check}
          checked={t.done}
          onChange={() => toggleDone(t.id)}
          aria-label={t.done ? `Mark "${t.title}" as not done` : `Mark "${t.title}" as done`}
        />

        <div className={styles.taskMain}>
          <div className={`${styles.taskTitle} ${t.done ? styles.taskTitleDone : ''}`}>
            {t.title}
          </div>
          <div className={styles.taskMeta}>
            {t.category && <span className={styles.chip}>{t.category}</span>}
            <span>Added {fmtDate(t.createdAt)}</span>
            {t.done && t.completedAt && (
              <span className={styles.metaDone}>✓ Done {fmtDate(t.completedAt)}</span>
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
              ✕
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
            <div className={styles.headerStamp}>
              <div>
                <strong>{weekKeyOf(new Date())}</strong>
              </div>
              <div>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</div>
            </div>
          )}
        </header>

        {/* Everything below depends on the browser; render after mount. */}
        {!mounted ? (
          <p className={styles.empty} style={{ marginTop: 40 }}>Loading…</p>
        ) : (
          <>
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
              {pending.length === 0 && done.length === 0 ? (
                <p className={styles.empty}>No tasks this week yet. Add one above.</p>
              ) : pending.length === 0 ? (
                <p className={styles.empty}>All done for this week. Nice.</p>
              ) : (
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
            </section>

            {/* -------- Weekly report panel -------- */}
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
                </div>
              )}
            </aside>
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
      </div>
    </main>
  );
}
