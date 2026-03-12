// KoykoPortfolio — featured project showcase with Flip animation
//
// Initial layout:     [LOGO]
//                    [NERDECKS]
//
// After clicking the logo, GSAP Flip rearranges to:
//   [LOGO]   [NERDECKS]
//            [description text fades in here]
//
// The Flip plugin captures positions before/after a CSS class toggle,
// then animates between the two states automatically.

'use client';

import { useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { Flip } from 'gsap/dist/Flip';
import { NERDECKS_LOGO } from '../assets/koykoAssets';

// Register Flip plugin once at module level
gsap.registerPlugin(Flip);

function KoykoPortfolio() {
  const sectionRef = useRef(null);     // the outer <section> — height gets locked
  const itemRef = useRef(null);       // the flex container that changes layout
  const logoRef = useRef(null);       // the logo image
  const nameRef = useRef(null);       // the "NERDECKS" text
  const descRef = useRef(null);       // the hidden description paragraph
  const [expanded, setExpanded] = useState(false); // tracks if already flipped

  const handleClick = useCallback(() => {
    // 1. Capture positions BEFORE the layout change
    const state = Flip.getState([logoRef.current, nameRef.current]);

    if (!expanded) {
      // ---- EXPAND: column → row ----
      setExpanded(true);
      itemRef.current.classList.add('koyko-portfolio__item--expanded');

      Flip.from(state, {
        duration: 0.8,
        ease: 'power2.inOut',
        onComplete: () => {
          // Fade in the description after the flip settles
          gsap.to(descRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'power2.out',
          });
        },
      });
    } else {
      // ---- COLLAPSE: row → column ----
      // First hide the description, then flip back
      gsap.to(descRef.current, {
        opacity: 0,
        y: 12,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          // Re-capture state after description is hidden
          const collapseState = Flip.getState([logoRef.current, nameRef.current]);
          setExpanded(false);
          itemRef.current.classList.remove('koyko-portfolio__item--expanded');

          Flip.from(collapseState, {
            duration: 0.8,
            ease: 'power2.inOut',
          });
        },
      });
    }
  }, [expanded]);

  return (
    <section
      ref={sectionRef}
      className="koyko-portfolio"
      id="packages"
      aria-label="Portfolio"
    >
      {/* Container — starts as column (logo stacked above name),
          flips to row (logo left, name+description right) on click */}
      <div ref={itemRef} className="koyko-portfolio__item">
        {/* Logo — clicking it triggers the Flip animation */}
        <img
          ref={logoRef}
          src={NERDECKS_LOGO}
          alt="Nerdecks logo"
          className="koyko-portfolio__img"
          data-flip-id="nerdecks-logo"
          onClick={handleClick}
        />

        {/* Right column — name stacks above description.
            In the initial (column) layout both sit centred under the logo.
            In expanded (row) layout they sit to the right of the logo. */}
        <div className="koyko-portfolio__info">
          <p
            ref={nameRef}
            className="koyko-portfolio__name"
            data-flip-id="nerdecks-name"
          >
            NERDECKS
          </p>

          {/* Description — hidden initially (opacity:0, shifted down).
              GSAP fades it in after the Flip animation completes. */}
          <p ref={descRef} className="koyko-portfolio__desc">
            A spaced repetition web application that helps users remember
            information efficiently by reviewing cards at scientifically
            optimized intervals.
          </p>
        </div>
      </div>
    </section>
  );
}

export default KoykoPortfolio;
