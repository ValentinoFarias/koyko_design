'use client';

// =============================================================================
// KoykoMissionV2.jsx — v2-styled re-skin of KoykoMission
// =============================================================================
// Behaviour-identical port of /src/components/KoykoMission.jsx, with:
//   - All CSS classes renamed v2-mission* (styled in home-v2.css)
//   - Highlight color changed from green (#79FF4F) to brand orange (#EB5120)
//   - Background image dropped — the v2 paper-grain shows through
//
// All animation logic stays the same:
//   Phase 1 (0% → 33%)  — words fade in one by one
//   Phase 2 (33% → 55%) — highlight words change color to brand orange
//   Phase 3 (85%)       — highlight words detach + fall (Matter.js physics)
//   Phase 4 (97%)       — wind blast sends them off-screen
// =============================================================================

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Brand orange highlight — kept as a hex so it stays orange on every theme
// (under naranjo, var(--v2-accent) flips to black, which we don't want here).
const HIGHLIGHT_COLOR = '#EB5120';

// Editorial copy. Identical paragraphs to KoykoMission.
const PARAGRAPHS = [
  'Koyko is drawn from Mapudungun, the language of the Mapuche people, where it means water. Like water, the work here takes the shape of what it holds — adapting, flowing, always finding its truest form.',
  'Every project undertaken by Koyko Design begins with a single belief: that a website is not a template to be filled, but a space to be inhabited. Built for businesses, artists, creatives, and those who refuse to look like everyone else — each digital experience is crafted with precision, intention, and care.',
  'What Koyko Design offers — Bespoke web design and development. Tailored entirely to the individual. For creatives and small businesses who understand that a distinctive digital presence is not a luxury — it is a necessity.',
  'The aim — To bring the kind of craftsmanship once reserved for large budgets and agency teams to those who deserve it most. No middlemen. No inflated costs. Just considered, high-quality work delivered with personal attention.',
  'And the best part? Your website should belong to you — fully, unconditionally. Koyko Design delivers clean, custom code with no subscriptions, no recurring fees, no strings attached. Built for you. Yours to keep. Forever.',
];

// Words that turn orange in Phase 2 — case-insensitive, punctuation-stripped.
const HIGHLIGHT_WORDS = new Set([
  'koyko', 'mapuche', 'water', 'design', 'precision', 'intention',
  'care', 'bespoke', 'luxury', 'craftsmanship', 'high-quality', 'forever',
]);

function isHighlightWord(word) {
  const clean = word.replace(/[.,!?;:—"'()]/g, '').toLowerCase();
  return HIGHLIGHT_WORDS.has(clean);
}

// Pre-split paragraphs into words + a flat-index offset table so each word's
// ref slot is stable across renders.
const WORD_GRID = PARAGRAPHS.map((p) => p.split(' '));
const PARA_OFFSETS = WORD_GRID.reduce((acc, _words, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + WORD_GRID[i - 1].length);
  return acc;
}, []);

export default function KoykoMissionV2() {
  const sectionRef = useRef(null);
  const stickyRef  = useRef(null);
  const wordRefs   = useRef([]);
  const rafRef     = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const sticky  = stickyRef.current;
    const words   = wordRefs.current.filter(Boolean);
    if (!section || !sticky || !words.length) return;

    // ── Closure-local flags / mutable state ────────────────────────────────
    let cancelled     = false;
    let stopPhysics   = () => {};        // replaced once Matter.js boots
    let physicsRefs   = null;
    let physicsBootId = 0;

    // Split into highlight vs plain word groups for targeted animation.
    const highlightEls = words.filter((el) => el.dataset.highlight === 'true');
    const plainEls     = words.filter((el) => el.dataset.highlight !== 'true');

    function revealPlainWords() {
      gsap.killTweensOf(plainEls);
      gsap.to(plainEls, {
        opacity: 1,
        duration: 0.45,
        stagger: { amount: 0.2, from: 'random' },
        overwrite: 'auto',
        ease: 'power2.out',
      });
    }

    function normalizeMissionText() {
      gsap.killTweensOf(highlightEls);
      gsap.set(highlightEls, { clearProps: 'transform' });
      restoreHighlightFlow();
      revealPlainWords();
    }

    function restoreHighlightFlow() {
      highlightEls.forEach((el) => {
        el.style.position = '';
        el.style.left     = '';
        el.style.top      = '';
        el.style.width    = '';
        el.style.margin   = '';
        el.style.zIndex   = '';
        el.style.removeProperty('--x');
        el.style.removeProperty('--y');
        el.style.removeProperty('--rotate');
        el.removeAttribute('data-cx');
        el.removeAttribute('data-cy');
      });
    }

    function teardownPhysics() {
      stopPhysics();
      stopPhysics = () => {};
      physicsRefs = null;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }

    // ── PHASE 1 — scroll-scrubbed fade-in (0% → 33%) ───────────────────────
    gsap.set(words, { opacity: 0 });
    const fadeIn = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '33% top',
        scrub: 1,
      },
    });
    fadeIn.to(words, {
      opacity: 1,
      duration: 1,
      stagger: { amount: 1.5, from: 'random' },
      ease: 'none',
    });

    // ── PHASE 2 — highlight words turn orange (33% → 55%) ──────────────────
    const highlightTl = gsap.timeline({ paused: true });
    highlightTl.to(highlightEls, {
      color: HIGHLIGHT_COLOR,
      duration: 0.4,
      stagger: 0,
      ease: 'none',
    });
    const highlightTrigger = ScrollTrigger.create({
      trigger: section,
      start: '33% top',
      end: '55% top',
      scrub: true,
      animation: highlightTl,
    });

    // ── PHASES 3 & 4 — physics crumble + wind blast (driven by onUpdate) ───
    let physicsFired = false;
    let windFired    = false;

    const fallTrigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate(self) {
        // Scrolled back up after wind — fly highlight words back in from left
        if (self.direction === -1 && self.progress < 0.95 && windFired) {
          physicsBootId += 1;
          teardownPhysics();
          normalizeMissionText();

          const leftSpawn = -Math.max(sticky.offsetWidth * 0.85, 520);
          gsap.killTweensOf(highlightEls);
          gsap.fromTo(
            highlightEls,
            {
              x: () => leftSpawn - Math.random() * 180,
              y: () => (Math.random() - 0.5) * 22,
              rotate: () => gsap.utils.random(-12, 12),
            },
            {
              x: 0,
              y: 0,
              rotate: 0,
              duration: 0.95,
              stagger: { amount: 0.45, from: 'start' },
              overwrite: 'auto',
              clearProps: 'transform',
              ease: 'power3.out',
            }
          );

          windFired = false;
          physicsFired = false;
          return;
        }

        // Scrolled back up before wind but after physics — stop physics
        if (self.direction === -1 && self.progress < 0.85 && physicsFired) {
          physicsBootId += 1;
          teardownPhysics();
          normalizeMissionText();
          windFired = false;
          physicsFired = false;
          return;
        }

        // Scrolled down past 85% — start physics
        if (self.direction === 1 && self.progress >= 0.85 && !physicsFired) {
          physicsFired = true;
          runPhysics();
        }

        // Scrolled down past 97% — blast words away
        if (self.direction === 1 && self.progress >= 0.97 && !windFired && physicsRefs) {
          windFired = true;
          blowAway(physicsRefs);
        }
      },
    });

    // ── runPhysics — boots Matter.js (lazy-loaded) ─────────────────────────
    function runPhysics() {
      const bootId = ++physicsBootId;

      import('matter-js').then(({ Engine, Bodies, Body, World, Runner }) => {
        if (cancelled || !physicsFired || bootId !== physicsBootId) return;

        const engine     = Engine.create();
        engine.gravity.y = 1.2;

        const stickyW = sticky.offsetWidth;
        const stickyH = sticky.offsetHeight;

        // Invisible static ground at the bottom of the sticky container
        const ground = Bodies.rectangle(
          stickyW / 2,
          stickyH - 60,
          stickyW * 2,
          60,
          { isStatic: true, label: 'ground' }
        );
        World.add(engine.world, ground);

        // Snapshot positions BEFORE we shift words to position:absolute
        const sr = sticky.getBoundingClientRect();
        const snapshots = highlightEls.map((el) => {
          const wr = el.getBoundingClientRect();
          return {
            el,
            left: wr.left - sr.left,
            top:  wr.top  - sr.top,
            width:  wr.width,
            height: wr.height,
            cx: wr.left - sr.left + wr.width  / 2,
            cy: wr.top  - sr.top  + wr.height / 2,
          };
        });

        // Fade plain words out so the falling highlights are the focus
        gsap.killTweensOf(plainEls);
        gsap.to(plainEls, {
          opacity: 0,
          duration: 0.8,
          stagger: { amount: 0.4, from: 'random' },
          overwrite: 'auto',
          ease: 'power2.out',
        });

        gsap.killTweensOf(highlightEls);
        gsap.set(highlightEls, { clearProps: 'transform' });

        // Detach highlight words from text flow
        snapshots.forEach(({ el, left, top, width }) => {
          el.style.position = 'absolute';
          el.style.left     = `${left}px`;
          el.style.top      = `${top}px`;
          el.style.width    = `${width}px`;
          el.style.margin   = '0';
          el.style.zIndex   = '2';
        });

        // One physics body per highlight word
        const bodies = snapshots.map(({ el, cx, cy, width, height }) => {
          el.dataset.cx = cx;
          el.dataset.cy = cy;

          const body = Bodies.rectangle(cx, cy, width, height, {
            restitution: 0.25,
            friction: 0.4,
            frictionAir: 0.02,
          });
          body.domEl = el;
          World.add(engine.world, body);
          return body;
        });

        // Initial random kick so words scatter
        bodies.forEach((body) => {
          Body.applyForce(body, body.position, {
            x:  (Math.random() - 0.5) * 0.006,
            y: -(Math.random()        * 0.008),
          });
        });

        physicsRefs = { bodies, Body, ground, engine, World };

        const runner = Runner.create();
        Runner.run(runner, engine);

        // rAF loop — mirror physics positions to DOM via CSS custom props
        const tick = () => {
          if (cancelled) return;
          bodies.forEach((body) => {
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
          if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
          }
        };
      });
    }

    // ── blowAway — Phase 4 wind blast ──────────────────────────────────────
    function blowAway({ bodies, Body, ground, engine, World }) {
      World.remove(engine.world, ground);
      engine.gravity.y = 0;
      bodies.forEach((body) => {
        body.frictionAir = 0;
        body.friction = 0;
        Body.applyForce(body, body.position, {
          x: -(0.25 + Math.random() * 0.05),
          y:  (Math.random() - 0.5) * 0.01,
        });
      });
    }

    return () => {
      cancelled = true;
      fadeIn.kill();
      highlightTl.kill();
      highlightTrigger.kill();
      fallTrigger.kill();
      teardownPhysics();
    };
  }, []);

  return (
    <section
      className="v2-mission"
      id="mission"
      aria-label="Mission"
      ref={sectionRef}
    >
      {/* Tagline outside the sticky — scrolls away before the body locks in */}
      <p className="v2-mission__tagline">A WEBSITE IS A PLACE</p>

      <div className="v2-mission__sticky" ref={stickyRef}>
        <div className="v2-mission__content">
          <div className="v2-mission__body">
            {WORD_GRID.map((paraWords, pIdx) => (
              <p key={pIdx}>
                {paraWords.map((word, wIdx) => {
                  const i = PARA_OFFSETS[pIdx] + wIdx;
                  const highlight = isHighlightWord(word);
                  return (
                    <span
                      key={wIdx}
                      ref={(el) => { wordRefs.current[i] = el; }}
                      className="v2-mission__word"
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
