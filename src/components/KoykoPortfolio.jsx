// KoykoPortfolio — portfolio showcase with swap animation.
//
// Three logos sit side by side. Clicking a side logo swaps it to the
// centre with a GSAP Flip animation; once the Flip completes, the page
// transition wipe fires and the user is taken to /casestudies.
// Clicking the centre logo skips straight to the page transition.
//
// State is managed entirely here so siblings can react to each other's clicks.

'use client';

import { useRef, useState, useLayoutEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { Flip } from 'gsap/dist/Flip';
import { animateTransition } from '../assets/anim/pageTransitions';
import { KUMO_LOGO, NERDECKS_LOGO, SOCRATIC_JS_LOGO } from '../assets/koykoAssets';

gsap.registerPlugin(Flip);

// Project data — description/link kept here for future use on the CaseStudies page
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
  const listRef          = useRef(null);
  const flipStateRef     = useRef(null);   // Flip snapshot captured before React re-renders
  const shouldNavigate   = useRef(false);  // tells useLayoutEffect to navigate after Flip
  const isAnimating      = useRef(false);  // guard — ignore clicks mid-animation

  const [items, setItems] = useState(PROJECTS);
  const router = useRouter();

  // Triggers the page-wipe animation then pushes the new route.
  const goToCaseStudies = useCallback(() => {
    animateTransition().then(() => {
      router.push('/casestudies');
    });
  }, [router]);

  // useLayoutEffect fires after the DOM update but BEFORE the browser paints.
  // This is the right moment for Flip.from so the animation starts from the
  // old positions seamlessly. After Flip completes, we navigate if flagged.
  useLayoutEffect(() => {
    if (!flipStateRef.current) return;
    const state = flipStateRef.current;
    flipStateRef.current = null;

    Flip.from(state, {
      duration: 0.8,
      ease: 'power2.inOut',
      onComplete: () => {
        isAnimating.current = false;
        // If this swap was triggered by a side-logo click, navigate now.
        if (shouldNavigate.current) {
          shouldNavigate.current = false;
          goToCaseStudies();
        }
      },
    });
  }, [items, goToCaseStudies]);

  const handleLogoClick = useCallback((clickedId) => {
    if (isAnimating.current) return;

    const clickedIndex = items.findIndex(item => item.id === clickedId);
    const isCenter     = clickedIndex === 1;

    // Centre logo clicked → skip the swap and go straight to case studies
    if (isCenter) {
      goToCaseStudies();
      return;
    }

    // Side logo clicked → swap it to centre, then navigate once Flip is done
    isAnimating.current  = true;
    shouldNavigate.current = true;

    // Capture positions BEFORE React updates the DOM
    const itemEls = listRef.current.querySelectorAll('.koyko-portfolio__item');
    flipStateRef.current = Flip.getState(itemEls);

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
    // useLayoutEffect fires after re-render and runs Flip.from
  }, [items, goToCaseStudies]);

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
          </div>
        ))}
      </div>
    </section>
  );
}

export default KoykoPortfolio;
