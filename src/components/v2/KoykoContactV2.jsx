'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger once at module level
gsap.registerPlugin(ScrollTrigger);

// The claim, split visually into two lines. Each line is split into words
// (by whitespace) and each word is wrapped in a clip+inner pair so GSAP can
// animate a bottom-to-top "curtain reveal" — words slide up into view from
// behind a clipped overflow.
const LINES = ['READY TO TALK ABOUT', 'YOUR PROJECT?'];

// Words we want italicized + accented (e.g. "YOUR"). Compared in uppercase
// for safety, since the source text is already uppercase.
const ACCENT_WORDS = new Set(['YOUR']);

export default function KoykoContactV2() {
  const claimRef = useRef(null);

  useEffect(() => {
    if (!claimRef.current) return;

    // Grab every inner word span — these are what slide upward
    const words = claimRef.current.querySelectorAll('.v2-contact__word-inner');

    // Start state: each word pushed fully below its clip window
    gsap.set(words, { yPercent: 100 });

    // Animate words upward, staggered, when the heading scrolls to 80% of viewport
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: claimRef.current,
        start: 'top 80%',
        once: true,           // fire once; no reverse on scroll up
      },
    });
    tl.to(words, {
      yPercent: 0,
      duration: 0.6,
      ease: 'power3.out',
      stagger: 0.08,          // 80ms gap between each word
    });

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  return (
    <section className="v2-contact" id="contact">
      {/* Small label above the big claim */}
      <span className="v2-contact__kicker">{'{ contact }'}</span>

      {/* Curtain-reveal heading — each word inside a clip wrapper */}
      <h2 ref={claimRef} className="v2-contact__claim">
        {LINES.map((line, lineIdx) => (
          /* Each line is its own block so it stays on one row.
             white-space: nowrap (in CSS) prevents the words inside from
             wrapping when the headline is wide. */
          <span key={lineIdx} className="v2-contact__line-wrap">
            {line.split(' ').map((word, wordIdx) => {
              const isAccent = ACCENT_WORDS.has(word);
              return (
                <span
                  key={wordIdx}
                  /* Italic words get a modifier so CSS can add extra
                     right padding — the italic slant otherwise pokes
                     past the clip wrapper and gets trimmed. */
                  className={`v2-contact__word-clip${isAccent ? ' v2-contact__word-clip--italic' : ''}`}
                >
                  <span className="v2-contact__word-inner">
                    {isAccent ? <em>{word}</em> : word}
                  </span>
                </span>
              );
            })}
          </span>
        ))}
      </h2>

      {/* CTA row: X-ring on the left, hint-arrow image revealed on hover */}
      <div className="v2-contact__row">
        <a
          className="v2-xring"
          href="mailto:hello@koykodesign.com"
          aria-label="Email hello@koykodesign.com"
        >
          <span className="v2-xring__x">X</span>
          <svg className="v2-xring__orbit" viewBox="0 0 220 220" aria-hidden="true">
            <defs>
              {/* Circular path the text follows, centered on the 220x220 viewBox. */}
              <path
                id="v2-xring-orbit"
                d="M 110,110 m -94,0 a 94,94 0 1,1 188,0 a 94,94 0 1,1 -188,0"
              />
            </defs>
            <text fontFamily="Syne" fontWeight="700" fontSize="14" letterSpacing="6">
              <textPath href="#v2-xring-orbit">
                SEND&nbsp;·&nbsp;EMAIL&nbsp;·&nbsp;START&nbsp;PROJECT&nbsp;·&nbsp;SAY&nbsp;HOLA&nbsp;·&nbsp;
              </textPath>
            </text>
          </svg>
        </a>
        {/* Arrow image — hidden by default, fades in when the X-ring is hovered */}
        <img
          src="/assets/images/arrowContact.png"
          alt=""
          aria-hidden="true"
          className="v2-contact__arrow"
        />
      </div>
    </section>
  );
}
