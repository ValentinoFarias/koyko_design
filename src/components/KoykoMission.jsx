'use client';

// =============================================================================
// KoykoMission.jsx
// =============================================================================
// This component renders the brand-story section of the Koyko site.
// It uses THREE external libraries working together:
//
//   1. GSAP (GreenSock Animation Platform) — the animation engine.
//      It lets us animate CSS properties (opacity, color, position) with
//      fine-grained control over timing, easing, and sequencing.
//
//   2. GSAP ScrollTrigger — a GSAP plugin that ties animations to the
//      user's scroll position instead of playing them automatically on load.
//      Think of it as: "when the user scrolls to X%, do Y".
//
//   3. Matter.js — a 2D physics engine. It simulates gravity, collisions,
//      and forces. We use it to make individual word <span>s fall and
//      bounce like real objects.
//
// HOW THE LAYOUT WORKS — THE "TALL SECTION + STICKY CONTAINER" TRICK
// -------------------------------------------------------------------
// The outer <section> is 400vh tall (4× the screen height). Most of that
// space is invisible — it just gives us "scroll room" to work with.
//
// Inside is a `position: sticky` div that is only 100vh tall. Sticky
// positioning means: "as long as the parent is still on screen, keep ME
// pinned to the top of the viewport". So the visible content never moves —
// the user is essentially scrolling through empty space while the animation
// reacts to how far they've gone.
//
// ANIMATION PHASES (by scroll progress through the 400vh section):
//
//   Phase 1 — 0% → 33%   — words fade in one by one (random order)
//   Phase 2 — 33% → 55%  — highlight words change color to green
//   Phase 3 — 85%        — highlight words detach and fall (physics)
//   Phase 4 — 97%        — a "wind" blows all falling words off-screen
// =============================================================================

// React hooks we need:
//   - useEffect: runs code AFTER the component mounts to the DOM (the HTML
//     is already rendered and real DOM elements exist to animate).
//   - useRef: gives us a stable "box" to store a reference to a DOM element
//     or any value that should survive re-renders without triggering a re-render.
import { useEffect, useRef } from 'react';

// GSAP core — the main animation library.
import gsap from 'gsap';

// ScrollTrigger must be imported separately because it's a plugin.
// Plugins extend GSAP with extra functionality not in the core bundle.
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// The background image asset (imported as a URL string by the bundler).
import { MISSION_BG } from '../assets/koykoAssets';

// Tell GSAP to activate the ScrollTrigger plugin.
// This must be called once before any ScrollTrigger is created.
// We do it at module level (outside the component) so it runs only once,
// not every time the component re-renders.
gsap.registerPlugin(ScrollTrigger);


// =============================================================================
// TEXT CONTENT
// =============================================================================
// We store the paragraphs as plain strings outside the component for two reasons:
//   1. They never change, so there's no point re-creating them on every render.
//   2. We need to split them into words ONCE and keep the indices stable
//      across re-renders (explained further below with WORD_GRID).
const PARAGRAPHS = [
  'Koyko is drawn from Mapudungun, the language of the Mapuche people, where it means water. Like water, the work here takes the shape of what it holds — adapting, flowing, always finding its truest form.',
  'Every project undertaken by Koyko Design begins with a single belief: that a website is not a template to be filled, but a space to be inhabited. Built for businesses, artists, creatives, and those who refuse to look like everyone else — each digital experience is crafted with precision, intention, and care.',
  'What Koyko Design offers — Bespoke web design and development. Tailored entirely to the individual. For creatives and small businesses who understand that a distinctive digital presence is not a luxury — it is a necessity.',
  'The aim — To bring the kind of craftsmanship once reserved for large budgets and agency teams to those who deserve it most. No middlemen. No inflated costs. Just considered, high-quality work delivered with personal attention.',
  'And the best part? Your website should belong to you — fully, unconditionally. Koyko Design delivers clean, custom code with no subscriptions, no recurring fees, no strings attached. Built for you. Yours to keep. Forever.',
];


// =============================================================================
// HIGHLIGHT WORDS — which words will turn green in Phase 2
// =============================================================================
// A JavaScript Set is like an array but optimised for "does this value exist?"
// lookups. Set.has('water') is instant; Array.includes('water') would loop
// through every element. For checking membership, always prefer a Set.
//
// We store every keyword in lowercase because we'll lowercase the real word
// before checking — this makes the match case-insensitive.
const HIGHLIGHT_WORDS = new Set([
  'koyko', 'mapuche', 'water', 'design', 'precision', 'intention',
  'care', 'bespoke', 'luxury', 'craftsmanship', 'high-quality', 'forever',
]);

// Helper function: checks whether a single word (as it appears in the text,
// possibly with punctuation like "water." or "care,") is a highlight word.
//
// HOW IT WORKS:
//   word.replace(/[.,!?;:—"'()]/g, '') — the regex /[...]/g means "find
//   every character inside the brackets, anywhere in the string (g = global)".
//   .replace() swaps each match with '' (empty string), effectively deleting it.
//
//   .toLowerCase() — converts to lowercase so "Koyko" matches "koyko" in the Set.
//
//   HIGHLIGHT_WORDS.has(clean) — returns true/false.
function isHighlightWord(word) {
  const clean = word.replace(/[.,!?;:—"'()]/g, '').toLowerCase();
  return HIGHLIGHT_WORDS.has(clean);
}


// =============================================================================
// WORD_GRID — 2D array of words, split at module level
// =============================================================================
// PARAGRAPHS.map(p => p.split(' ')) turns:
//   ['Koyko is drawn...', 'Every project...']
// into:
//   [['Koyko', 'is', 'drawn', ...], ['Every', 'project', ...]]
//
// We do this OUTSIDE the component so the array is created once and never
// changes. If it were inside the component, React would recreate it on every
// render, which would shift the wordRefs indices and break the animation.
const WORD_GRID = PARAGRAPHS.map(p => p.split(' '));


// =============================================================================
// PARA_OFFSETS — where each paragraph starts in the flat wordRefs array
// =============================================================================
// wordRefs is a FLAT array: [word0, word1, word2, ..., wordN] across ALL paragraphs.
// To find where paragraph 2 starts, we need to know how many words came before it.
//
// PARA_OFFSETS[0] = 0    (paragraph 0 starts at index 0)
// PARA_OFFSETS[1] = 37   (paragraph 1 starts after paragraph 0's 37 words)
// PARA_OFFSETS[2] = 37 + 51 = 88  (paragraph 2 starts after para 0 + para 1)
// ... and so on.
//
// Array.reduce() is a "fold" — it walks through an array accumulating a result.
//   acc = the accumulated result so far (starts as [])
//   i   = current index
//   On each step we push: if i===0 push 0, otherwise push (previous offset + previous paragraph's word count)
const PARA_OFFSETS = WORD_GRID.reduce((acc, _words, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + WORD_GRID[i - 1].length);
  return acc;
}, []);


// =============================================================================
// COMPONENT
// =============================================================================
function KoykoMission() {

  // useRef creates a "ref object" with a .current property.
  // When you attach a ref to a JSX element via ref={sectionRef}, React sets
  // sectionRef.current to that real DOM node after the first render.
  // This lets us access and manipulate the DOM directly — something you
  // need for GSAP animations and physics, which operate on real elements.

  // Points to the outer <section> (the 400vh tall scroll container).
  const sectionRef = useRef(null);

  // Points to the inner sticky <div> (the 100vh visible container).
  const stickyRef  = useRef(null);

  // An array of refs — one slot per word <span>. We'll fill this in the JSX.
  // Using useRef([]) means the array object itself is stable across renders.
  const wordRefs   = useRef([]);

  // Stores the requestAnimationFrame ID so we can cancel it on cleanup.
  // requestAnimationFrame (rAF) is the browser's loop for smooth animations —
  // it calls your function ~60 times per second in sync with the screen refresh.
  const rafRef     = useRef(null);


  // ===========================================================================
  // useEffect — the animation setup
  // ===========================================================================
  // useEffect(fn, []) runs fn once after the component first mounts.
  // The empty array [] means "no dependencies" — only run on mount, not on updates.
  //
  // WHY NOT PUT THIS DIRECTLY IN THE COMPONENT BODY?
  // The component body (and its return statement) runs BEFORE React puts anything
  // in the real DOM. At that point, sectionRef.current is still null — there's
  // nothing to animate yet. useEffect waits until after React has committed the
  // JSX to the actual DOM, so all the real <span> elements exist and have real
  // pixel sizes and positions.
  useEffect(() => {
    // Pull the actual DOM nodes out of the refs.
    const section = sectionRef.current;
    const sticky  = stickyRef.current;

    // wordRefs.current is an array that may have null holes (if a ref callback
    // fires with null during unmounting). .filter(Boolean) removes all falsy
    // values (null, undefined, false, 0, '') leaving only real DOM nodes.
    const words = wordRefs.current.filter(Boolean);

    // Guard: if any required element is missing, bail out early.
    // This prevents crashes in edge cases like fast navigation away.
    if (!section || !sticky || !words.length) return;

    // ── Flags and mutable state ─────────────────────────────────────────────
    // These live inside the closure (not in React state) because changing them
    // should NOT trigger a re-render — they're only needed by the animation logic.

    // Set to true in the cleanup function so async physics code knows to abort.
    let cancelled     = false;

    // A no-op function by default; replaced with the real teardown once physics
    // starts. This pattern means callers don't need to check "did physics start?"
    // — they just call stopPhysics() and it does the right thing either way.
    let stopPhysics   = () => {};

    // Holds references to Matter.js objects (engine, bodies, etc.) so the
    // wind phase (Phase 4) can access them. null until physics is running.
    let physicsRefs   = null;

    // A counter incremented every time we want to CANCEL an in-flight physics
    // boot. Because import() is async, the user might scroll back up while
    // Matter.js is still loading. We use this ID to detect "stale" boots.
    let physicsBootId = 0;


    // ── Separate highlight words from plain words ───────────────────────────
    // el.dataset.highlight reads the data-highlight HTML attribute we set in JSX.
    // This splits the flat `words` array into two groups for targeted animation.
    const highlightEls = words.filter(el => el.dataset.highlight === 'true');
    const plainEls     = words.filter(el => el.dataset.highlight !== 'true');


    // ── Helper: fade plain words back in ────────────────────────────────────
    // Called when the user scrolls back up after the physics crumble.
    // gsap.killTweensOf() stops any in-progress animation on those elements
    // first so we don't have two animations fighting each other.
    function revealPlainWords() {
      gsap.killTweensOf(plainEls);
      gsap.to(plainEls, {
        opacity:  1,
        duration: 0.45,
        // stagger: instead of all animating at once, each word starts
        // slightly after the previous. amount:0.2 spreads the total stagger
        // over 0.2 seconds. from:'random' picks a random start order.
        stagger:  { amount: 0.2, from: 'random' },
        // overwrite:'auto' tells GSAP to only cancel tweens on the same
        // property (opacity) rather than cancelling ALL tweens on the element.
        overwrite: 'auto',
        ease:      'power2.out', // starts fast, decelerates at the end
      });
    }

    // ── Helper: reset ALL text to its normal pre-physics state ───────────────
    // Called when scrolling back up. Combines: clear inline transform styles
    // on highlight words, restore their CSS flow position, and fade plain words in.
    function normalizeMissionText() {
      gsap.killTweensOf(highlightEls);
      // clearProps:'transform' removes any inline transform style GSAP added,
      // letting the element fall back to its CSS-defined appearance.
      gsap.set(highlightEls, { clearProps: 'transform' });
      restoreHighlightFlow();
      revealPlainWords();
    }

    // ── Helper: undo the position:absolute trick used during physics ─────────
    // During physics (Phase 3) we rip highlight words out of the normal document
    // flow by setting position:absolute with pixel coordinates. When the user
    // scrolls back up we must restore them to position:'' (inherits from CSS)
    // so they flow naturally inside the paragraph text again.
    //
    // We also remove the CSS custom properties (--x, --y, --rotate) that the
    // physics loop writes to move words via CSS transform. Leaving them behind
    // would keep the words visually offset even after physics stops.
    function restoreHighlightFlow() {
      highlightEls.forEach(el => {
        el.style.position = '';  // '' removes the inline style, falls back to CSS
        el.style.left     = '';
        el.style.top      = '';
        el.style.width    = '';
        el.style.margin   = '';
        el.style.zIndex   = '';
        // removeProperty() removes a CSS custom property (CSS variable).
        // These were set during the physics tick loop.
        el.style.removeProperty('--x');
        el.style.removeProperty('--y');
        el.style.removeProperty('--rotate');
        // Also clear the data attributes we stored for the physics origin point.
        el.removeAttribute('data-cx');
        el.removeAttribute('data-cy');
      });
    }

    // ── Helper: shut down the Matter.js physics simulation ───────────────────
    // Calls the real stopPhysics() (set inside runPhysics once Matter.js loads),
    // then nulls out the refs so the wind phase can't trigger on dead data.
    // Also cancels the rAF loop if it's running.
    function teardownPhysics() {
      stopPhysics();
      stopPhysics  = () => {}; // reset to no-op so future calls are safe
      physicsRefs  = null;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }


    // =========================================================================
    // PHASE 1 — Scroll-scrubbed word fade-in (0% → 33% of section scroll)
    // =========================================================================
    // First, make every word invisible instantly (no animation, just a set).
    gsap.set(words, { opacity: 0 });

    // Create a GSAP Timeline. A timeline is a sequence of animations that play
    // one after another (or overlap, depending on settings). Here we attach it
    // to a ScrollTrigger so the timeline's playhead is driven by scroll position
    // instead of playing automatically.
    const fadeIn = gsap.timeline({
      scrollTrigger: {
        trigger: section,    // the element whose scroll position we watch
        start:   'top top',  // "when the top of [trigger] hits the top of viewport"
        end:     '33% top',  // "when 33% of the section has scrolled past the top"
        scrub:   1,          // links playhead to scroll with 1-second lag (feels smooth).
                             // scrub:true would be instant/rigid; a number adds damping.
      },
    });

    // Add an animation to the timeline: fade all words from opacity 0 → 1.
    // stagger with from:'random' makes each word start at a random time within
    // the 1.5-second stagger window — organic, not left-to-right.
    fadeIn.to(words, {
      opacity:  1,
      duration: 1,
      stagger:  { amount: 1.5, from: 'random' },
      ease:     'none', // linear — the scrub already provides easing via scroll speed
    });


    // =========================================================================
    // PHASE 2 — Highlight words change color (33% → 55%)
    // =========================================================================
    // We create this timeline as PAUSED (it won't auto-play). Then a separate
    // ScrollTrigger drives it by connecting the scroll position to the timeline's
    // playhead via the `animation` option.
    //
    // Why separate from Phase 1? Because we only want to animate highlightEls,
    // not all words, and the scroll range is different.
    const highlightTl = gsap.timeline({ paused: true });

    highlightTl.to(highlightEls, {
      color:    '#79FF4F',  // the vivid green highlight color
      duration: 0.4,
      stagger:  0,          // 0 = all change at the same moment (scrub spreads it out)
      ease:     'none',
    });

    // This ScrollTrigger drives highlightTl's playhead.
    // As the user scrolls from 33%→55%, the timeline plays from start→end.
    // If they scroll back, the timeline plays in reverse (colors go back to white).
    const highlightTrigger = ScrollTrigger.create({
      trigger:   section,
      start:     '33% top',   // picks up right where Phase 1 ended
      end:       '55% top',
      scrub:     true,        // no lag number — instant sync to scroll
      animation: highlightTl, // the timeline to control
    });


    // =========================================================================
    // PHASE 3 & 4 — Physics crumble and wind blast
    // =========================================================================
    // We use onUpdate (fires on every scroll update) with a progress threshold
    // rather than the 'end' callback. This is necessary because with sticky
    // positioning the section's bottom edge doesn't enter the viewport until
    // after we need the animation to fire — so end-based triggers fire too late.

    // Flags to make sure each phase fires exactly once per scroll-down pass.
    let physicsFired = false;
    let windFired    = false;

    const fallTrigger = ScrollTrigger.create({
      trigger: section,
      start:   'top top',
      end:     'bottom bottom', // watches the full 400vh range
      onUpdate(self) {
        // self.direction: 1 = scrolling down, -1 = scrolling up
        // self.progress:  0.0 = at the start, 1.0 = at the end

        // ── CASE A: user scrolled back up AFTER the wind blast (progress < 95%) ──
        // The words were blown off-screen. We need to:
        //   1. Tear down physics
        //   2. Restore text to normal flow
        //   3. Animate the highlight words flying BACK IN from the left
        //      to simulate them "returning" from where the wind took them.
        if (self.direction === -1 && self.progress < 0.95 && windFired) {
          physicsBootId += 1; // invalidate any in-flight physics boot
          teardownPhysics();
          normalizeMissionText();

          // leftSpawn is a negative X offset — far to the LEFT of the screen.
          // Math.max ensures it's at least 520px off-screen regardless of viewport width.
          const leftSpawn = -Math.max(sticky.offsetWidth * 0.85, 520);

          gsap.killTweensOf(highlightEls);
          // gsap.fromTo() animates FROM a starting state TO an ending state.
          // The arrow functions () => ... re-calculate the random value per-element.
          gsap.fromTo(
            highlightEls,
            {
              // Starting state: words spawn far off to the left with slight randomness
              x:      () => leftSpawn - Math.random() * 180,
              y:      () => (Math.random() - 0.5) * 22,
              rotate: () => gsap.utils.random(-12, 12),
            },
            {
              // Ending state: back in their natural position
              x:         0,
              y:         0,
              rotate:    0,
              duration:  0.95,
              stagger:   { amount: 0.45, from: 'start' }, // left-to-right return
              overwrite: 'auto',
              clearProps:'transform', // remove inline transforms when done
              ease:      'power3.out',
            }
          );

          windFired    = false;
          physicsFired = false;
          return; // stop here — don't fall through to other checks
        }

        // ── CASE B: user scrolled back up BEFORE the wind, but after physics started ──
        // Words were falling but hadn't blown away yet. Just stop physics and
        // restore the text to normal.
        if (self.direction === -1 && self.progress < 0.85 && physicsFired) {
          physicsBootId += 1;
          teardownPhysics();
          normalizeMissionText();
          windFired    = false;
          physicsFired = false;
          return;
        }

        // ── CASE C: scrolled DOWN past 85% → start the physics crumble ──────
        // !physicsFired ensures this only triggers once per downward pass.
        if (self.direction === 1 && self.progress >= 0.85 && !physicsFired) {
          physicsFired = true;
          runPhysics();
        }

        // ── CASE D: scrolled DOWN past 97% → blast words away with wind ─────
        // physicsRefs must be non-null (Matter.js finished loading and ran) before
        // we can apply forces. If the user scrolls to 97% before Matter.js finishes
        // loading, physicsRefs is still null and blowAway is skipped safely.
        if (self.direction === 1 && self.progress >= 0.97 && !windFired && physicsRefs) {
          windFired = true;
          blowAway(physicsRefs);
        }
      },
    });


    // =========================================================================
    // runPhysics() — boots the Matter.js simulation
    // =========================================================================
    // This function is only called once (when Phase 3 fires). It dynamically
    // imports Matter.js, which means the library is NOT included in the initial
    // JavaScript bundle. It only downloads when the user actually scrolls this far.
    // This is called "code splitting" or "lazy loading" — it keeps the initial
    // page load fast.
    function runPhysics() {
      // Snapshot the current boot ID. If the user scrolls back up while
      // Matter.js is loading, physicsBootId will be incremented and this
      // snapshot will no longer match — we use that to abort the stale boot.
      const bootId = ++physicsBootId;

      // import() returns a Promise. .then() runs when the module finishes loading.
      // We destructure only the parts of Matter.js we actually need.
      import('matter-js').then(({ Engine, Bodies, Body, World, Runner }) => {

        // Stale-boot check: if the user scrolled back up between the import()
        // call and now, cancelled or physicsFired may have changed.
        if (cancelled || !physicsFired || bootId !== physicsBootId) return;

        // ── Create the physics Engine ───────────────────────────────────────
        // The Engine is Matter.js's brain — it runs the simulation.
        // gravity.y = 1.2 means gravity pulls downward at 1.2× default strength.
        const engine     = Engine.create();
        engine.gravity.y = 1.2;

        // ── Get the sticky container's dimensions ───────────────────────────
        // We use the sticky div (100vh container) as our coordinate space because
        // it's always exactly aligned with the visible viewport. The words' absolute
        // positions are measured relative to this element.
        const stickyW = sticky.offsetWidth;
        const stickyH = sticky.offsetHeight;

        // ── Create an invisible static ground body ──────────────────────────
        // Bodies.rectangle(x, y, width, height, options) creates a rectangular body.
        // isStatic:true means it never moves — gravity doesn't affect it.
        // Words will fall and pile up on top of this ground.
        const ground = Bodies.rectangle(
          stickyW / 2,   // center x (middle of the container)
          stickyH - 60,  // y: near the bottom of the viewport
          stickyW * 2,   // extra wide so no word can fall off the side
          60,            // 60px tall
          { isStatic: true, label: 'ground' }
        );
        World.add(engine.world, ground); // add the ground to the simulation

        // ── Snapshot highlight word positions BEFORE changing any styles ────
        // getBoundingClientRect() returns an element's pixel position relative
        // to the VIEWPORT (the visible screen area).
        //
        // We need positions relative to the sticky container (our coordinate space),
        // so we subtract the sticky container's own position from each word's position.
        //
        // IMPORTANT: We must do this BEFORE setting any styles on the elements,
        // because changing position:absolute would immediately shift their layout
        // position and give us wrong measurements.
        const sr = sticky.getBoundingClientRect(); // sticky container's screen rect

        const snapshots = highlightEls.map(el => {
          const wr = el.getBoundingClientRect(); // this word's screen rect
          return {
            el,
            left:   wr.left - sr.left,              // x from sticky's left edge
            top:    wr.top  - sr.top,               // y from sticky's top edge
            width:  wr.width,
            height: wr.height,
            cx:     wr.left - sr.left + wr.width  / 2, // center x (for physics body)
            cy:     wr.top  - sr.top  + wr.height / 2, // center y (for physics body)
          };
        });

        // ── Fade out plain words ────────────────────────────────────────────
        // As the highlight words start crumbling, the plain words dissolve.
        // This focuses attention on only the falling words.
        gsap.killTweensOf(plainEls);
        gsap.to(plainEls, {
          opacity:  0,
          duration: 0.8,
          stagger:  { amount: 0.4, from: 'random' },
          overwrite: 'auto',
          ease:      'power2.out',
        });

        // Clear any leftover GSAP transform on highlight words before we
        // switch to physics-driven movement.
        gsap.killTweensOf(highlightEls);
        gsap.set(highlightEls, { clearProps: 'transform' });

        // ── Pull highlight words out of document flow ───────────────────────
        // Normally, <span> elements sit inline inside <p> text.
        // By setting position:absolute with explicit pixel coordinates we
        // "detach" each word from the paragraph and place it at the exact
        // same screen position it already occupied — visually nothing changes,
        // but now we control its position directly via CSS, not the text flow.
        // This is required because physics will move them pixel by pixel.
        snapshots.forEach(({ el, left, top, width }) => {
          el.style.position = 'absolute';
          el.style.left     = `${left}px`;
          el.style.top      = `${top}px`;
          el.style.width    = `${width}px`;
          el.style.margin   = '0';      // remove any inherited text spacing
          el.style.zIndex   = '2';      // render on top of other content
        });

        // ── Create one Matter.js physics body per highlight word ────────────
        // Bodies.rectangle() creates an invisible rectangular "collision shape"
        // at the same position as the visual word. Matter.js will then simulate
        // gravity and collisions on this invisible rectangle, and we'll mirror
        // its position to the real DOM element in the rAF tick loop below.
        const bodies = snapshots.map(({ el, cx, cy, width, height }) => {
          // Store the origin (snapshot) center on the element itself.
          // The tick loop uses these to calculate the DELTA (how far the body
          // has moved from its starting point) rather than using absolute coords.
          el.dataset.cx = cx;
          el.dataset.cy = cy;

          const body = Bodies.rectangle(cx, cy, width, height, {
            restitution: 0.25,  // bounciness: 0 = no bounce, 1 = perfectly elastic
            friction:    0.4,   // surface friction (slows sliding)
            frictionAir: 0.02,  // air resistance (slows rotation/movement over time)
          });

          // Attach the real DOM element to the physics body as a custom property.
          // Matter.js bodies are plain objects, so you can add any property.
          body.domEl = el;

          World.add(engine.world, body); // add this body to the simulation
          return body;
        });

        // ── Apply an initial random kick to each body ───────────────────────
        // Without this, all bodies would fall perfectly straight down.
        // Body.applyForce(body, position, force) nudges each body with:
        //   - a small random horizontal push (±x) so words scatter sideways
        //   - a small upward push (-y) so they "pop" up before falling
        //
        // The force values are small because Matter.js units are scaled to
        // match pixel dimensions — a force of 0.006 is enough to feel natural.
        bodies.forEach(body => {
          Body.applyForce(body, body.position, {
            x:  (Math.random() - 0.5) * 0.006,  // random left or right push
            y: -(Math.random()        * 0.008),  // always upward (negative y = up)
          });
        });

        // ── Save references for Phase 4 (wind) ─────────────────────────────
        // blowAway() needs access to bodies, the engine, and World to apply
        // forces and remove the ground. We store them in the outer closure variable.
        physicsRefs = { bodies, Body, ground, engine, World };

        // ── Start the Matter.js simulation runner ───────────────────────────
        // Runner.run(runner, engine) kicks off Matter.js's internal update loop.
        // It runs independently of our visual rAF loop — Matter updates physics
        // state, and our rAF loop reads that state to update the DOM.
        const runner = Runner.create();
        Runner.run(runner, engine);

        // ── rAF (requestAnimationFrame) tick loop ───────────────────────────
        // This is our "bridge" between Matter.js and the DOM.
        //
        // Every animation frame (~60fps), we:
        //   1. Loop through each physics body.
        //   2. Calculate how far it has moved from its starting position (dx, dy).
        //   3. Write that delta to CSS custom properties on the DOM element.
        //   4. CSS then applies `transform: translate(var(--x), var(--y)) rotate(var(--rotate))`
        //      to visually move the <span> to match the physics body.
        //
        // WHY USE CSS CUSTOM PROPERTIES instead of setting el.style.left directly?
        // Because the initial position is set with left/top (absolute), and using
        // transform on top of that is more performant — transforms are GPU-accelerated
        // and don't cause layout recalculation.
        const tick = () => {
          if (cancelled) return; // abort if the component has unmounted

          bodies.forEach(body => {
            const el = body.domEl;

            // Calculate displacement from the original snapshot position.
            // parseFloat() converts the stored string "123.45" back to a number.
            const dx = body.position.x - parseFloat(el.dataset.cx);
            const dy = body.position.y - parseFloat(el.dataset.cy);

            // Write values as CSS custom properties.
            // body.angle is in radians — CSS rotate() accepts 'rad' units.
            el.style.setProperty('--x',      `${dx}px`);
            el.style.setProperty('--y',      `${dy}px`);
            el.style.setProperty('--rotate', `${body.angle}rad`);
          });

          // Schedule the next frame. This creates the continuous loop.
          // We store the ID so we can cancel it in teardownPhysics().
          rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick); // kick off the loop

        // Define the teardown function now that we have everything we need to stop.
        // This overwrites the no-op defined at the top. Calling stopPhysics() after
        // this point will properly stop the runner, clear the world, and cancel rAF.
        stopPhysics = () => {
          Runner.stop(runner);
          World.clear(engine.world, false); // false = don't delete static bodies
          Engine.clear(engine);
          if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
          }
        };
      }); // end of import('matter-js').then()
    }


    // =========================================================================
    // blowAway() — Phase 4 wind blast
    // =========================================================================
    // Receives the physicsRefs object stored by runPhysics().
    // Removes the ground so words aren't blocked, then applies a strong
    // leftward force to every body — simulating a sudden gust of wind.
    function blowAway({ bodies, Body, ground, engine, World }) {

      // Remove the static ground body from the simulation.
      // Without the ground, falling words will pass through the bottom and
      // continue flying in whatever direction the force sends them.
      World.remove(engine.world, ground);

      // Zero out gravity so the wind moves words horizontally, not downward.
      engine.gravity.y = 0;

      // Apply a strong force to each body in the simulation.
      bodies.forEach(body => {
        // Eliminate all friction so nothing decelerates the flying words.
        body.frictionAir = 0;
        body.friction    = 0;

        // Apply the "wind" force: very strong leftward (negative x),
        // with a tiny random vertical component so each word exits at a
        // slightly different angle — avoids them all flying in a perfect line.
        Body.applyForce(body, body.position, {
          x: -(0.25 + Math.random() * 0.05),   // strong leftward blast
          y:  (Math.random() - 0.5) * 0.01,    // slight random up/down scatter
        });
      });
    }


    // =========================================================================
    // CLEANUP — runs when the component unmounts
    // =========================================================================
    // useEffect can return a cleanup function. React calls it when:
    //   - The component is removed from the DOM (e.g. user navigates away)
    //   - The effect is about to re-run (not applicable here since deps=[])
    //
    // WHY CLEANUP MATTERS:
    // If we don't kill ScrollTriggers and GSAP timelines, they keep running
    // even after the component is gone — causing memory leaks, errors trying
    // to animate elements that no longer exist, and bugs on the next page.
    return () => {
      cancelled = true;            // tells the rAF loop and async boot to abort
      fadeIn.kill();               // kills the Phase 1 timeline
      highlightTl.kill();          // kills the Phase 2 timeline
      highlightTrigger.kill();     // kills the Phase 2 ScrollTrigger
      fallTrigger.kill();          // kills the Phase 3/4 ScrollTrigger
      teardownPhysics();           // stops Matter.js and the rAF loop
    };
  }, []); // ← empty dependency array = run once on mount only


  // ===========================================================================
  // JSX — what this component actually renders
  // ===========================================================================
  // The return value is JSX — a syntax that looks like HTML but compiles to
  // React.createElement() calls. It describes the structure of the DOM.
  return (
    <section
      className="koyko-mission"    // CSS class for styling
      id="mission"                  // anchor link target (e.g. href="#mission")
      aria-label="Mission"          // screen reader label for accessibility
      ref={sectionRef}              // connects this element to sectionRef.current
    >
      {/*
        The tagline sits OUTSIDE the sticky container.
        This means it scrolls away normally as the user first enters the section,
        disappearing before the sticky content locks in.
        Think of it as a "heading" that announces what's coming.
      */}
      <p className="koyko-mission__tagline">
        A WEBSITE IS A PLACE
      </p>

      {/*
        The sticky container — stays pinned to the viewport top while the user
        scrolls through the full 400vh height of the outer <section>.
        ref={stickyRef} gives us access to its real DOM node for size measurements.
      */}
      <div className="koyko-mission__sticky" ref={stickyRef}>

        {/*
          aria-hidden="true" tells screen readers to skip this element entirely.
          It's purely decorative — a background texture image. Screen readers
          don't need to announce "background image".
        */}
        <div className="koyko-mission__bg-wrap" aria-hidden="true">
          <img src={MISSION_BG} alt="" className="koyko-mission__bg" />
        </div>

        <div className="koyko-mission__content">
          <div className="koyko-mission__body">

            {/*
              WORD_GRID is our 2D array: [paragraph][word].
              We .map() over each paragraph (pIdx = paragraph index),
              then .map() over each word in that paragraph (wIdx = word index).

              Each word becomes its own <span> so GSAP can animate them
              independently (fade in, color change, physics). You can't animate
              individual words if they're all in one big text node.

              key={pIdx} and key={wIdx} are required by React when rendering lists.
              They help React identify which item changed, was added, or removed,
              making updates more efficient. Keys must be unique within their list.
            */}
            {WORD_GRID.map((paraWords, pIdx) => (
              <p key={pIdx}>
                {paraWords.map((word, wIdx) => {

                  // Calculate this word's flat index across ALL paragraphs.
                  // PARA_OFFSETS[pIdx] = how many words came before this paragraph.
                  // wIdx = position within this paragraph.
                  // Together they form a unique index for wordRefs.current[i].
                  const i = PARA_OFFSETS[pIdx] + wIdx;

                  // Check if this word should be highlighted in Phase 2.
                  const highlight = isHighlightWord(word);

                  return (
                    <span
                      key={wIdx}
                      // ref callback: React calls this function when the <span>
                      // mounts, passing the real DOM node as `el`. We store it
                      // at the correct flat index so useEffect can find it by index.
                      ref={el => { wordRefs.current[i] = el; }}
                      className="koyko-mission__word"
                      // data-* attributes are custom HTML attributes. We use this
                      // as a marker so GSAP can split words into two groups:
                      // highlight vs plain. Setting it to `undefined` means the
                      // attribute is NOT rendered in the HTML at all (React's behavior).
                      data-highlight={highlight ? 'true' : undefined}
                    >
                      {word}{' '}
                      {/*
                        The space after {word} is important — it's the space
                        between words. Without it, "hello" and "world" would
                        render as "helloworld". We can't put the space inside
                        the word string because the physics phase needs to know
                        the exact width of each word without the space.
                      */}
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
