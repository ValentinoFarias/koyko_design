import React, { useState } from 'react';

/**
 * Contact section with basic client-side validation.
 */
function ContactSection() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Please enter your name.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Please add a short message.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field-level error as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate async submission
    await new Promise((resolve) => setTimeout(resolve, 900));

    setIsSubmitting(false);
    setHasSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <section id="contact" className="section section-contact" aria-labelledby="contact-heading">
      <div className="section__inner section-contact__inner">
        <header className="section__header">
          <h2 id="contact-heading" className="section__title">
            Contact
          </h2>
          <p className="section__lead">
            Ready to collaborate? Share a few details and I will get back to you.
          </p>
        </header>

        <div className="section-contact__grid">
          <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <div className="contact-form__field">
              <label htmlFor="name" className="contact-form__label">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="contact-form__input"
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && (
                <p id="name-error" className="contact-form__error" role="alert">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="contact-form__field">
              <label htmlFor="email" className="contact-form__label">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="contact-form__input"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <p id="email-error" className="contact-form__error" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="contact-form__field">
              <label htmlFor="message" className="contact-form__label">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                className="contact-form__input contact-form__input--textarea"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? 'message-error' : undefined}
              />
              {errors.message && (
                <p id="message-error" className="contact-form__error" role="alert">
                  {errors.message}
                </p>
              )}
            </div>

            <button type="submit" className="btn btn--primary contact-form__submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending…' : 'Send Message'}
            </button>

            {hasSubmitted && !isSubmitting && (
              <p className="contact-form__success" role="status">
                Thanks for reaching out! I will reply shortly.
              </p>
            )}
          </form>

          <aside className="section-contact__aside">
            <p className="section__body">
              Prefer email? Reach me at
              {' '}
              <a href="mailto:hello@koyko.studio" className="link-inline">
                hello@koyko.studio
              </a>
              .
            </p>
            <p className="section__body">Available for freelance work, product collaborations, and design partnerships.</p>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
