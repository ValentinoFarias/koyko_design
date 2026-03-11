// KoykoHero — full-viewport editorial hero section
//
// Visual structure (two rows):
//   Row 1 (.koyko-hero__inner)
//     - Left:  large "k o y k" wordmark in Inter Regular
//     - Right: Koyko bird/figure logo illustration
//   Row 2 (.koyko-hero__bottom)
//     - Left:  small gold decorative dot (purely visual)
//     - Right: "D  E  S  I  G  N" in Noto Sans JP light

import { LOGO, GOLD_DOT } from '../assets/koykoAssets';

function KoykoHero() {
  return (
    <section className="koyko-hero" aria-label="Hero">

      {/* ── Row 1: wordmark + logo ──────────────────────────────────── */}
      {/* Flex row aligned at the bottom so the text baseline meets the logo foot */}
      <div className="koyko-hero__inner">

        {/* Brand wordmark — intentional letter-spaced style from the Figma */}
        <h1 className="koyko-hero__wordmark">k o y k</h1>

        {/* Logo illustration — scales fluidly via clamp() in CSS */}
        <div className="koyko-hero__logo-wrap">
          <img
            src={LOGO}
            alt="Koyko — a figure with outstretched wings"
            className="koyko-hero__logo"
          />
        </div>

      </div>

      {/* ── Row 2: gold dot + "DESIGN" label ───────────────────────── */}
      <div className="koyko-hero__bottom">

        {/* Purely decorative — hidden from screen readers */}
        <img
          src={GOLD_DOT}
          alt=""
          aria-hidden="true"
          className="koyko-hero__gold-dot"
        />

        {/* "D  E  S  I  G  N" — Noto Sans JP W3 (light), heavy letter-spacing */}
        {/* &nbsp;&nbsp; creates double-space between each letter as in the Figma */}
        <p className="koyko-hero__design-label">
          D&nbsp;&nbsp;E&nbsp;&nbsp;S&nbsp;&nbsp;I&nbsp;&nbsp;G&nbsp;&nbsp;N
        </p>

      </div>

    </section>
  );
}

export default KoykoHero;
