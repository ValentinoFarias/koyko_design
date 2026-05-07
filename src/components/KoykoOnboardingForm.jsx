// KoykoOnboardingForm — standalone client onboarding form for /form
//
// Sections:
//   01 About You       — name, restaurant name, email
//   02 The Project     — tier card selection, goal textarea
//   03 Assets          — toggle buttons for photos & domain
//   04 Hosting         — card selection (koyko-managed vs self-managed)
//   05 Timeline        — go-live date, any other notes
//
// On submit, POSTs to /api/onboarding which sends a summary email via Resend.
// Uses controlled inputs — all state lives in `form` object.

'use client';

import { useState } from 'react';

// The three project tiers
const TIERS = [
  { value: 'starter',   label: 'Starter',   price: 'From £300', desc: 'Clean, fast, yours.' },
  { value: 'signature', label: 'Signature',  price: 'From £400', desc: 'Full custom design.' },
  { value: 'bespoke',   label: 'Bespoke',    price: 'From £500', desc: 'Built around your brand.' },
];

// The two hosting options
const HOSTING = [
  { value: 'koyko', title: 'Koyko manages it',   sub: '£25/mo — I handle everything. You never touch a server.' },
  { value: 'self',  title: 'I\'ll manage it myself', sub: '~£16–20/mo direct to platforms. I\'ll guide the setup.' },
];

function KoykoOnboardingForm() {
  const [form, setForm] = useState({
    name: '',
    restaurant: '',
    email: '',
    tier: '',
    goal: '',
    photos: '',   // 'yes' | 'not-yet' | 'a-few'
    domain: '',   // 'yes' | 'no' | 'not-sure'
    hosting: '',
    payment: '',  // '1' | '2' | '3' instalments
    timeline: '',
    other: '',
    website: '', // honeypot — never shown, bots fill it
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Generic handler for text inputs and textareas
  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // Used for tier cards, hosting cards, and toggle buttons
  function pick(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/onboarding', {
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
      setError('Could not send your answers. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  // Success screen — shown after a successful submission
  if (submitted) {
    return (
      <div className="koyko-onboarding__success">
        <img src="/assets/images/LogoKoyko.png" alt="Koyko logo" className="koyko-onboarding__success-logo" />
        <h2>You&apos;re all set.</h2>
        <p>I&apos;ve got everything I need to get started.<br />Expect a message from me within 24 hours.</p>
        <p className="koyko-onboarding__success-sig">— Valentino, Koyko Design Studio</p>
      </div>
    );
  }

  return (
    <form className="koyko-onboarding__form" onSubmit={handleSubmit} noValidate>

      {/* Honeypot — visually hidden, bots fill it, server silently rejects */}
      <input
        type="text"
        name="website"
        value={form.website}
        onChange={handleChange}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}
      />

      {/* ── Header ── */}
      <div className="koyko-onboarding__header">
        <img src="/assets/images/LogoKoyko.png" alt="Koyko logo" className="koyko-onboarding__logo" />
        <p className="koyko-onboarding__studio-name">Koyko Design Studio</p>
        <h1 className="koyko-onboarding__title">
          Let&apos;s get<br /><em>started.</em>
        </h1>
        <div className="koyko-onboarding__divider" aria-hidden="true" />
        <p className="koyko-onboarding__sub">
          A few quick questions so I can hit the ground running. Takes about 3 minutes.
        </p>
      </div>

      {/* ── 01 About You ── */}
      <section className="koyko-onboarding__section">
        <p className="koyko-onboarding__section-label">01 — About You</p>

        <div className="koyko-onboarding__field">
          <label htmlFor="ob-name">Your name</label>
          <input id="ob-name" type="text" name="name" value={form.name}
            onChange={handleChange} placeholder="e.g. Maria Santos" required />
        </div>

        <div className="koyko-onboarding__field">
          <label htmlFor="ob-restaurant">Restaurant name</label>
          <input id="ob-restaurant" type="text" name="restaurant" value={form.restaurant}
            onChange={handleChange} placeholder="e.g. Café Soleil" required />
        </div>

        <div className="koyko-onboarding__field">
          <label htmlFor="ob-email">Email address</label>
          <input id="ob-email" type="email" name="email" value={form.email}
            onChange={handleChange} placeholder="you@yourrestaurant.com" required />
        </div>
      </section>

      {/* ── 02 The Project ── */}
      <section className="koyko-onboarding__section">
        <p className="koyko-onboarding__section-label">02 — The Project</p>

        <div className="koyko-onboarding__field">
          <label>Which tier are you going with?</label>
          <div className="koyko-onboarding__tier-grid">
            {TIERS.map(({ value, label, price, desc }) => (
              <button
                key={value}
                type="button"
                className={`koyko-onboarding__tier-card${form.tier === value ? ' koyko-onboarding__tier-card--selected' : ''}`}
                onClick={() => pick('tier', value)}
                aria-pressed={form.tier === value}
              >
                <span className="koyko-onboarding__tier-name">{label}</span>
                <span className="koyko-onboarding__tier-price">{price}</span>
                <span className="koyko-onboarding__tier-desc">{desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="koyko-onboarding__field koyko-onboarding__field--mt">
          <label htmlFor="ob-goal">
            What&apos;s the main goal for the website?
            <span className="koyko-onboarding__hint"> optional</span>
          </label>
          <textarea id="ob-goal" name="goal" value={form.goal} onChange={handleChange}
            placeholder="e.g. Get more bookings, show off our new menu, replace our outdated site…" />
        </div>
      </section>

      {/* ── 03 Assets & Content ── */}
      <section className="koyko-onboarding__section">
        <p className="koyko-onboarding__section-label">03 — Assets &amp; Content</p>

        <div className="koyko-onboarding__field">
          <label>Do you have high-quality photos to share?</label>
          <div className="koyko-onboarding__toggle-group" role="group" aria-label="Photos">
            {[['yes', 'Yes'], ['not-yet', 'Not yet'], ['a-few', 'A few']].map(([val, txt]) => (
              <button key={val} type="button"
                className={`koyko-onboarding__toggle${form.photos === val ? ' koyko-onboarding__toggle--active' : ''}`}
                onClick={() => pick('photos', val)}
                aria-pressed={form.photos === val}
              >{txt}</button>
            ))}
          </div>
        </div>

        <div className="koyko-onboarding__field koyko-onboarding__field--mt">
          <label>Do you have a domain name already?</label>
          <div className="koyko-onboarding__toggle-group" role="group" aria-label="Domain">
            {[['yes', 'Yes'], ['no', 'No'], ['not-sure', 'Not sure']].map(([val, txt]) => (
              <button key={val} type="button"
                className={`koyko-onboarding__toggle${form.domain === val ? ' koyko-onboarding__toggle--active' : ''}`}
                onClick={() => pick('domain', val)}
                aria-pressed={form.domain === val}
              >{txt}</button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 04 Hosting ── */}
      <section className="koyko-onboarding__section">
        <p className="koyko-onboarding__section-label">04 — Hosting Preference</p>

        <div className="koyko-onboarding__field">
          <label>How would you like to handle hosting?</label>
          <div className="koyko-onboarding__hosting-grid">
            {HOSTING.map(({ value, title, sub }) => (
              <button
                key={value}
                type="button"
                className={`koyko-onboarding__hosting-card${form.hosting === value ? ' koyko-onboarding__hosting-card--selected' : ''}`}
                onClick={() => pick('hosting', value)}
                aria-pressed={form.hosting === value}
              >
                <span className="koyko-onboarding__hosting-title">{title}</span>
                <span className="koyko-onboarding__hosting-sub">{sub}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 05 Payment ── */}
      <section className="koyko-onboarding__section">
        <p className="koyko-onboarding__section-label">05 — Payment</p>

        <div className="koyko-onboarding__field">
          <label>How would you like to split the payment?</label>
          <div className="koyko-onboarding__tier-grid">
            {[
              { value: '1', label: '1 Payment',     desc: 'Full payment on delivery.' },
              { value: '2', label: '2 Instalments', desc: '1st on delivery, 2nd one month later.' },
              { value: '3', label: '3 Instalments', desc: '1st on delivery, then one each month after.' },
            ].map(({ value, label, desc }) => (
              <button
                key={value}
                type="button"
                className={`koyko-onboarding__tier-card${form.payment === value ? ' koyko-onboarding__tier-card--selected' : ''}`}
                onClick={() => pick('payment', value)}
                aria-pressed={form.payment === value}
              >
                <span className="koyko-onboarding__tier-name">{label}</span>
                <span className="koyko-onboarding__tier-desc">{desc}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 06 Timeline ── */}
      <section className="koyko-onboarding__section">
        <p className="koyko-onboarding__section-label">06 — Timeline</p>

        <div className="koyko-onboarding__field">
          <label htmlFor="ob-timeline">
            Is there a date you&apos;d like the site live by?
            <span className="koyko-onboarding__hint"> optional</span>
          </label>
          <input id="ob-timeline" type="text" name="timeline" value={form.timeline}
            onChange={handleChange} placeholder="e.g. End of August, before our reopening…" />
        </div>

        <div className="koyko-onboarding__field">
          <label htmlFor="ob-other">
            Anything else I should know?
            <span className="koyko-onboarding__hint"> optional</span>
          </label>
          <textarea id="ob-other" name="other" value={form.other} onChange={handleChange}
            placeholder="Social links, existing branding, references you love…"
            className="koyko-onboarding__textarea--short" />
        </div>
      </section>

      {/* ── Submit ── */}
      {error && <p className="koyko-onboarding__error">{error}</p>}

      <div className="koyko-onboarding__submit-row">
        <p className="koyko-onboarding__submit-note">
          I&apos;ll review your answers and be in touch within 24 hours to kick things off.
        </p>
        <button type="submit" className="koyko-onboarding__submit" disabled={loading}>
          {loading ? 'Sending…' : 'Submit →'}
        </button>
      </div>

    </form>
  );
}

export default KoykoOnboardingForm;
