// KoykoMission — full-bleed dark section explaining the Koyko philosophy
//
// Layout:
//   - Black (#010000) background
//   - Faint texture image behind all text at opacity 0.11 (purely atmospheric)
//   - Centred tagline at the top: "Let's create the home of your work."
//   - Five body paragraphs telling the Koyko story
//
// Font: Noto Sans JP weight 800 — maps to Hiragino Kaku Gothic Std W8 in the Figma

import { MISSION_BG } from '../assets/koykoAssets';

function KoykoMission() {
  return (
    <section className="koyko-mission" id="mission" aria-label="Mission">

      {/* Background texture — decorative only, hidden from assistive tech */}
      <img
        src={MISSION_BG}
        alt=""
        aria-hidden="true"
        className="koyko-mission__bg"
      />

      <div className="koyko-mission__content">

        {/* Centred tagline — sits above the body copy */}
        <p className="koyko-mission__tagline">
          Let&apos;s create the home of your work.
        </p>

        {/* Brand story — five paragraphs taken directly from the Figma design */}
        <div className="koyko-mission__body">
          <p>
            Koyko is drawn from Mapudungun, the language of the Mapuche people,
            where it means water. Like water, the work here takes the shape of
            what it holds — adapting, flowing, always finding its truest form.
          </p>
          <p>
            Every project undertaken by Koyko Design begins with a single belief:
            that a website is not a template to be filled, but a space to be
            inhabited. Built for businesses, artists, creatives, and those who
            refuse to look like everyone else — each digital experience is crafted
            with precision, intention, and care.
          </p>
          <p>
            What Koyko Design offers — Bespoke web design and development. Tailored
            entirely to the individual. For creatives and small businesses who
            understand that a distinctive digital presence is not a luxury —
            it is a necessity.
          </p>
          <p>
            The aim — To bring the kind of craftsmanship once reserved for large
            budgets and agency teams to those who deserve it most. No middlemen.
            No inflated costs. Just considered, high-quality work delivered with
            personal attention.
          </p>
          <p>
            And the best part? Your website should belong to you — fully,
            unconditionally. Koyko Design delivers clean, custom code with no
            subscriptions, no recurring fees, no strings attached. Built for you.
            Yours to keep. Forever.
          </p>
        </div>

      </div>
    </section>
  );
}

export default KoykoMission;
