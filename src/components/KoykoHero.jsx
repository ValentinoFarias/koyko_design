// KoykoHero — full-viewport editorial hero section
//
// Visual structure (overlapping layout):
//   "k o y k" wordmark sits left, vertically aligned with the logo's head
//   so the figure's head visually replaces the missing 'O' in "koyko".
//   The logo is centred in the hero area.
//   "D  E  S  I  G  N" label sits at the bottom right.

import { LOGO } from '../assets/koykoAssets';

function KoykoHero() {
  return (
    <section className="koyko-hero" aria-label="Hero">

      {/* Main hero area — position:relative so children can overlap */}
      <div className="koyko-hero__stage">

        {/* "k o y k" wordmark — positioned left, aligned with logo head.
            The logo's head fills the space where the 'O' would be. */}
        <h1 className="koyko-hero__wordmark">k o y k</h1>

        {/* Logo illustration — centred in the hero stage */}
        <img
          src={LOGO}
          alt="Koyko — a figure with outstretched wings"
          className="koyko-hero__logo"
        />

        {/* "D  E  S  I  G  N" — positioned bottom-right of the stage */}
        <p className="koyko-hero__design-label">
          D&nbsp;&nbsp;E&nbsp;&nbsp;S&nbsp;&nbsp;I&nbsp;&nbsp;G&nbsp;&nbsp;N
        </p>

      </div>

    </section>
  );
}

export default KoykoHero;
