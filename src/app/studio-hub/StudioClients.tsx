'use client';

/* =============================================================================
   STUDIO CLIENTS — the Clients tab: a kanban of client projects where the
   COLUMNS ARE THE DELIVERY STAGES (discovery → design → dev → launch → live).

   Self-contained, same shape as StudioLeads.tsx. The parent (page.tsx) owns the
   `projects` array and its persistence to Neon; this component renders + mutates
   it via setProjects.
   ============================================================================= */

import { useState, type FormEvent, type Dispatch, type SetStateAction } from 'react';
import styles from './studio-hub.module.css';

/* ---------------------------------------------------------------------------
   Types (exported so page.tsx can type its `projects` state)
   --------------------------------------------------------------------------- */

export type ProjectStage = 'discovery' | 'design' | 'dev' | 'launch' | 'live';

export type Project = {
  id: string;
  client: string; // client / business name
  title: string; // e.g. "Website redesign"
  stage: ProjectStage; // = which column it sits in
  carePlan: boolean; // on uptime + critical-bug care plan (usually stage 'live')
  notes: string;
  leadId?: string | null; // optional link back to the Lead it came from
  createdAt: number;
};

/* ---------------------------------------------------------------------------
   Constants
   --------------------------------------------------------------------------- */

// Column order = the delivery pipeline.
const STAGES: ProjectStage[] = ['discovery', 'design', 'dev', 'launch', 'live'];

// Human labels for the stage keys.
const STAGE_LABELS: Record<ProjectStage, string> = {
  discovery: 'Discovery',
  design: 'Design',
  dev: 'Dev',
  launch: 'Launch',
  live: 'Live',
};

// Accent per stage — cool→warm→green as a project nears going live.
const STAGE_COLORS: Record<ProjectStage, string> = {
  discovery: '#9C9389', // warm grey
  design: '#7A5A9B', // purple
  dev: '#3F6189', // slate blue
  launch: '#EB5120', // signal orange
  live: '#27ae60', // green
};

/* ---------------------------------------------------------------------------
   Helpers (kept local so this component stays self-contained)
   --------------------------------------------------------------------------- */

function newId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/* ---------------------------------------------------------------------------
   Component
   --------------------------------------------------------------------------- */

type Props = {
  projects: Project[];
  setProjects: Dispatch<SetStateAction<Project[]>>;
};

export default function StudioClients({ projects, setProjects }: Props) {
  // Add-project form fields.
  const [client, setClient] = useState('');
  const [title, setTitle] = useState('');

  // UI state, mirroring StudioLeads.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<ProjectStage | null>(null);

  /* ---- Actions ---- */

  const addProject = (e: FormEvent) => {
    e.preventDefault();
    const c = client.trim();
    const t = title.trim();
    if (!c || !t) return;
    const project: Project = {
      id: newId(),
      client: c,
      title: t,
      stage: 'discovery',
      carePlan: false,
      notes: '',
      leadId: null,
      createdAt: Date.now(),
    };
    setProjects((prev) => [project, ...prev]);
    setClient('');
    setTitle('');
  };

  const updateProject = (id: string, patch: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setConfirmingDelete(null);
    if (editingId === id) setEditingId(null);
  };

  // Drop a dragged project into a stage column.
  const dropOnStage = (stage: ProjectStage) => {
    if (dragId) updateProject(dragId, { stage });
    setDragId(null);
    setDragOverStage(null);
  };

  // One-time starter set so the board isn't a blank slate. Opt-in (button).
  const seedStarter = () => {
    const now = Date.now();
    const make = (
      client: string,
      title: string,
      stage: ProjectStage,
      carePlan: boolean,
    ): Project => ({
      id: newId(), client, title, stage, carePlan, notes: '', leadId: null, createdAt: now,
    });
    setProjects((prev) => [
      make('Example client', 'Website redesign', 'discovery', false),
      make('Example client', 'Care Plan — uptime + critical bugs', 'live', true),
      ...prev,
    ]);
  };

  /* ---- Render a single project card ---- */
  const renderCard = (project: Project) => {
    const editing = editingId === project.id;
    const confirming = confirmingDelete === project.id;

    return (
      <li
        key={project.id}
        className={`${styles.leadCard} ${editing ? styles.leadCardEditing : ''}`}
        draggable={!editing}
        onDragStart={() => setDragId(project.id)}
        onDragEnd={() => { setDragId(null); setDragOverStage(null); }}
      >
        {/* Card header (always visible) */}
        <button
          className={styles.leadCardHead}
          onClick={() => setEditingId(editing ? null : project.id)}
          aria-expanded={editing}
        >
          <span className={styles.leadName}>{project.client || 'Untitled client'}</span>
          {project.title && <span className={styles.leadCompany}>{project.title}</span>}
        </button>

        {/* Meta row: Care Plan badge */}
        {project.carePlan && (
          <div className={styles.leadMeta}>
            <span className={styles.carePlanBadge}>♥ Care Plan</span>
          </div>
        )}

        {/* Inline editor (expanded) */}
        {editing && (
          <div className={styles.leadEditor}>
            <label className={styles.leadField}>
              <span>Client</span>
              <input
                value={project.client}
                onChange={(e) => updateProject(project.id, { client: e.target.value })}
              />
            </label>
            <label className={styles.leadField}>
              <span>Project</span>
              <input
                value={project.title}
                onChange={(e) => updateProject(project.id, { title: e.target.value })}
              />
            </label>
            <label className={styles.leadField}>
              <span>Stage</span>
              <select
                value={project.stage}
                onChange={(e) => updateProject(project.id, { stage: e.target.value as ProjectStage })}
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>{STAGE_LABELS[s]}</option>
                ))}
              </select>
            </label>
            {/* Care Plan toggle */}
            <label className={styles.leadCheckRow}>
              <input
                type="checkbox"
                checked={project.carePlan}
                onChange={(e) => updateProject(project.id, { carePlan: e.target.checked })}
              />
              <span>On Care Plan (uptime + critical bugs)</span>
            </label>
            <label className={styles.leadField}>
              <span>Notes</span>
              <textarea
                rows={3}
                value={project.notes}
                onChange={(e) => updateProject(project.id, { notes: e.target.value })}
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
                  <button className={styles.leadConfirmYes} onClick={() => deleteProject(project.id)}>Yes</button>
                  <button className={styles.leadConfirmNo} onClick={() => setConfirmingDelete(null)}>Cancel</button>
                </span>
              ) : (
                <button className={styles.leadDeleteBtn} onClick={() => setConfirmingDelete(project.id)}>
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
      {/* Add-project form */}
      <form className={styles.leadAddForm} onSubmit={addProject}>
        <input
          className={styles.addInput}
          type="text"
          value={client}
          onChange={(e) => setClient(e.target.value)}
          placeholder="Client / business name…"
          aria-label="Client name"
        />
        <input
          className={styles.addInput}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Project (e.g. Website redesign)"
          aria-label="Project title"
        />
        <button className={styles.addBtn} type="submit" disabled={!client.trim() || !title.trim()}>
          Add project
        </button>
      </form>

      {projects.length === 0 ? (
        <div className={styles.seedEmpty}>
          <p className={styles.empty}>No client projects yet. Add one above, or…</p>
          <button className={styles.seedBtn} onClick={seedStarter}>
            Add starter projects
          </button>
        </div>
      ) : (
        /* Kanban board: one column per stage */
        <div className={styles.leadBoard}>
          {STAGES.map((stage) => {
            const colProjects = projects.filter((p) => p.stage === stage);
            return (
              <section
                key={stage}
                className={`${styles.leadCol} ${dragOverStage === stage ? styles.leadColDragOver : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOverStage(stage); }}
                onDragLeave={() => setDragOverStage((s) => (s === stage ? null : s))}
                onDrop={() => dropOnStage(stage)}
                aria-label={`${STAGE_LABELS[stage]} projects`}
              >
                <header className={styles.leadColHead}>
                  <span className={styles.leadColDot} style={{ background: STAGE_COLORS[stage] }} />
                  <span className={styles.leadColName}>{STAGE_LABELS[stage]}</span>
                  <span className={styles.leadColCount}>{colProjects.length}</span>
                </header>
                <ul className={styles.leadColList}>
                  {colProjects.map(renderCard)}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
