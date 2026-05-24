// KoykoContact — call-to-action section
//
// Three stacked elements (top → bottom):
//   1. "{contact}" label — small, top-left
//      The curly braces are intentional: this is how it appears in the Figma design.
//   2. "READY TO TALK ABOUT YOUR PROJECT?" — large, right-aligned heading
//      Each word is wrapped in a clipped <span> so GSAP can animate a
//      bottom-to-top "curtain reveal" when the section scrolls into view.
//   3. Circular arrow button — left-aligned, links to the contact email
//      The circle is drawn via CSS (border-radius: 50% + border: 2px solid),
//      and the arrow icon image is placed inside it.
//
// Section anchor id="contact" is targeted by the "c o n t a c t" nav link.

'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AVATAR, ARROW_CONTACT } from '../assets/koykoAssets';

// Register ScrollTrigger once at module level
gsap.registerPlugin(ScrollTrigger);

// ---------------------------------------------------------------------------
// RevealHeading — splits text into individually animated words.
//
// How the "curtain reveal" works:
//   1. Each word is wrapped in a clip container (overflow: hidden).
//   2. Inside, a <span> holds the word, starting pushed down (y: 100%).
//   3. When ScrollTrigger fires (section at 80% of viewport), GSAP
//      staggers each word upward to y: 0 — sliding into view one by one.
//   4. The clip container hides the word while it's below, creating a
//      clean bottom-to-top reveal.
//
// Props:
//   lines — array of strings, one per visual line (separated by <br> in the design)
// ---------------------------------------------------------------------------
function RevealHeading({ lines }) {
  const headingRef = useRef(null);

  useEffect(() => {
    // Grab all the inner word spans (the ones that move)
    const words = headingRef.current.querySelectorAll('.koyko-contact__word-inner');

    // Set the initial state — words start fully below their clip window
    gsap.set(words, { yPercent: 100 });

    // Animate words upward with stagger when section reaches 80% of viewport
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: headingRef.current,
        start: 'top 80%',   // fires when top of heading hits 80% of viewport
        once: true,          // only play once — no reverse on scroll up
      },
    });

    tl.to(words, {
      yPercent: 0,           // slide up into final position
      duration: 0.6,
      ease: 'power3.out',
      stagger: 0.08,         // 80ms delay between each word
    });

    // Cleanup ScrollTrigger on unmount
    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  return (
    <h2 ref={headingRef} className="koyko-contact__heading">
      {lines.map((line, lineIndex) => (
        // Each line is a fragment; lines are separated by <br />
        <span key={lineIndex}>
          {lineIndex > 0 && <br />}
          {line.split(' ').map((word, wordIndex) => (
            <span key={wordIndex} className="koyko-contact__word-clip">
              <span className="koyko-contact__word-inner">{word}</span>
            </span>
          ))}
        </span>
      ))}
    </h2>
  );
}

// ---------------------------------------------------------------------------
// KoykoContact — main section
// ---------------------------------------------------------------------------
function KoykoContact() {
  return (
    <section
      className="koyko-contact"
      id="contact"              // targeted by the "c o n t a c t" nav link
      aria-label="Contact"
    >
      {/* Small label — the {contact} syntax is a deliberate design choice */}
      <p className="koyko-contact__label">{'{contact}'}</p>

      {/* Main CTA heading — words reveal bottom-to-top on scroll */}
      <RevealHeading lines={['READY TO TALK ABOUT', 'YOUR PROJECT?']} />

      {/* Row: circle button on the left, arrow image to its right, side by side */}
      <div className="koyko-contact__row">
        <a
          href="mailto:hello@koykodesign.com"
          className="koyko-contact__arrow-btn"
          aria-label="Start your project — send an email to hello@koykodesign.com"
        >
          <span
            aria-hidden="true"
            className="koyko-contact__arrow-default-mark"
          >
            X
          </span>
          <img
            src={AVATAR}
            alt="Caricature avatar of Valentino"
            aria-hidden="true"
            className="koyko-contact__avatar koyko-contact__avatar--hover"
          />
        </a>
        <img
          src={ARROW_CONTACT}
          alt="Arrow pointing right toward the button"
          aria-hidden="true"
          className="koyko-contact-arrow-down"
        />
      </div>
    </section>
  );
}

export default KoykoContact;
