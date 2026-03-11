'use client';

// KoykoMission — dark brand-story section with a three-phase scroll animation.
//
// How the animation works:
//
//   Phase 1 — Word fade-in (GSAP + ScrollTrigger)
//     When the section enters the viewport each word fades in with a random
//     stagger so they don't all appear at once.  Uses GSAP's ScrollTrigger
//     "onEnter" hook.
//
//   Phase 2 — Physics crumble (Matter.js)
//     When the user has scrolled past the section, every word is switched from
//     normal document flow to position:absolute (frozen at its current screen
//     location).  A Matter.js physics body is created for each word at that
//     exact position.  A small random upward force is applied to kick them
//     loose, then gravity pulls them down.  A ground body at the bottom of
//     the section catches them so they pile up and bounce.
//     Each animation frame the physics body's x/y/angle are written into CSS
//     custom properties (--x, --y, --rotate) which drive the word's transform.
//
// Libraries used:
//   gsap          — already in the project (controls fade-in timing)
//   ScrollTrigger — GSAP plugin bundled with gsap (scroll position detection)
//   matter-js     — installed separately (physics simulation)

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MISSION_BG } from '../assets/koykoAssets';

// Register the ScrollTrigger plugin once at module level.
// Must happen before any ScrollTrigger calls.
gsap.registerPlugin(ScrollTrigger);

// ── Text content ──────────────────────────────────────────────────────────────
// Stored as an array of strings so we can map over paragraphs and split each
// into individual word <span> elements at render time.
const PARAGRAPHS = [
  'Koyko is drawn from Mapudungun, the language of the Mapuche people, where it means water. Like water, the work here takes the shape of what it holds — adapting, flowing, always finding its truest form.',
  'Every project undertaken by Koyko Design begins with a single belief: that a website is not a template to be filled, but a space to be inhabited. Built for businesses, artists, creatives, and those who refuse to look like everyone else — each digital experience is crafted with precision, intention, and care.',
  'What Koyko Design offers — Bespoke web design and development. Tailored entirely to the individual. For creatives and small businesses who understand that a distinctive digital presence is not a luxury — it is a necessity.',
  'The aim — To bring the kind of craftsmanship once reserved for large budgets and agency teams to those who deserve it most. No middlemen. No inflated costs. Just considered, high-quality work delivered with personal attention.',
  'And the best part? Your website should belong to you — fully, unconditionally. Koyko Design delivers clean, custom code with no subscriptions, no recurring fees, no strings attached. Built for you. Yours to keep. Forever.',
];

// Pre-split once at module level so every React render produces the same
// structure and the wordRefs indices stay stable.
const WORD_GRID = PARAGRAPHS.map(p => p.split(' '));

// Pre-compute each paragraph's starting index in the flat wordRefs array.
// e.g. paragraph 0 starts at index 0, paragraph 1 at (words in para 0), etc.
const PARA_OFFSETS = WORD_GRID.reduce((acc, _words, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + WORD_GRID[i - 1].length);
  return acc;
}, []);


function KoykoMission() {
  const sectionRef = useRef(null); // the <section> element — positioning context
  const wordRefs   = useRef([]);   // flat array of every word <span>
  const rafRef     = useRef(null); // requestAnimationFrame handle (for cleanup)

  useEffect(() => {
    const section = sectionRef.current;
    // Filter out any null refs (React strict-mode guard)
    const words   = wordRefs.current.filter(Boolean);
    if (!section || !words.length) return;

    // Track whether the component has unmounted so async callbacks can bail out
    let cancelled = false;
    // Populated once Matter.js loads; called on unmount to stop the engine
    let stopPhysics = () => {};

    // ── Phase 1: word fade-in ─────────────────────────────────────────────────
    // All words start at opacity 0.  When the section enters the viewport,
    // GSAP fades each one in with a random stagger (0.8 s total spread).
    gsap.set(words, { opacity: 0 });

    const fadeIn = ScrollTrigger.create({
      trigger: section,
      start:   'top 30%', // fires when the section top is 75% down the viewport
      once:    true,       // don't reverse when scrolling back up
      onEnter() {
        gsap.to(words, {
          opacity:  1,
          duration: 1,
          // 'random' from means words don't fade in left-to-right — looks more alive
          stagger: { amount: 0.8, from: 'random' },
          ease:    'none',
        });
      },
    });

    // ── Phase 2: physics crumble ──────────────────────────────────────────────
    // Fires once the bottom of the section crosses 60% of the viewport height,
    // i.e. the user has largely scrolled past it.
    const fallTrigger = ScrollTrigger.create({
      trigger: section,
      start:   'bottom 60%',
      once:    true,
      onEnter() {
        // Dynamically import Matter.js — this keeps it out of the initial bundle
        // and avoids SSR issues (Matter.js needs window/document to exist).
        import('matter-js').then(({ Engine, Bodies, Body, World, Runner }) => {
          if (cancelled) return;

          // ── Set up the physics world ──────────────────────────────────────
          const engine       = Engine.create();
          engine.gravity.y   = 1.2;  // slightly stronger than default (1.0)

          const sectionW = section.offsetWidth;
          const sectionH = section.offsetHeight;

          // Static ground body at the bottom of the section.
          // Words will pile up here instead of falling off screen.
          const ground = Bodies.rectangle(
            sectionW / 2,       // centre x
            sectionH + 30,      // just below the visible section
            sectionW * 2,       // wide enough to catch everything
            60,                 // ground thickness
            { isStatic: true, label: 'ground' }
          );
          World.add(engine.world, ground);

          // ── Snapshot word positions before changing layout ────────────────
          // getBoundingClientRect() gives viewport-relative coordinates.
          // We subtract the section's rect to get section-relative coordinates,
          // which is what position:absolute uses since .koyko-mission is
          // position:relative.
          const sr = section.getBoundingClientRect();

          const snapshots = words.map(el => {
            const wr = el.getBoundingClientRect();
            return {
              el,
              left:   wr.left - sr.left,               // absolute left from section
              top:    wr.top  - sr.top,                // absolute top from section
              width:  wr.width,
              height: wr.height,
              // Physics body centre point
              cx:     wr.left - sr.left + wr.width  / 2,
              cy:     wr.top  - sr.top  + wr.height / 2,
            };
          });

          // ── Switch all words to absolute positioning simultaneously ────────
          // We must do this in one pass BEFORE any layout recalculates,
          // otherwise later words would measure incorrect positions because
          // earlier words already left normal flow and shifted the layout.
          snapshots.forEach(({ el, left, top, width }) => {
            el.style.position = 'absolute';
            el.style.left     = `${left}px`;
            el.style.top      = `${top}px`;
            el.style.width    = `${width}px`;
            el.style.margin   = '0';
            el.style.zIndex   = '2'; // keep words above the bg image
          });

          // Lock the section height so it doesn't collapse after words leave flow
          section.style.minHeight = `${sectionH}px`;

          // ── Create physics bodies ─────────────────────────────────────────
          const bodies = snapshots.map(({ el, cx, cy, width, height }) => {
            // Store the initial centre position so the RAF loop can compute
            // the displacement (delta from origin) for the CSS transform.
            el.dataset.cx = cx;
            el.dataset.cy = cy;

            const body = Bodies.rectangle(cx, cy, width, height, {
              restitution: 0.25,  // slight bounce on landing
              friction:    0.4,
              frictionAir: 0.02,  // small air resistance so they don't fly forever
            });

            // Attach the DOM element directly to the body for easy access
            // inside the RAF loop without needing a separate index lookup.
            body.domEl = el;

            World.add(engine.world, body);
            return body;
          });

          // ── Apply the initial kick ─────────────────────────────────────────
          // A tiny random force is applied to each body — small x for scatter,
          // small negative y (upward) so they briefly float before falling.
          bodies.forEach(body => {
            Body.applyForce(body, body.position, {
              x: (Math.random() - 0.5) * 0.006,
              y: -Math.random() * 0.008,
            });
          });

          // ── Start the physics runner ──────────────────────────────────────
          // Runner.run advances the engine ~60 times per second independently
          // of our RAF loop.  The RAF loop is only responsible for syncing
          // physics positions → CSS, not for stepping the engine.
          const runner = Runner.create();
          Runner.run(runner, engine);

          // ── RAF loop: physics → CSS ───────────────────────────────────────
          // Each frame we read each body's position and angle, compute the
          // displacement from its original location, and write that into
          // CSS custom properties.  The word's CSS transform (in style.css)
          // picks those up and moves the element accordingly.
          const tick = () => {
            if (cancelled) return;

            bodies.forEach(body => {
              const el = body.domEl;
              // dx / dy = how far the body has moved from where it started
              const dx = body.position.x - parseFloat(el.dataset.cx);
              const dy = body.position.y - parseFloat(el.dataset.cy);

              el.style.setProperty('--x',      `${dx}px`);
              el.style.setProperty('--y',      `${dy}px`);
              el.style.setProperty('--rotate', `${body.angle}rad`);
            });

            rafRef.current = requestAnimationFrame(tick);
          };

          rafRef.current = requestAnimationFrame(tick);

          // Save cleanup function for unmount
          stopPhysics = () => {
            Runner.stop(runner);
            World.clear(engine.world, false);
            Engine.clear(engine);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
          };
        });
      },
    });

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
        Background texture — wrapped in its own overflow:hidden div.
        We moved overflow:hidden off the section itself so that falling words
        aren't clipped at the section edges.
      */}
      <div className="koyko-mission__bg-wrap" aria-hidden="true">
        <img src={MISSION_BG} alt="" className="koyko-mission__bg" />
      </div>

      <div className="koyko-mission__content">
        {/* Centred tagline — not animated, sits above the body copy */}
        <p className="koyko-mission__tagline">
          Let&apos;s create the home of your work.
        </p>

        {/*
          Body copy — each word is its own <span> so GSAP and Matter.js can
          target individual words.  PARA_OFFSETS maps each paragraph's words to
          a unique index in the flat wordRefs array.
        */}
        <div className="koyko-mission__body">
          {WORD_GRID.map((paraWords, pIdx) => (
            <p key={pIdx}>
              {paraWords.map((word, wIdx) => {
                // Compute the flat index so each span gets the right ref slot
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
    </section>
  );
}

export default KoykoMission;
