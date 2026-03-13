// KoykoContactForm — simple contact form for the /contact page
//
// Fields: Name, Email, Project type (select), Message, Submit button
// Uses controlled inputs (useState) to track form values.
// On submit, prevents default and logs the data — replace with an
// API call or a service like Formspree/Resend when ready to go live.

'use client';

import { useState } from 'react';

function KoykoContactForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    project: '',
    message: '',
  });

  // Submitted state controls the thank-you message shown after sending
  const [submitted, setSubmitted] = useState(false);

  // Single handler updates whichever field changed
  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    // TODO: replace console.log with an API call (e.g. Formspree, Resend)
    console.log('Contact form submitted:', form);
    setSubmitted(true);
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

      {/* Submit */}
      <button type="submit" className="koyko-contact-form__submit">
        Send message
      </button>

    </form>
  );
}

export default KoykoContactForm;
