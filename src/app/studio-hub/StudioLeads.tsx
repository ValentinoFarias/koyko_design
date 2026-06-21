'use client';

/* =============================================================================
   STUDIO LEADS — a lightweight CRM pipeline for the Studio Hub "Leads" tab.

   Self-contained kanban board. The parent (page.tsx) owns the `leads` array and
   its persistence to Neon; this component just renders + mutates it via setLeads.

   Mirrors the columns of the Notion "Leads" database:
     New → Contacted → Qualified → Proposal → Negotiation → Won → Lost
   ============================================================================= */

import { useState, type FormEvent, type Dispatch, type SetStateAction } from 'react';
import styles from './studio-hub.module.css';

/* ---------------------------------------------------------------------------
   Types (exported so page.tsx can type its `leads` state)
   --------------------------------------------------------------------------- */

export type LeadStatus =
  | 'New'
  | 'Email Sent'
  | 'Contacted'
  | 'Proposal'
  | 'Negotiation'
  | 'Won'
  | 'Lost';

export type LeadSource =
  | 'Website'
  | 'Referral'
  | 'Social Media'
  | 'Cold Outreach'
  | 'Event'
  | 'Advertisement';

export type Lead = {
  id: string;
  name: string; // the lead/company contact name (Notion "Lead Name")
  company: string;
  contact: string; // email or handle
  phone: string;
  website: string;
  status: LeadStatus;
  source: LeadSource | '';
  contactDate: string | null; // "YYYY-MM-DD"
  nextFollowUp: string | null; // "YYYY-MM-DD"
  notes: string;
  createdAt: number; // epoch ms
};

/* ---------------------------------------------------------------------------
   Constants
   --------------------------------------------------------------------------- */

// Pipeline order. Won/Lost are the "closed" columns, rendered muted at the end.
const STATUSES: LeadStatus[] = [
  'New',
  'Email Sent',
  'Contacted',
  'Proposal',
  'Negotiation',
  'Won',
  'Lost',
];

// When a lead enters "Email Sent", we auto-schedule a follow-up this many days
// later, so it surfaces in the "Due follow-ups" filter once the clock runs out.
const EMAIL_FOLLOWUP_DAYS = 3;

const SOURCES: LeadSource[] = [
  'Website',
  'Referral',
  'Social Media',
  'Cold Outreach',
  'Event',
  'Advertisement',
];

// Accent per status, aligned with the Notion palette.
const STATUS_COLORS: Record<LeadStatus, string> = {
  New: '#9C9389', // warm grey
  'Email Sent': '#5A8A7B', // sage
  Contacted: '#3F6189', // slate blue
  Proposal: '#C9A227', // yellow/gold
  Negotiation: '#EB5120', // signal orange
  Won: '#27ae60', // green
  Lost: '#c0392b', // red
};

/* ---------------------------------------------------------------------------
   Small local helpers (mirror the pure utilities in page.tsx; kept local so
   this component stays self-contained)
   --------------------------------------------------------------------------- */

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function newId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// "15 Jun" from a "YYYY-MM-DD" string.
function fmtNiceDate(s: string): string {
  const [y, m, d] = s.split('-').map(Number);
  const date = new Date(y || 1970, (m || 1) - 1, d || 1);
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

// Today as "YYYY-MM-DD" (local).
function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Add `days` to a "YYYY-MM-DD" string and return the new "YYYY-MM-DD".
function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}

// Whole days from today until `dateStr` (negative = overdue, 0 = today).
function daysUntil(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d).getTime();
  const [ty, tm, td] = todayKey().split('-').map(Number);
  const today = new Date(ty, tm - 1, td).getTime();
  return Math.round((target - today) / 86400000);
}

// A follow-up date is overdue if it's strictly before today (and the lead is open).
function isOverdue(dateStr: string | null, status: LeadStatus): boolean {
  if (!dateStr) return false;
  if (status === 'Won' || status === 'Lost') return false;
  return dateStr < todayKey();
}

/* ---------------------------------------------------------------------------
   Component
   --------------------------------------------------------------------------- */

type Props = {
  leads: Lead[];
  setLeads: Dispatch<SetStateAction<Lead[]>>;
};

export default function StudioLeads({ leads, setLeads }: Props) {
  // Add-lead form fields.
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [source, setSource] = useState<LeadSource | ''>('');

  // Which lead's card is expanded into the inline editor, if any.
  const [editingId, setEditingId] = useState<string | null>(null);
  // Which lead is showing its inline "Delete?" confirmation, if any.
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  // The lead id currently being dragged (for drag-and-drop between columns).
  const [dragId, setDragId] = useState<string | null>(null);
  // The status column currently hovered during a drag (for highlight).
  const [dragOverStatus, setDragOverStatus] = useState<LeadStatus | null>(null);
  // When on, show only leads whose follow-up is due (today or earlier).
  const [onlyDue, setOnlyDue] = useState(false);

  // A lead's follow-up is "due" if it's today or earlier and the lead is open.
  const isDue = (lead: Lead): boolean => {
    if (!lead.nextFollowUp) return false;
    if (lead.status === 'Won' || lead.status === 'Lost') return false;
    return lead.nextFollowUp <= todayKey();
  };
  const dueCount = leads.filter(isDue).length;

  /* ---- Actions ---- */

  const addLead = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    const lead: Lead = {
      id: newId(),
      name: trimmed,
      company: company.trim(),
      contact: '',
      phone: '',
      website: '',
      status: 'New',
      source,
      contactDate: todayKey(),
      nextFollowUp: null,
      notes: '',
      createdAt: Date.now(),
    };
    setLeads((prev) => [lead, ...prev]);
    setName('');
    setCompany('');
    setSource('');
  };

  // Patch a single lead by id.
  const updateLead = (id: string, patch: Partial<Lead>) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  // Change a lead's status. Moving INTO "Email Sent" starts the 3-day clock:
  // we set nextFollowUp = today + 3, so it lands in "Due follow-ups" when it's
  // time to chase. We only do this on the transition (not on re-saves) so the
  // clock isn't reset by unrelated edits.
  const changeStatus = (id: string, status: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const enteringEmailSent = status === 'Email Sent' && l.status !== 'Email Sent';
        return {
          ...l,
          status,
          nextFollowUp: enteringEmailSent
            ? addDays(todayKey(), EMAIL_FOLLOWUP_DAYS)
            : l.nextFollowUp,
        };
      }),
    );
  };

  const deleteLead = (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setConfirmingDelete(null);
    if (editingId === id) setEditingId(null);
  };

  // Drop a dragged lead into a status column.
  const dropOnStatus = (status: LeadStatus) => {
    if (dragId) changeStatus(dragId, status);
    setDragId(null);
    setDragOverStatus(null);
  };

  /* ---- Render a single lead card ---- */
  const renderCard = (lead: Lead) => {
    const editing = editingId === lead.id;
    const confirming = confirmingDelete === lead.id;
    const overdue = isOverdue(lead.nextFollowUp, lead.status);

    // Relative countdown for the follow-up clock (e.g. "in 3d", "today", "due").
    let followLabel = '';
    if (lead.nextFollowUp) {
      const d = daysUntil(lead.nextFollowUp);
      followLabel =
        d > 1 ? `in ${d}d` : d === 1 ? 'tomorrow' : d === 0 ? 'today' : 'due';
    }

    return (
      <li
        key={lead.id}
        className={`${styles.leadCard} ${editing ? styles.leadCardEditing : ''}`}
        draggable={!editing}
        onDragStart={() => setDragId(lead.id)}
        onDragEnd={() => { setDragId(null); setDragOverStatus(null); }}
      >
        {/* ---- Card header (always visible) ---- */}
        <button
          className={styles.leadCardHead}
          onClick={() => setEditingId(editing ? null : lead.id)}
          aria-expanded={editing}
        >
          <span className={styles.leadName}>{lead.name || 'Untitled lead'}</span>
          {lead.company && <span className={styles.leadCompany}>{lead.company}</span>}
        </button>

        {/* ---- Meta row: source chip + follow-up date ---- */}
        <div className={styles.leadMeta}>
          {lead.source && <span className={styles.leadChip}>{lead.source}</span>}
          {lead.nextFollowUp && (
            <span className={`${styles.leadFollow} ${overdue ? styles.leadFollowOverdue : ''}`}>
              {overdue ? '⚠ ' : '↻ '}{fmtNiceDate(lead.nextFollowUp)} · {followLabel}
            </span>
          )}
        </div>

        {/* ---- Inline editor (expanded) ---- */}
        {editing && (
          <div className={styles.leadEditor}>
            <label className={styles.leadField}>
              <span>Name</span>
              <input
                value={lead.name}
                onChange={(e) => updateLead(lead.id, { name: e.target.value })}
              />
            </label>
            <label className={styles.leadField}>
              <span>Company</span>
              <input
                value={lead.company}
                onChange={(e) => updateLead(lead.id, { company: e.target.value })}
              />
            </label>
            <label className={styles.leadField}>
              <span>Contact (email / handle)</span>
              <input
                value={lead.contact}
                onChange={(e) => updateLead(lead.id, { contact: e.target.value })}
              />
            </label>
            <label className={styles.leadField}>
              <span>Phone</span>
              <input
                value={lead.phone}
                onChange={(e) => updateLead(lead.id, { phone: e.target.value })}
              />
            </label>
            <label className={styles.leadField}>
              <span>Website</span>
              <input
                value={lead.website}
                placeholder="https://"
                onChange={(e) => updateLead(lead.id, { website: e.target.value })}
              />
            </label>
            <div className={styles.leadFieldRow}>
              <label className={styles.leadField}>
                <span>Status</span>
                <select
                  value={lead.status}
                  onChange={(e) => changeStatus(lead.id, e.target.value as LeadStatus)}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className={styles.leadField}>
                <span>Source</span>
                <select
                  value={lead.source}
                  onChange={(e) => updateLead(lead.id, { source: e.target.value as LeadSource | '' })}
                >
                  <option value="">—</option>
                  {SOURCES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className={styles.leadFieldRow}>
              <label className={styles.leadField}>
                <span>Contact date</span>
                <input
                  type="date"
                  value={lead.contactDate ?? ''}
                  onChange={(e) => updateLead(lead.id, { contactDate: e.target.value || null })}
                />
              </label>
              <label className={styles.leadField}>
                <span>Next follow-up</span>
                <input
                  type="date"
                  value={lead.nextFollowUp ?? ''}
                  onChange={(e) => updateLead(lead.id, { nextFollowUp: e.target.value || null })}
                />
              </label>
            </div>
            <label className={styles.leadField}>
              <span>Notes</span>
              <textarea
                rows={3}
                value={lead.notes}
                onChange={(e) => updateLead(lead.id, { notes: e.target.value })}
              />
            </label>

            {/* Editor footer: close + delete */}
            <div className={styles.leadEditorFoot}>
              <button className={styles.leadDoneBtn} onClick={() => setEditingId(null)}>
                Done
              </button>
              {confirming ? (
                <span className={styles.leadConfirm}>
                  <span>Delete?</span>
                  <button className={styles.leadConfirmYes} onClick={() => deleteLead(lead.id)}>Yes</button>
                  <button className={styles.leadConfirmNo} onClick={() => setConfirmingDelete(null)}>Cancel</button>
                </span>
              ) : (
                <button className={styles.leadDeleteBtn} onClick={() => setConfirmingDelete(lead.id)}>
                  Delete
                </button>
              )}
            </div>
          </div>
        )}
      </li>
    );
  };

  /* ---- Markup ---- */
  return (
    <div className={styles.leads}>
      {/* Add-lead form */}
      <form className={styles.leadAddForm} onSubmit={addLead}>
        <input
          className={styles.addInput}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New lead — name or person…"
          aria-label="Lead name"
        />
        <input
          className={styles.addInput}
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Company"
          aria-label="Company"
        />
        <select
          className={styles.addSelect}
          value={source}
          onChange={(e) => setSource(e.target.value as LeadSource | '')}
          aria-label="Lead source"
        >
          <option value="">Source</option>
          {SOURCES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button className={styles.addBtn} type="submit" disabled={!name.trim()}>
          Add lead
        </button>
      </form>

      {/* Due-follow-ups filter: a quick view of who needs chasing today. */}
      <div className={styles.leadFilterRow}>
        <button
          className={`${styles.leadFilterBtn} ${onlyDue ? styles.leadFilterBtnActive : ''}`}
          onClick={() => setOnlyDue((v) => !v)}
          aria-pressed={onlyDue}
        >
          {onlyDue ? '✓ ' : ''}Due follow-ups{dueCount > 0 ? ` (${dueCount})` : ''}
        </button>
      </div>

      {leads.length === 0 ? (
        <p className={styles.empty} style={{ marginTop: 32 }}>
          No leads yet. Add your first one above.
        </p>
      ) : (
        /* Kanban board: one column per status */
        <div className={styles.leadBoard}>
          {STATUSES.map((status) => {
            const colLeads = leads.filter(
              (l) => l.status === status && (!onlyDue || isDue(l)),
            );
            const closed = status === 'Won' || status === 'Lost';
            return (
              <section
                key={status}
                className={`${styles.leadCol} ${closed ? styles.leadColClosed : ''} ${dragOverStatus === status ? styles.leadColDragOver : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOverStatus(status); }}
                onDragLeave={() => setDragOverStatus((s) => (s === status ? null : s))}
                onDrop={() => dropOnStatus(status)}
                aria-label={`${status} leads`}
              >
                <header className={styles.leadColHead}>
                  <span className={styles.leadColDot} style={{ background: STATUS_COLORS[status] }} />
                  <span className={styles.leadColName}>{status}</span>
                  <span className={styles.leadColCount}>{colLeads.length}</span>
                </header>
                <ul className={styles.leadColList}>
                  {colLeads.map(renderCard)}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
