// KoykoFooter — site footer with contact info and back-to-top
//
// Grid layout (desktop — 4 columns):
//   Col 1 → Koyko logo mark (scaled down)
//   Col 2 → 2px vertical divider line
//   Col 3 → Email contact: bold "hello" label + mailto link
//   Col 4 → Social contacts: Whatsapp, Telegram, "Ask for Valentino"
//
// Row 2 (full-width):
//   "Back to top >" button — right-aligned, scrolls to top on click
//
// On mobile (≤640px) the grid stacks vertically and the vertical divider
// becomes a horizontal one — handled in CSS.

import { LOGO } from '../assets/koykoAssets';

function KoykoFooter() {
  // Scroll the page back to the top smoothly when the button is clicked
  const handleBackToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="koyko-footer">

      {/* ── Col 1: Logo ──────────────────────────────────────────── */}
      <div className="koyko-footer__logo-col">
        <img
          src={LOGO}
          alt="Koyko Design"
          className="koyko-footer__logo"
        />
      </div>

      {/* ── Col 2: Vertical divider ───────────────────────────────── */}
      {/* CSS handles switching this to a horizontal rule on mobile */}
      <div className="koyko-footer__vdivider" aria-hidden="true" />

      {/* ── Col 3: Email contact ──────────────────────────────────── */}
      <div className="koyko-footer__contact-col">
        {/* Bold "hello" label above the email address */}
        <span className="koyko-footer__label">hello</span>
        <a
          href="mailto:hello@koykodesign.com"
          className="koyko-footer__value"
        >
          hello@koykodesign.com
        </a>
      </div>

      {/* ── Col 4: Social / messaging ─────────────────────────────── */}
      <div className="koyko-footer__social-col">
        <span className="koyko-footer__value">Whatsapp</span>
        <span className="koyko-footer__value">Telegram</span>
        {/* Light-weight note — matches the Figma "Ask for Valentino" label */}
        <span className="koyko-footer__social-note">Ask for Valentino</span>
      </div>

      {/* ── Row 2: Back to top ────────────────────────────────────── */}
      {/* grid-column: 1 / -1 in CSS makes this span all four columns */}
      <button
        className="koyko-footer__back-to-top"
        onClick={handleBackToTop}
        aria-label="Scroll back to top of page"
      >
        Back to top &gt;
      </button>

    </footer>
  );
}

export default KoykoFooter;
