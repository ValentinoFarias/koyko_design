'use client';

// KoykoMission — brand-story section with a sticky lock + scroll-driven animation.
//
// SECTION SETUP
//   The <section> is 300vh tall. Inside is a position:sticky container that
//   locks the visible content to the top of the viewport while the user
//   scrolls through all 300vh — consuming scroll without moving the page.
//
// PHASE 1 — STICKY LOCK + WORD FADE-IN (scroll-scrubbed)
//   As the user scrolls (while locked), a GSAP timeline tied to scroll
//   progress fades every word in, one by one in a random order.
//   scrub: 1 means the user's scroll speed controls how fast words appear.
//
// PHASE 2 — PHYSICS CRUMBLE (fires at 85 % of scroll progress)
//   Matter.js takes over: every word span is detached from normal flow,
//   placed at its exact screen position, and given a physics body.
//   A small random force kicks each word loose; gravity pulls them down
//   onto a static ground at the bottom of the sticky viewport.
//   A requestAnimationFrame loop writes each body's position + angle into
//   CSS custom properties (--x, --y, --rotate) that drive the span's transform.

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

// Pre-split at module level so ref indices stay stable across re-renders.
const WORD_GRID = PARAGRAPHS.map(p => p.split(' '));

// Starting index in the flat wordRefs array for each paragraph.
const PARA_OFFSETS = WORD_GRID.reduce((acc, _words, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + WORD_GRID[i - 1].length);
  return acc;
}, []);


function KoykoMission() {
  const sectionRef = useRef(null); // outer <section> — 300vh, positioning context
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

    // ── Phase 1: scroll-scrubbed word fade-in ─────────────────────────────────
    // Words start invisible. A GSAP timeline is scrubbed to scroll position so
    // the user literally scrolls the words into view — slower scroll = slower reveal.
    gsap.set(words, { opacity: 0 });

    const fadeIn = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start:   'top top',  // begins the moment the section locks into view
        end:     '+=100%',   // fully revealed after 1 viewport-height of scrolling
        scrub:   1,          // ties playhead to scroll; lag=1s makes it feel smooth
      },
    });

    fadeIn.to(words, {
      opacity:  1,
      duration: 1,
      stagger:  { amount: 1.5, from: 'random' }, // random order feels more organic
      ease:     'none',
    });

    // ── Phase 2: physics crumble ──────────────────────────────────────────────
    // We use onUpdate + a progress threshold instead of 'bottom X%' because
    // with sticky positioning, 'bottom X%' fires only after the section has
    // already left the viewport — too late. Progress 0.85 = 85% through the
    // section's ~200vh scroll range, while the content is still fully in view.
    let physicsFired = false;

    const fallTrigger = ScrollTrigger.create({
      trigger: section,
      start:   'top top',
      end:     'bottom bottom',
      onUpdate(self) {
        if (self.progress >= 0.85 && !physicsFired) {
          physicsFired = true;
          runPhysics();
        }
      },
    });

    // ── Physics setup ─────────────────────────────────────────────────────────
    // Called once when the progress threshold is crossed. Dynamically imports
    // Matter.js to keep it out of the initial bundle and avoid SSR issues.
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
        // Words pile up here rather than falling off-screen.
        const ground = Bodies.rectangle(
          stickyW / 2,      // centre x
          stickyH + 30,     // just below the visible area
          stickyW * 2,      // wide enough to catch every word
          60,
          { isStatic: true, label: 'ground' }
        );
        World.add(engine.world, ground);

        // ── Snapshot all word positions BEFORE touching any styles ─────────
        // We measure relative to the sticky container. position:sticky makes
        // it a positioning context, so position:absolute children are placed
        // relative to it — matching these measurements exactly.
        const sr = sticky.getBoundingClientRect(); // top:0, left:0 while locked

        const snapshots = words.map(el => {
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

        // ── Detach all words in one pass ───────────────────────────────────
        // Done after all measurements to prevent earlier detaches from
        // reflowing the layout and corrupting later measurements.
        snapshots.forEach(({ el, left, top, width }) => {
          el.style.position = 'absolute';
          el.style.left     = `${left}px`;
          el.style.top      = `${top}px`;
          el.style.width    = `${width}px`;
          el.style.margin   = '0';
          el.style.zIndex   = '2';
        });

        // ── Create one rigid body per word ────────────────────────────────
        const bodies = snapshots.map(({ el, cx, cy, width, height }) => {
          // Store initial centre so the rAF loop can compute displacement
          el.dataset.cx = cx;
          el.dataset.cy = cy;

          const body = Bodies.rectangle(cx, cy, width, height, {
            restitution: 0.25,  // slight bounce on landing
            friction:    0.4,
            frictionAir: 0.02,  // air resistance keeps motion natural
          });

          body.domEl = el; // attach DOM element for easy rAF loop access
          World.add(engine.world, body);
          return body;
        });

        // ── Apply initial kick ─────────────────────────────────────────────
        // Small random force so each word takes a unique path.
        bodies.forEach(body => {
          Body.applyForce(body, body.position, {
            x:  (Math.random() - 0.5) * 0.006,
            y: -(Math.random()        * 0.008), // upward nudge
          });
        });

        // ── Runner + rAF loop ──────────────────────────────────────────────
        // Runner steps the engine at ~60fps. The rAF loop only reads positions
        // and writes them to CSS — it does not step the engine itself.
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

    // ── Cleanup on unmount ────────────────────────────────────────────────────
    return () => {
      cancelled = true;
      fadeIn.kill();
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
      {/*
        The sticky container locks all visible content to the viewport top
        while the user scrolls through the section's 300vh of height.
        position:sticky also makes it a positioning context, so the physics
        phase can use position:absolute on words relative to this element.
      */}
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
                  return (
                    <span
                      key={wIdx}
                      ref={el => { wordRefs.current[i] = el; }}
                      className="koyko-mission__word"
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
