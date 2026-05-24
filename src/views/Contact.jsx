'use client';

// Contact — /contact route
//
// Page order:
//   1. KoykoNavbar      — fixed top nav
//   2. Page header      — eyebrow + title + subtitle
//   3. KoykoContactForm — name, email, project type, message, submit
//   4. KoykoFooter      — logo + contact info + back-to-top

import KoykoNavbar from '../components/KoykoNavbar';
import KoykoContactForm from '../components/KoykoContactForm';
import KoykoFooter from '../components/KoykoFooter';

function Contact() {
  return (
    <div className="koyko-page">
      <KoykoNavbar />

      <div className="koyko-contact-page">
        <div className="koyko-contact-page__card">
          {/* Page header — inside the card so everything lives together */}
          <header className="koyko-contact-page__header">
            <p className="koyko-contact-page__eyebrow">K O Y K O &nbsp; D E S I G N</p>
            <h1 className="koyko-contact-page__title">Let&apos;s talk</h1>
            <p className="koyko-contact-page__subtitle">
              Fill in the form and I&apos;ll get back to you within 48 hours.
            </p>
          </header>

          <KoykoContactForm />
        </div>
      </div>

      <KoykoFooter />
    </div>
  );
}

export default Contact;
