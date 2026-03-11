// KoykoNavbar — fixed top navigation bar
//
// Layout: three spaced-letter items spread with justify-content: space-between
//   left   → "k o y k o" brand name (non-clickable span)
//   center → "p a c k a g e s" anchor → #packages
//   right  → "c o n t a c t" anchor  → #contact
//
// Stays on top of all content via z-index: --z-header and position: fixed.
// A frosted-glass effect (backdrop-filter: blur) shows through when scrolling.

function KoykoNavbar() {
  return (
    <nav className="koyko-nav" aria-label="Main navigation">
      {/* Brand name — not a link, just an identity marker */}
      <span className="koyko-nav__logo">k o y k o</span>

      {/* Smooth-scroll to the Portfolio section */}
      <a href="#packages" className="koyko-nav__link">p a c k a g e s</a>

      {/* Smooth-scroll to the Contact section */}
      <a href="#contact" className="koyko-nav__link">c o n t a c t</a>

      {/*
        Decorative cross lines from the Figma "Navbar Deign" vector.
        Two elements recreate the shape in pure CSS:
          - koyko-nav__line-h: horizontal line along the navbar bottom, 75.6% wide
          - koyko-nav__line-v: vertical line at that same x position, drops into the hero
        75.6% = 1089px ÷ 1440px (the proportions taken directly from the Figma node).
      */}
      <span className="koyko-nav__line-h" aria-hidden="true" />
      <span className="koyko-nav__line-v" aria-hidden="true" />
    </nav>
  );
}

export default KoykoNavbar;
