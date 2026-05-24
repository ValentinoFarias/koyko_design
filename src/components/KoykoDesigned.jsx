'use client';

// KoykoDesigned — "DESIGNED WITH LOVE" editorial heading section
//
// A simple full-width section with a single large heading.
// Font: Noto Sans JP weight 800 (maps to Hiragino Kaku Gothic Std W8 in Figma).
// Size: fluid 3rem → 6rem via clamp() in CSS.
//
// Special: when "HATE" rolls in, a tagLine SVG animates on top of it like
// a sticker crossing the word out, then fades before the next word rolls in.
//
// Followed immediately by a <hr className="koyko-divider" /> in the page layout
// to produce the horizontal rule seen in the Figma between this section and Contact.

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const ROLLING_WORDS = ['LOVE', 'COFFEE', 'OBSESSION', 'HATE'];
const DISPLAY_WORDS = [...ROLLING_WORDS, ROLLING_WORDS[0]]; // cloned first word for seamless loop
const ROLL_TIMING = {
  move:      1.2, // seconds for one vertical roll transition
  hold:      1.5, // seconds to keep each word visible
};

function KoykoDesigned() {
  const wordTrackRef = useRef(null);
  const taglineRef   = useRef(null); // ref for the SVG that covers "HATE"

  useEffect(() => {
    const track   = wordTrackRef.current;
    const tagline = taglineRef.current;
    if (!track || !tagline) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const STEP_PERCENT = 100 / DISPLAY_WORDS.length;

    gsap.set(track,   { yPercent: 0 });
    // Clip from right = fully hidden; animating to 0% reveals left → right like drawing
    gsap.set(tagline, { clipPath: 'inset(0 100% 0 0)' });

    const tl = gsap.timeline({ repeat: -1 });

    // Move upward one word at a time through the cloned first word.
    // On repeat, GSAP jumps to 0 while showing the same word, so the loop feels continuous.
    for (let i = 1; i < DISPLAY_WORDS.length; i += 1) {
      // Roll up to the next word
      tl.to(track, {
        yPercent: -STEP_PERCENT * i,
        duration: ROLL_TIMING.move,
        ease: 'power3.inOut',
      });

      // Hold on this word
      tl.to(track, {
        yPercent: -STEP_PERCENT * i,
        duration: ROLL_TIMING.hold,
        ease: 'none',
      });

      // When HATE is the visible word, draw the tagline SVG across it
      if (DISPLAY_WORDS[i] === 'HATE') {
        // Sweep the clip from right→left: reveals the SVG like a pen drawing across
        // '<' = starts at the same time the hold phase above starts
        tl.to(tagline, {
          clipPath: 'inset(0 0% 0 0)',
          duration: 0.8,
          ease: 'power2.inOut',
        }, '<');

        // No hide tween — tagline stays until the timeline loops back to the start,
        // at which point GSAP restores the initial clipPath: 'inset(0 100% 0 0)'
      }
    }

    return () => { tl.kill(); };
  }, []);

  return (
    <section className="koyko-designed" aria-label="Design philosophy">
      <h2 className="koyko-designed__heading">
        <span className="koyko-designed__lead">DESIGNED WITH</span>
        <span className="koyko-designed__word-viewport" aria-live="off">
          <span ref={wordTrackRef} className="koyko-designed__word-track">
            {DISPLAY_WORDS.map((word, idx) => (
              <span key={`${word}-${idx}`} className="koyko-designed__word">
                {word}
                {/* Only render the tagline overlay on the HATE word */}
                {word === 'HATE' && (
                  <img
                    ref={taglineRef}
                    src="/assets/images/tagLine.svg"
                    aria-hidden="true"
                    className="koyko-designed__tagline"
                  />
                )}
              </span>
            ))}
          </span>
        </span>
      </h2>
    </section>
  );
}

export default KoykoDesigned;
