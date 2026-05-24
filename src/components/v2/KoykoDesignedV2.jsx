'use client';

import { useEffect, useState } from 'react';

// Words that rotate inside "DESIGNED WITH ___"
const WORDS = ['COFFEE', 'OBSESSION', 'HATE', 'LOVE'];

// How long each word stays on screen before the next slides in (ms)
const INTERVAL = 2400;

export default function KoykoDesignedV2() {
  // Index of the currently visible word
  const [active, setActive] = useState(0);
  // Index of the outgoing word — slides up and out while `active` slides in.
  // null when no transition is in flight.
  const [outgoing, setOutgoing] = useState(null);

  useEffect(() => {
    // Tick every INTERVAL ms: mark the current word as outgoing, advance the index.
    const id = setInterval(() => {
      setActive((prev) => {
        setOutgoing(prev);
        // Clear the outgoing slot after the CSS transition completes
        // so the slot doesn't keep an `is-out` word lying around.
        setTimeout(() => setOutgoing(null), 700);
        return (prev + 1) % WORDS.length;
      });
    }, INTERVAL);

    return () => clearInterval(id);
  }, []);

  return (
    <section className="v2-designed" aria-label="Designed with">
      <h2 className="v2-designed__line">
        <span className="v2-designed__head">DESIGNED&nbsp;WITH</span>
        <span className="v2-designed__rot" aria-live="polite">
          {WORDS.map((word, i) => {
            // Each word is absolute-positioned in the same slot; class drives
            // whether it sits in place (is-on), slides up out (is-out), or
            // waits below (default — translateY(100%), opacity 0).
            let state = '';
            if (i === active)        state = ' is-on';
            else if (i === outgoing) state = ' is-out';
            return (
              <i
                key={word}
                className={`v2-designed__word${state}`}
                /* data-word lets CSS apply per-word treatments — e.g. the
                   tagLine sticker that crosses out HATE. */
                data-word={word}
              >
                {word}
                {/* On HATE, overlay the tagLine.svg "sticker". It reveals
                    left→right (via clip-path animation) when the word
                    becomes active, like a pen drawing across. */}
                {word === 'HATE' && (
                  <img
                    src="/assets/images/tagLine.svg"
                    alt=""
                    aria-hidden="true"
                    className="v2-designed__tagline"
                  />
                )}
              </i>
            );
          })}
        </span>
      </h2>
      <p className="v2-designed__sub">
        — a one-person studio. hand-coded, hand-drawn, hand-shaken.
      </p>
    </section>
  );
}
