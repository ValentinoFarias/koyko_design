'use client';

/* =============================================================================
   STUDIO TODOS — the Marketing and Admin tabs: a simple standing checklist.

   Not everything needs a kanban. Marketing and Admin are checklist work, so this
   is a plain add / check-off / delete list. Both tabs share ONE `todos` array
   (owned by page.tsx); this component filters it to its `area` prop.
   ============================================================================= */

import { useState, type FormEvent, type Dispatch, type SetStateAction } from 'react';
import styles from './studio-hub.module.css';

/* ---------------------------------------------------------------------------
   Types (exported so page.tsx can type its `todos` state)
   --------------------------------------------------------------------------- */

export type TodoArea = 'Marketing' | 'Admin';

export type Todo = {
  id: string;
  text: string;
  area: TodoArea;
  done: boolean;
  createdAt: number;
};

/* ---------------------------------------------------------------------------
   Helper (kept local so this component stays self-contained)
   --------------------------------------------------------------------------- */

function newId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/* ---------------------------------------------------------------------------
   Component
   --------------------------------------------------------------------------- */

type Props = {
  area: TodoArea;
  todos: Todo[];
  setTodos: Dispatch<SetStateAction<Todo[]>>;
};

export default function StudioTodos({ area, todos, setTodos }: Props) {
  const [text, setText] = useState('');

  // Only this area's items, newest first (open before done).
  const mine = todos
    .filter((t) => t.area === area)
    .sort((a, b) => Number(a.done) - Number(b.done) || b.createdAt - a.createdAt);
  const openCount = mine.filter((t) => !t.done).length;

  /* ---- Actions ---- */

  const addTodo = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    const todo: Todo = {
      id: newId(),
      text: trimmed,
      area,
      done: false,
      createdAt: Date.now(),
    };
    setTodos((prev) => [todo, ...prev]);
    setText('');
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  // Starter checklists per area (gaps not covered by Plan Marea / the CRM).
  const SEEDS: Record<TodoArea, string[]> = {
    Marketing: ['Publish case study', 'Update portfolio', 'Instagram post batch'],
    Admin: ['Send invoices', 'Domain / hosting renewals', 'Monthly accounting', 'Email migration'],
  };
  const seedStarter = () => {
    const now = Date.now();
    const seeded: Todo[] = SEEDS[area].map((text, i) => ({
      id: newId(),
      text,
      area,
      done: false,
      createdAt: now - i, // keep the listed order (newest-first sort)
    }));
    setTodos((prev) => [...seeded, ...prev]);
  };

  /* ---- Markup ---- */
  return (
    <div className={styles.todos}>
      {/* Add-todo form */}
      <form className={styles.addForm} onSubmit={addTodo}>
        <input
          className={styles.addInput}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Add a ${area} task…`}
          aria-label={`${area} task`}
        />
        <button className={styles.addBtn} type="submit" disabled={!text.trim()}>
          Add
        </button>
      </form>

      <div className={styles.sectionLabel}>
        {area} <span className={styles.count}>({openCount})</span>
      </div>

      {mine.length === 0 ? (
        <div className={styles.seedEmpty}>
          <p className={styles.empty}>No {area} tasks yet. Add one above, or…</p>
          <button className={styles.seedBtn} onClick={seedStarter}>
            Add starter {area} tasks
          </button>
        </div>
      ) : (
        <ul className={styles.taskList}>
          {mine.map((t) => (
            <li
              key={t.id}
              className={`${styles.taskRow} ${t.done ? styles.taskRowDone : ''}`}
            >
              <input
                type="checkbox"
                className={styles.check}
                checked={t.done}
                onChange={() => toggleTodo(t.id)}
                aria-label={t.done ? `Mark "${t.text}" as not done` : `Mark "${t.text}" as done`}
              />
              <div className={styles.taskMain}>
                <div className={`${styles.taskTitle} ${t.done ? styles.taskTitleDone : ''}`}>
                  {t.text}
                </div>
              </div>
              <button
                className={styles.deleteBtn}
                onClick={() => deleteTodo(t.id)}
                aria-label={`Delete "${t.text}"`}
                title="Delete"
              >
                ⌫
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
