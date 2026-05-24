// KoykoFeatures — horizontally scrolling marquee ticker
//
// Displays "FEATURES  —  PORTFOLIO  —  CASE STUDIES" in a continuous loop.
//
// How the seamless loop works:
//   Three identical text spans are placed in a flex row.
//   The CSS animation (@keyframes koyko-marquee) translates the track by -33.33%,
//   which is exactly one span width. When it snaps back to 0, the user sees
//   the same text — creating the illusion of infinite motion.
//
// Accessibility: the entire strip is aria-hidden because it is decorative.
// Users who prefer reduced motion will see the marquee paused (handled in CSS).

// Text content — three repetitions make the loop seamless at any viewport width
const MARQUEE_TEXT = 'FEATURES  —  PORTFOLIO  —  CASE STUDIES  ';

function KoykoFeatures() {
  return (
    // aria-hidden: this strip is decorative — screen readers skip it entirely
    <div className="koyko-features" aria-hidden="true">
      <div className="koyko-features__track">
        {/* Span 1 — visible as the animation starts */}
        <span className="koyko-features__text">{MARQUEE_TEXT}</span>
        {/* Span 2 — fills the gap as span 1 scrolls off-screen */}
        <span className="koyko-features__text">{MARQUEE_TEXT}</span>
        {/* Span 3 — ensures no blank space at wide viewports */}
        <span className="koyko-features__text">{MARQUEE_TEXT}</span>
      </div>
    </div>
  );
}

export default KoykoFeatures;
