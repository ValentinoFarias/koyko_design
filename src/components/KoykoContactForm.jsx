// KoykoContactForm — simple contact form for the /contact page
//
// Fields: Name, Email, Project type (select), Message, Submit button
// Uses controlled inputs (useState) to track form values.
// On submit, POSTs to /api/contact which forwards the message to
// hello@koykodesign.com via Resend.

'use client';

import { useState } from 'react';

function KoykoContactForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    project: '',
    message: '',
    website: '', // honeypot — never shown to users; bots fill it and get silently rejected
  });

  // Submitted state controls the thank-you message shown after sending
  const [submitted, setSubmitted] = useState(false);

  // Error message shown if the API call fails
  const [error, setError] = useState('');

  // Loading state disables the button while the request is in flight
  const [loading, setLoading] = useState(false);

  // Single handler updates whichever field changed
  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // POST the form data to the Next.js API route
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        // Server returned an error — show it to the user
        const data = await res.json();
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      // Success — show the thank-you screen
      setSubmitted(true);

    } catch {
      // Network or unexpected error
      setError('Could not send your message. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  // After submission show a simple thank-you note
  if (submitted) {
    return (
      <div className="koyko-contact-form__thanks">
        <p>Thank you, {form.name}.</p>
        <p>I&apos;ll be in touch soon.</p>
      </div>
    );
  }

  return (
    <form className="koyko-contact-form" onSubmit={handleSubmit} noValidate>

      {/*
        Honeypot field — visually hidden from real users via inline style.
        Bots that auto-fill all inputs will fill this field, which causes
        the server to silently discard the submission.
      */}
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

      {/* Name */}
      <div className="koyko-contact-form__field">
        <label htmlFor="cf-name" className="koyko-contact-form__label">Name</label>
        <input
          id="cf-name"
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Your name"
          required
          className="koyko-contact-form__input"
        />
      </div>

      {/* Email */}
      <div className="koyko-contact-form__field">
        <label htmlFor="cf-email" className="koyko-contact-form__label">Email</label>
        <input
          id="cf-email"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          required
          className="koyko-contact-form__input"
        />
      </div>

      {/* Project type */}
      <div className="koyko-contact-form__field">
        <label htmlFor="cf-project" className="koyko-contact-form__label">Project type</label>
        <select
          id="cf-project"
          name="project"
          value={form.project}
          onChange={handleChange}
          className="koyko-contact-form__input koyko-contact-form__select"
        >
          <option value="">Select a package</option>
          <option value="essential">Essential — £1200</option>
          <option value="premium">Premium — £2400</option>
          <option value="signature">Signature — £5000+</option>
          <option value="other">Other / Not sure yet</option>
        </select>
      </div>

      {/* Message */}
      <div className="koyko-contact-form__field">
        <label htmlFor="cf-message" className="koyko-contact-form__label">Message</label>
        <textarea
          id="cf-message"
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="Tell me about your project..."
          rows={6}
          required
          className="koyko-contact-form__input koyko-contact-form__textarea"
        />
      </div>

      {/* Error message — shown only if the API call fails */}
      {error && (
        <p className="koyko-contact-form__error">{error}</p>
      )}

      {/* Submit — disabled while the request is in flight */}
      <button type="submit" className="koyko-contact-form__submit" disabled={loading}>
        {loading ? 'Sending…' : 'Send message'}
      </button>

    </form>
  );
}

export default KoykoContactForm;
