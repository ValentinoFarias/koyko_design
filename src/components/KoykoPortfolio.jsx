// KoykoPortfolio — portfolio showcase with swap animation.
//
// Three logos sit side by side. Clicking a side logo swaps it to the
// centre with a GSAP Flip animation; clicking the centre logo shows/hides
// its project description below it.
//
// State is managed entirely here so siblings can react to each other's clicks.

'use client';

import { useRef, useState, useLayoutEffect, useCallback } from 'react';
import gsap from 'gsap';
import { Flip } from 'gsap/dist/Flip';
import { KUMO_LOGO, NERDECKS_LOGO, SOCRATIC_JS_LOGO } from '../assets/koykoAssets';

gsap.registerPlugin(Flip);

// Project data lives here so order changes don't lose any info
const PROJECTS = [
  {
    id: 'nerdecks',
    logo: NERDECKS_LOGO,
    name: 'NERDECKS',
    description:
      'A spaced repetition web application that helps users remember information efficiently by reviewing cards at scientifically optimized intervals.',
    link: 'https://nerdeck-981cca01cede.herokuapp.com/',
    linkLabel: 'NerDecks',
  },
  {
    id: 'kumo-ramen',
    logo: KUMO_LOGO,
    logoStyle: { width: 'clamp(115px, 23vw, 288px)' },
    name: 'Kumo Ramen',
    description: 'A portfolio website for a ramen restaurant.',
    link: 'https://www.kumoramen.koykodesign.com/',
    linkLabel: 'Kumo Ramen',
  },
  {
    id: 'socratic-js',
    logo: SOCRATIC_JS_LOGO,
    name: 'socraticJS',
    description: 'Socratic teacher to learn JavaScript',
    link: 'https://socraticjs-6175a41ed31f.herokuapp.com/',
    linkLabel: 'socraticJS',
  },
];

function KoykoPortfolio() {
  const listRef       = useRef(null);
  const descRefs      = useRef({});          // { [id]: desc DOM element }
  const flipStateRef  = useRef(null);        // Flip snapshot captured before React re-renders
  const pendingIdRef  = useRef(null);        // id of logo to expand after Flip settles
  const isAnimating   = useRef(false);       // guard — ignore clicks mid-animation

  const [items,      setItems]      = useState(PROJECTS);  // visual order (left → right)
  const [expandedId, setExpandedId] = useState(null);      // which desc is currently visible

  // useLayoutEffect fires after the DOM update but BEFORE the browser paints.
  // This is the right place for Flip.from — it sets transform overrides before
  // the user sees the new positions, so the animation looks seamless.
  useLayoutEffect(() => {
    if (!flipStateRef.current) return;
    const state = flipStateRef.current;
    flipStateRef.current = null;

    Flip.from(state, {
      duration: 0.8,
      ease: 'power2.inOut',
      onComplete: () => {
        const id = pendingIdRef.current;
        pendingIdRef.current = null;
        if (!id) { isAnimating.current = false; return; }

        // Fade in the description of the logo that just moved to centre.
        // xPercent:-50 centres it over the left:50% anchor; y:12 is the slide-in start.
        const desc = descRefs.current[id];
        gsap.set(desc, { display: 'block', xPercent: -50, y: 12 });
        gsap.to(desc, {
          opacity: 1, y: 0, duration: 0.5, ease: 'power2.out',
          onComplete: () => { isAnimating.current = false; },
        });
        setExpandedId(id);
      },
    });
  }, [items]); // runs whenever items order changes

  const handleLogoClick = useCallback((clickedId) => {
    if (isAnimating.current) return;

    const clickedIndex = items.findIndex(item => item.id === clickedId);
    const isCenter     = clickedIndex === 1;

    // Helper: fade out the current description, then run a callback
    const hideDesc = (callback) => {
      if (!expandedId) { callback(); return; }
      const desc = descRefs.current[expandedId];
      gsap.to(desc, {
        opacity: 0, y: 12, duration: 0.3, ease: 'power2.in',
        onComplete: () => { gsap.set(desc, { display: 'none' }); callback(); },
      });
    };

    // --- Case 1: clicking the already-visible centre description → collapse ---
    if (isCenter && expandedId === clickedId) {
      isAnimating.current = true;
      hideDesc(() => { setExpandedId(null); isAnimating.current = false; });
      return;
    }

    // --- Case 2: clicking the centre logo (no description yet) → show desc ---
    if (isCenter) {
      isAnimating.current = true;
      hideDesc(() => {
        const desc = descRefs.current[clickedId];
        gsap.set(desc, { display: 'block', xPercent: -50, y: 12 });
        gsap.to(desc, {
          opacity: 1, y: 0, duration: 0.5, ease: 'power2.out',
          onComplete: () => { isAnimating.current = false; },
        });
        setExpandedId(clickedId);
      });
      return;
    }

    // --- Case 3: clicking a side logo → swap it with the centre, then show desc ---
    isAnimating.current = true;

    const doSwap = () => {
      // Capture item div positions BEFORE React updates the DOM.
      // Animating the whole item div (not the nested img) keeps the right
      // logo completely untouched — Flip only moves divs whose position changed.
      const itemEls = listRef.current.querySelectorAll('.koyko-portfolio__item');
      flipStateRef.current = Flip.getState(itemEls);
      pendingIdRef.current = clickedId;

      setExpandedId(null);
      setItems(prev => {
        const next = [...prev];
        // Always swap the clicked side logo with the centre (index 1)
        if (clickedIndex === 0) {
          [next[0], next[1]] = [next[1], next[0]];
        } else {
          [next[1], next[2]] = [next[2], next[1]];
        }
        return next;
      });
      // useLayoutEffect fires after the re-render and runs Flip.from
    };

    hideDesc(doSwap);
  }, [items, expandedId]);

  return (
    <section className="koyko-portfolio" id="packages" aria-label="Portfolio">
      <div ref={listRef} className="koyko-portfolio__list">
        {items.map((project) => (
          <div key={project.id} className="koyko-portfolio__item" data-flip-id={project.id}>
            <img
              src={project.logo}
              alt={`${project.name} logo`}
              className="koyko-portfolio__img"
              style={project.logoStyle}
              onClick={() => handleLogoClick(project.id)}
            />
            <div className="koyko-portfolio__info">
              <div
                ref={el => { descRefs.current[project.id] = el; }}
                className="koyko-portfolio__desc"
              >
                <p>{project.description}</p>
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="koyko-portfolio__link"
                >
                  {project.linkLabel}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default KoykoPortfolio;
