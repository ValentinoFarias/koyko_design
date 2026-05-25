'use client';

import { useState } from 'react';

// KoykoContactFormV2 — v2-styled contact form.
// Logic mirrors v1 KoykoContactForm: controlled inputs, POST to /api/contact,
// honeypot field for bots, and a thank-you state on success.

const PROJECT_OPTIONS = [
  { value: '',          label: 'Select a package' },
  { value: 'essential', label: 'Essential — £1200' },
  { value: 'premium',   label: 'Premium — £2400' },
  { value: 'signature', label: 'Signature — £5000+' },
  { value: 'other',     label: 'Other / Not sure yet' },
];

export default function KoykoContactFormV2() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    project: '',
    message: '',
    // Honeypot — never shown to humans. Bots fill it and the server discards.
    website: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Single handler updates whichever field changed.
  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setSubmitted(true);
    } catch {
      setError('Could not send your message. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  // Thank-you screen replaces the form once a submission lands.
  if (submitted) {
    return (
      <div className="v2-form__thanks">
        <p className="v2-form__thanks-line">Thank you, {form.name || 'friend'}.</p>
        <p className="v2-form__thanks-line v2-form__thanks-line--mute">
          I'll be in touch soon.
        </p>
      </div>
    );
  }

  return (
    <form className="v2-form" onSubmit={handleSubmit} noValidate>
      {/* Honeypot — visually hidden but visible to bots that fill every input. */}
      <input
        type="text"
        name="website"
        value={form.website}
        onChange={handleChange}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}
      />

      <div className="v2-form__field">
        <label htmlFor="v2-cf-name" className="v2-form__label">name</label>
        <input
          id="v2-cf-name"
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="your name"
          required
          className="v2-form__input"
        />
      </div>

      <div className="v2-form__field">
        <label htmlFor="v2-cf-email" className="v2-form__label">email</label>
        <input
          id="v2-cf-email"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          required
          className="v2-form__input"
        />
      </div>

      <div className="v2-form__field">
        <label htmlFor="v2-cf-project" className="v2-form__label">project</label>
        <select
          id="v2-cf-project"
          name="project"
          value={form.project}
          onChange={handleChange}
          className="v2-form__input v2-form__select"
        >
          {PROJECT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="v2-form__field">
        <label htmlFor="v2-cf-message" className="v2-form__label">message</label>
        <textarea
          id="v2-cf-message"
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="tell me about your project…"
          rows={6}
          required
          className="v2-form__input v2-form__textarea"
        />
      </div>

      {error && <p className="v2-form__error">{error}</p>}

      <button type="submit" className="v2-form__submit" disabled={loading}>
        {loading ? 'sending…' : 'send message →'}
      </button>
    </form>
  );
}
