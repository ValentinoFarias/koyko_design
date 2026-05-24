'use client';

// Marquee band — pure CSS scroll loop, paused on hover.
// The repeated spans tile the track wide enough for a seamless -50% wrap.
export default function KoykoMarqueeV2() {
  // Non-breaking spaces ( ) keep the dot separators from collapsing
  // or wrapping mid-band.
  const ITEM = 'FEATURES  ·  PORTFOLIO  ·  CASE STUDIES  ·  ';

  return (
    <section className="v2-marquee" id="features" aria-label="Sections">
      <div className="v2-marquee__track">
        <span>{ITEM}</span>
        <span>{ITEM}</span>
        <span>{ITEM}</span>
        {/* 4th copy is decorative — extra buffer for the seamless wrap. */}
        <span aria-hidden="true">{ITEM}</span>
      </div>
    </section>
  );
}
