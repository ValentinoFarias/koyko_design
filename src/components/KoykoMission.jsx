'use client';

// KoykoMission — brand-story section with a sticky lock + scroll-driven animation.
//
// SECTION SETUP
//   The <section> is 400vh tall. Inside is a position:sticky container that
//   locks the visible content to the top of the viewport while the user
//   scrolls through all 400vh — consuming scroll without moving the page.
//
// PHASE 1 — STICKY LOCK + WORD FADE-IN (0% → 33% of scroll progress)
//   As the user scrolls (while locked), a GSAP timeline tied to scroll
//   progress fades every word in, one by one in a random order.
//
// PHASE 2 — HIGHLIGHT WORDS TURN RED (33% → 55% of scroll progress)
//   Specific key words (Koyko, water, design, etc.) animate from white
//   to red, one by one, while the rest of the text stays white.
//
// PHASE 3 — PHYSICS CRUMBLE (fires at 85% of scroll progress)
//   Matter.js takes over: every word span is detached from normal flow,
//   placed at its exact screen position, and given a physics body.

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MISSION_BG } from '../assets/koykoAssets';

// Register the ScrollTrigger plugin once at module level.
gsap.registerPlugin(ScrollTrigger);

// ── Text content ──────────────────────────────────────────────────────────────
const PARAGRAPHS = [
  'Koyko is drawn from Mapudungun, the language of the Mapuche people, where it means water. Like water, the work here takes the shape of what it holds — adapting, flowing, always finding its truest form.',
  'Every project undertaken by Koyko Design begins with a single belief: that a website is not a template to be filled, but a space to be inhabited. Built for businesses, artists, creatives, and those who refuse to look like everyone else — each digital experience is crafted with precision, intention, and care.',
  'What Koyko Design offers — Bespoke web design and development. Tailored entirely to the individual. For creatives and small businesses who understand that a distinctive digital presence is not a luxury — it is a necessity.',
  'The aim — To bring the kind of craftsmanship once reserved for large budgets and agency teams to those who deserve it most. No middlemen. No inflated costs. Just considered, high-quality work delivered with personal attention.',
  'And the best part? Your website should belong to you — fully, unconditionally. Koyko Design delivers clean, custom code with no subscriptions, no recurring fees, no strings attached. Built for you. Yours to keep. Forever.',
];

// ── Words that will turn red in Phase 2 ─────────────────────────────────────
// Stored lowercase for case-insensitive matching. We also strip common
// punctuation (.,!?—) from each word before comparing so "water." matches "water".
const HIGHLIGHT_WORDS = new Set([
  'koyko', 'mapuche', 'water', 'design', 'precision', 'intention',
  'care', 'bespoke', 'luxury', 'craftsmanship', 'high-quality', 'forever',
]);

// Helper: strip trailing punctuation so "water." or "care." matches the set
function isHighlightWord(word) {
  const clean = word.replace(/[.,!?;:—"'()]/g, '').toLowerCase();
  return HIGHLIGHT_WORDS.has(clean);
}

// Pre-split at module level so ref indices stay stable across re-renders.
const WORD_GRID = PARAGRAPHS.map(p => p.split(' '));

// Starting index in the flat wordRefs array for each paragraph.
const PARA_OFFSETS = WORD_GRID.reduce((acc, _words, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + WORD_GRID[i - 1].length);
  return acc;
}, []);


function KoykoMission() {
  const sectionRef = useRef(null); // outer <section> — 400vh, positioning context
  const stickyRef  = useRef(null); // sticky container — 100vh, locked in view
  const wordRefs   = useRef([]);   // one ref slot per word span
  const rafRef     = useRef(null); // rAF handle for cleanup

  useEffect(() => {
    const section = sectionRef.current;
    const sticky  = stickyRef.current;
    const words   = wordRefs.current.filter(Boolean);
    if (!section || !sticky || !words.length) return;

    let cancelled    = false;
    let stopPhysics  = () => {};

    // ── Separate highlight words from plain words ───────────────────────────
    // data-highlight="true" was set in JSX on words that match HIGHLIGHT_WORDS
    const highlightEls = words.filter(el => el.dataset.highlight === 'true');
    const plainEls     = words.filter(el => el.dataset.highlight !== 'true');

    // ── Phase 1: scroll-scrubbed word fade-in (0% → 33%) ───────────────────
    // Words start invisible. GSAP timeline scrubbed to scroll so the user
    // literally scrolls the words into view.
    gsap.set(words, { opacity: 0 });

    const fadeIn = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start:   'top top',   // begins when the section locks into view
        end:     '33% top',   // fully revealed after 33% of the 400vh scroll range
        scrub:   1,           // ties playhead to scroll; lag=1s feels smooth
      },
    });

    fadeIn.to(words, {
      opacity:  1,
      duration: 1,
      stagger:  { amount: 1.5, from: 'random' }, // random order feels organic
      ease:     'none',
    });

    // ── Phase 2: highlight words turn red (33% → 55%) ───────────────────────
    // Only the highlight words animate. They go from white to red one by one
    // while the user keeps scrolling. Plain words stay white.
    const highlightTl = gsap.timeline({ paused: true });

    highlightTl.to(highlightEls, {
      color:    '#cc3311',      // vivid red
      duration: 0.4,
      stagger:  { amount: 0.8, from: 'start' }, // left-to-right, one by one
      ease:     'none',
    });

    const highlightTrigger = ScrollTrigger.create({
      trigger:   section,
      start:     '33% top',    // picks up exactly where Phase 1 ended
      end:       '55% top',    // ends after 55% of 400vh
      scrub:     true,         // ties the colour animation to scroll position
      animation: highlightTl,
    });

    // ── Phase 3: physics crumble (fires at 85% progress) ────────────────────
    // onUpdate + progress threshold works with sticky positioning — 'bottom X%'
    // doesn't fire until after the section leaves the viewport (too late).
    let physicsFired = false;
    let windFired    = false;

    // physicsRefs will hold { bodies, Body, ground, engine, World } once
    // Matter.js loads — the wind phase reads these to blow words away.
    let physicsRefs = null;

    const fallTrigger = ScrollTrigger.create({
      trigger: section,
      start:   'top top',
      end:     'bottom bottom',
      onUpdate(self) {
        // Phase 3: start the physics crumble at 85%
        if (self.progress >= 0.85 && !physicsFired) {
          physicsFired = true;
          runPhysics();
        }
        // Phase 4: blow words away with "wind" at 95%
        if (self.progress >= 0.95 && !windFired && physicsRefs) {
          windFired = true;
          blowAway(physicsRefs);
        }
      },
    });

    // ── Physics setup ─────────────────────────────────────────────────────────
    // Called once when the progress threshold is crossed. Dynamically imports
    // Matter.js to keep it out of the initial bundle and avoid SSR issues.
    // Only the HIGHLIGHT words get physics bodies — plain words stay in place.
    function runPhysics() {
      import('matter-js').then(({ Engine, Bodies, Body, World, Runner }) => {
        if (cancelled) return;

        // Engine with slightly stronger gravity than the default (1.0)
        const engine     = Engine.create();
        engine.gravity.y = 1.2;

        // Use the sticky container's dimensions — it's always 100vh tall and
        // aligned with the viewport, making it the correct coordinate space.
        const stickyW = sticky.offsetWidth;
        const stickyH = sticky.offsetHeight;

        // Static ground at the bottom of the sticky viewport.
        const ground = Bodies.rectangle(
          stickyW / 2,      // centre x
          stickyH - 60,     // just below the visible area
          stickyW * 2,      // wide enough to catch every word
          60,
          { isStatic: true, label: 'ground' }
        );
        World.add(engine.world, ground);

        // ── Snapshot ONLY highlight word positions BEFORE touching styles ──
        const sr = sticky.getBoundingClientRect();

        const snapshots = highlightEls.map(el => {
          const wr = el.getBoundingClientRect();
          return {
            el,
            left:   wr.left - sr.left,
            top:    wr.top  - sr.top,
            width:  wr.width,
            height: wr.height,
            cx:     wr.left - sr.left + wr.width  / 2,
            cy:     wr.top  - sr.top  + wr.height / 2,
          };
        });

        // ── Fade out plain (non-highlight) words ──────────────────────────
        // They disappear as the red words start falling, leaving only
        // the highlighted words visible at the bottom of the container.
        gsap.to(plainEls, {
          opacity:  0,
          duration: 0.8,
          stagger:  { amount: 0.4, from: 'random' },
          ease:     'power2.out',
        });

        // ── Detach highlight words in one pass ────────────────────────────
        // Plain words fade out — only red words fall.
        snapshots.forEach(({ el, left, top, width }) => {
          el.style.position = 'absolute';
          el.style.left     = `${left}px`;
          el.style.top      = `${top}px`;
          el.style.width    = `${width}px`;
          el.style.margin   = '0';
          el.style.zIndex   = '2';
        });

        // ── Create one rigid body per highlight word ─────────────────────
        const bodies = snapshots.map(({ el, cx, cy, width, height }) => {
          el.dataset.cx = cx;
          el.dataset.cy = cy;

          const body = Bodies.rectangle(cx, cy, width, height, {
            restitution: 0.25,
            friction:    0.4,
            frictionAir: 0.02,
          });

          body.domEl = el;
          World.add(engine.world, body);
          return body;
        });

        // ── Apply initial kick ─────────────────────────────────────────────
        bodies.forEach(body => {
          Body.applyForce(body, body.position, {
            x:  (Math.random() - 0.5) * 0.006,
            y: -(Math.random()        * 0.008),
          });
        });

        // ── Store references so the wind phase can access them later ─────
        physicsRefs = { bodies, Body, ground, engine, World };

        // ── Runner + rAF loop ──────────────────────────────────────────────
        const runner = Runner.create();
        Runner.run(runner, engine);

        const tick = () => {
          if (cancelled) return;

          bodies.forEach(body => {
            const el = body.domEl;
            const dx = body.position.x - parseFloat(el.dataset.cx);
            const dy = body.position.y - parseFloat(el.dataset.cy);

            el.style.setProperty('--x',      `${dx}px`);
            el.style.setProperty('--y',      `${dy}px`);
            el.style.setProperty('--rotate', `${body.angle}rad`);
          });

          rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);

        stopPhysics = () => {
          Runner.stop(runner);
          World.clear(engine.world, false);
          Engine.clear(engine);
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
      });
    }

    // ── Phase 4: "wind" blows the piled words off-screen ──────────────────────
    // Called at 95% scroll progress. Removes the ground so words aren't blocked,
    // then applies a strong horizontal force to each body — like a gust of wind
    // sweeping them to the right and slightly upward.
    function blowAway({ bodies, Body, ground, engine, World }) {
      // Remove the ground so words can fly freely off-screen
      World.remove(engine.world, ground);

      // Kill gravity so words don't fall — they should fly horizontally
      engine.gravity.y = 0;

      // Apply a powerful leftward "wind" force — blows everything off-screen
      bodies.forEach(body => {
        // Remove friction so nothing slows them down
        body.frictionAir = 0;
        body.friction    = 0;

        Body.applyForce(body, body.position, {
          x: -(0.25 + Math.random() * 0.05),    // very strong leftward blast
          y:  (Math.random() - 0.5) * 0.01,     // slight random vertical scatter
        });
      });
    }

    // ── Cleanup on unmount ────────────────────────────────────────────────────
    return () => {
      cancelled = true;
      fadeIn.kill();
      highlightTl.kill();
      highlightTrigger.kill();
      fallTrigger.kill();
      stopPhysics();
    };
  }, []);

  return (
    <section
      className="koyko-mission"
      id="mission"
      aria-label="Mission"
      ref={sectionRef}
    >
      {/* Tagline sits OUTSIDE the sticky container so it scrolls away
          normally before the body text locks into view. */}
      <p className="koyko-mission__tagline">
        WHERE YOUR HEART LIVES
      </p>

      <div className="koyko-mission__sticky" ref={stickyRef}>

        {/* Background texture inside the sticky container so it stays visible */}
        <div className="koyko-mission__bg-wrap" aria-hidden="true">
          <img src={MISSION_BG} alt="" className="koyko-mission__bg" />
        </div>

        <div className="koyko-mission__content">
          <div className="koyko-mission__body">
            {WORD_GRID.map((paraWords, pIdx) => (
              <p key={pIdx}>
                {paraWords.map((word, wIdx) => {
                  const i = PARA_OFFSETS[pIdx] + wIdx;
                  // Mark highlight words with a data attribute so GSAP
                  // can target them separately in Phase 2
                  const highlight = isHighlightWord(word);
                  return (
                    <span
                      key={wIdx}
                      ref={el => { wordRefs.current[i] = el; }}
                      className="koyko-mission__word"
                      data-highlight={highlight ? 'true' : undefined}
                    >
                      {word}{' '}
                    </span>
                  );
                })}
              </p>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

export default KoykoMission;
