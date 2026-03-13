'use client';

// KoykoNavbar — fixed top navigation bar
//
// Layout: three spaced-letter items spread with justify-content: space-between
//   left   → "k o y k o" brand name (non-clickable span)
//   center → "p a c k a g e s" anchor → #packages
//   right  → "c o n t a c t" anchor  → #contact
//
// Stays on top of all content via z-index: --z-header and position: fixed.
// A frosted-glass effect (backdrop-filter: blur) shows through when scrolling.
//
// Hover effect: each letter rolls upward one by one (left→right) via GSAP stagger,
// revealing a duplicate of the same letter — then resets on mouse leave.

import { useRef, Fragment } from 'react';
import gsap from 'gsap';

// RollingText — shared letter-roll component used by both the brand and the nav links.
//
// How it works:
//   1. Each letter is wrapped in a clip window (overflow: hidden, height: 1em)
//   2. Inside, a "track" holds two copies of the letter stacked vertically
//   3. GSAP translates the track up by 50% (= 1 letter height) with a left→right stagger
//   4. The clip window only ever shows one letter at a time
//
// Props:
//   displayText — spaced string like "c o n t a c t"
//   href        — if provided, renders an <a>; if omitted, renders a <span>
//   label       — accessible label (used as aria-label on <a> elements)
//   className   — CSS class passed to the root element
function RollingText({ href, label, displayText, className }) {
  const ref = useRef(null);

  // Strip spaces from "c o n t a c t" → ['c','o','n','t','a','c','t']
  const letters = displayText.replace(/ /g, '').split('');

  function handleEnter() {
    const tracks = ref.current.querySelectorAll('.koyko-nav__letter-track');
    gsap.to(tracks, {
      yPercent: -50,  // moves up by half the track height = exactly 1 letter
      duration: 0.35,
      ease: 'power2.inOut',
      stagger: 0.05,  // 50ms between each letter → left-to-right wave
    });
  }

  function handleLeave() {
    const tracks = ref.current.querySelectorAll('.koyko-nav__letter-track');
    gsap.to(tracks, {
      yPercent: 0,    // reset back to original position
      duration: 0.35,
      ease: 'power2.inOut',
      stagger: 0.05,
    });
  }

  // The animated letter rows — same markup for both <a> and <span>
  const content = (
    <span aria-hidden="true" className="koyko-nav__word">
      {letters.map((char, i) => (
        <Fragment key={i}>
          {i > 0 && ' '}
          <span className="koyko-nav__letter">
            <span className="koyko-nav__letter-track">
              <span>{char}</span>  {/* top copy — visible at rest */}
              <span>{char}</span>  {/* bottom copy — rolls into view on hover */}
            </span>
          </span>
        </Fragment>
      ))}
    </span>
  );

  // Render as <a> when href is given, otherwise as a plain <span>
  if (href) {
    return (
      <a
        ref={ref}
        href={href}
        className={className}
        aria-label={label}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        {content}
      </a>
    );
  }

  return (
    <span
      ref={ref}
      className={className}
      aria-label={label}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {content}
    </span>
  );
}

// Convenience wrappers so the navbar JSX stays readable
function NavLink({ href, label, displayText }) {
  return <RollingText href={href} label={label} displayText={displayText} className="koyko-nav__link" />;
}

function NavBrand({ href, displayText, label }) {
  return <RollingText href={href} label={label} displayText={displayText} className="koyko-nav__logo" />;
}

function KoykoNavbar() {
  return (
    <nav className="koyko-nav" aria-label="Main navigation">
      {/* Brand name — clicking it navigates back to the Landing page (route "/") */}
      <NavBrand href="/home" displayText="k o y k o" label="Go to home page" />

      <NavLink href="/packages" label="packages" displayText="p a c k a g e s" />
      <NavLink href="/contact"  label="contact"  displayText="c o n t a c t" />

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
