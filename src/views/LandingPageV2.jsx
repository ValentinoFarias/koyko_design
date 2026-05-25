'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

// LandingPageV2 — four-stage v2 intro.
//
// Colour stages (each holds for STAGE_DURATION_MS before crossfading):
//   0 → paper-white figure on black background   (data-theme="negro")
//   1 → orange figure on cream background        (data-theme="blanco")
//   2 → black figure on orange background        (data-theme="naranjo")
//
// Once stage 2 lands, a rapid "word storm" overlays the page: 16 images
// from /assets/images/v2images/introWords appear one-by-one at random
// positions/rotations every WORD_INTERVAL_MS until the orange disappears
// under them.
//
// Click anywhere enters the site (/home-v2).

const STAGE_THEMES = ['negro', 'blanco', 'naranjo'];
const STAGE_DURATION_MS = 1000;

const SOURCE_COUNT = 16;                // distinct word images on disk (koyko1..koyko16)
const TOTAL_DROPS = 200;                 // how many instances to drop in total before stopping
const WORD_START_INTERVAL_MS = 800;     // gap before drop #2 (very slow first beat)
const WORD_DECAY_PER_STEP = 0.8;       // each gap = previous gap × this (smaller = faster acceleration)
const WORD_STORM_DELAY_MS = 1000;       // pause after stage 2 lands before drop #1 lands

// Exponential decay: each interval is WORD_DECAY_PER_STEP times the
// previous one. Storm starts at WORD_START_INTERVAL_MS and shrinks
// multiplicatively for every subsequent drop.
//
// `dropsSoFar` is the count *after* the current tick increments — i.e. the
// interval returned is the gap BEFORE that drop lands. Ticks pass values
// 2..TOTAL_DROPS; we use (dropsSoFar - 2) as the step index (0 at first gap).
function intervalForDrop(dropsSoFar) {
  const step = dropsSoFar - 2;                              // 0 at the first gap
  return WORD_START_INTERVAL_MS * Math.pow(WORD_DECAY_PER_STEP, step);
}

// Sum the actual interval each drop will wait — used purely for the
// dev-console readout so you can see the resulting total duration and
// the final gap that comes out of the decay.
const WORD_STORM_TOTAL_MS = Array.from(
  { length: TOTAL_DROPS - 1 },
  (_, i) => intervalForDrop(i + 2)
).reduce((sum, ms) => sum + ms, 0);
const WORD_END_INTERVAL_DERIVED = intervalForDrop(TOTAL_DROPS);

if (typeof window !== 'undefined') {
  // eslint-disable-next-line no-console
  console.log(
    `[LandingPageV2] word storm: ${TOTAL_DROPS} drops, ` +
    `${WORD_START_INTERVAL_MS}ms ×${WORD_DECAY_PER_STEP}/step → ` +
    `${WORD_END_INTERVAL_DERIVED.toFixed(1)}ms, ` +
    `total ${Math.round(WORD_STORM_TOTAL_MS)}ms ` +
    `(${(WORD_STORM_TOTAL_MS / 1000).toFixed(2)}s)`
  );
}

// One word instance — random position, rotation, scale; src cycles
// through the 16 source files so the page fills with repeats.
function buildWordInstance(i) {
  return {
    src:   `/assets/images/v2images/introWords/koyko${(i % SOURCE_COUNT) + 1}.webp`,
    top:   `${Math.random() * 90 + 5}%`,   // 5%–95%
    left:  `${Math.random() * 90 + 5}%`,
    rot:   `${Math.random() * 50 - 25}deg`,
    scale: 0.7 + Math.random() * 0.7,      // 0.7..1.4
  };
}

export default function LandingPageV2() {
  const [stage, setStage] = useState(0);
  // Word instances that have been "dropped" so far. Grows by one per
  // interval tick until it reaches TOTAL_DROPS.
  const [drops, setDrops] = useState([]);
  // Goes true once the last drop has landed — triggers the white
  // FullLogo reveal on top of the now-black, word-covered page.
  const [stormDone, setStormDone] = useState(false);

  // Drop counter held in a ref so the tick scheduler can read/increment
  // it deterministically — outside of the setState updater. Putting side
  // effects (timer scheduling) inside a setState updater caused React's
  // Strict Mode to run them twice, spawning parallel timer chains and
  // making drops bunch up.
  const dropCountRef = useRef(0);

  useEffect(() => {
    // Advance through colour stages until we hit the last one.
    if (stage < STAGE_THEMES.length - 1) {
      const id = setTimeout(() => setStage((s) => s + 1), STAGE_DURATION_MS);
      return () => clearTimeout(id);
    }

    // Last stage — keep dropping word instances until TOTAL_DROPS is hit.
    // Each new drop cycles through the SOURCE_COUNT word images and gets
    // a fresh random position, rotation, and scale; overlaps are what
    // gradually turn the page black.
    //
    // Effect depends only on `stage` so the recursive timer is set up
    // exactly once. The tick uses dropCountRef (NOT a state updater) to
    // schedule the next timeout, avoiding Strict Mode's double-invocation
    // of state updaters which would otherwise create duplicate timers.
    let timeoutId;
    const tick = () => {
      if (dropCountRef.current >= TOTAL_DROPS) return;
      const i = dropCountRef.current;
      dropCountRef.current = i + 1;
      // Pure updater — no side effects inside.
      setDrops((prev) => [...prev, buildWordInstance(i)]);
      // Schedule the next drop using the ref counter (now i+1).
      if (dropCountRef.current < TOTAL_DROPS) {
        timeoutId = setTimeout(tick, intervalForDrop(dropCountRef.current));
      } else {
        // Storm just finished — reveal the white FullLogo on top.
        setStormDone(true);
      }
    };

    // Hold on the black-figure/orange-bg frame for a beat, then start
    // the storm.
    const startId = setTimeout(tick, WORD_STORM_DELAY_MS);

    return () => {
      clearTimeout(startId);
      if (timeoutId) clearTimeout(timeoutId);
      // Reset for Strict Mode dev re-mount — otherwise the counter
      // would carry over and skip drops on the second pass.
      dropCountRef.current = 0;
      setDrops([]);
      setStormDone(false);
    };
  }, [stage]);

  return (
    <div
      className="home-v2 v2-landing"
      data-theme={STAGE_THEMES[stage]}
      data-stage={stage}
    >
      {/* Whole screen is a link so clicking anywhere enters the site */}
      <Link href="/home-v2" className="v2-landing__enter" aria-label="Enter site">
        {/* Logo is rendered via mask + background-color so we can crossfade
            between paper, orange, and ink purely through CSS tokens. */}
        <span className="v2-landing__logo" aria-hidden="true" />

        {/* Word-storm overlay — empty until stage 2 begins. Each entry
            in `drops` represents one dropped instance with its own
            random position; they all render with .is-on so they fade
            in as soon as they're added. */}
        <div className="v2-landing__words" aria-hidden="true">
          {drops.map((w, i) => (
            <img
              key={i}
              className="v2-landing__word is-on"
              src={w.src}
              alt=""
              style={{
                top:   w.top,
                left:  w.left,
                /* Custom props read by the resting transform */
                '--rot':   w.rot,
                '--scale': w.scale,
              }}
            />
          ))}
        </div>

        {/* Final reveal — white FullLogo on top of the black, word-covered
            page. Rendered always (so the fade-in transition lands); the
            .is-on class controls visibility. */}
        <img
          className={`v2-landing__full-logo${stormDone ? ' is-on' : ''}`}
          src="/assets/images/v2images/FullLogo.svg"
          alt="Koyko"
          aria-hidden={!stormDone}
        />
      </Link>
    </div>
  );
}
