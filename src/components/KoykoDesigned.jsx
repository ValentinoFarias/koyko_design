'use client';

// KoykoDesigned — "DESIGNED WITH LOVE" editorial heading section
//
// A simple full-width section with a single large heading.
// Font: Noto Sans JP weight 800 (maps to Hiragino Kaku Gothic Std W8 in Figma).
// Size: fluid 3rem → 6rem via clamp() in CSS.
//
// Followed immediately by a <hr className="koyko-divider" /> in the page layout
// to produce the horizontal rule seen in the Figma between this section and Contact.

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const ROLLING_WORDS = ['LOVE', 'COFFEE', 'OBSETION', 'HATE'];
const DISPLAY_WORDS = [...ROLLING_WORDS, ROLLING_WORDS[0]]; // cloned first word for seamless loop
const ROLL_TIMING = {
  move:      1.2, // seconds for one vertical roll transition
  hold:      1.5, // seconds to keep each word visible
};

function KoykoDesigned() {
  const wordTrackRef = useRef(null);

  useEffect(() => {
    const track = wordTrackRef.current;
    if (!track) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const STEP_PERCENT = 100 / DISPLAY_WORDS.length;

    const tl = gsap.timeline({
      repeat: -1,
      repeatDelay: 0,
    });

    gsap.set(track, { yPercent: 0 });

    // Move upward one word at a time through the cloned first word.
    // On repeat, GSAP jumps to 0 while showing the same word, so the loop feels continuous.
    for (let i = 1; i < DISPLAY_WORDS.length; i += 1) {
      tl.to(track, {
        yPercent: -STEP_PERCENT * i,
        duration: ROLL_TIMING.move,
        ease: 'power3.inOut',
      }).to(track, {
        yPercent: -STEP_PERCENT * i,
        duration: ROLL_TIMING.hold,
        ease: 'none',
      });
    }

    return () => {
      tl.kill();
    };
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
              </span>
            ))}
          </span>
        </span>
      </h2>
    </section>
  );
}

export default KoykoDesigned;
