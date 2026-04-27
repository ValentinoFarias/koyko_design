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
import { KUMO_LOGO, NERDECKS_LOGO, SOCRATIC_JS_LOGO } from '../assets/koykoAssets';

// Register Flip plugin once at module level
gsap.registerPlugin(Flip);

// logoStyle lets individual logos override the default width when the image
// has more transparent/white padding than others, so all logos look the same size visually.
function PortfolioItem({ id, logo, name, description, link, linkLabel, logoStyle }) {
  const itemRef = useRef(null);       // the flex container that changes layout
  const logoRef = useRef(null);       // the logo image
  const nameRef = useRef(null);       // the project name text
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
          // Make desc visible in the layout before fading it in
          gsap.set(descRef.current, { display: 'block' });
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
          // Remove desc from layout so it takes no space during the flip back
          gsap.set(descRef.current, { display: 'none' });
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
    <div ref={itemRef} className="koyko-portfolio__item">
      {/* Logo — clicking it triggers the Flip animation */}
      <img
        ref={logoRef}
        src={logo}
        alt={`${name} logo`}
        className="koyko-portfolio__img"
        style={logoStyle}
        data-flip-id={`${id}-logo`}
        onClick={handleClick}
      />

      {/* Right column — name stacks above description.
          In the initial (column) layout both sit centred under the logo.
          In expanded (row) layout they sit to the right of the logo. */}
      <div className="koyko-portfolio__info">
        <p
          ref={nameRef}
          className="koyko-portfolio__name"
          data-flip-id={`${id}-name`}
        >
          {name}
        </p>

        {/* Description — hidden initially (opacity:0, shifted down).
            GSAP fades in the whole block (text + link) after the Flip animation completes. */}
        <div ref={descRef} className="koyko-portfolio__desc">
          <p>{description}</p>
          <a href={link} target="_blank" rel="noopener noreferrer" className="koyko-portfolio__link">
            {linkLabel}
          </a>
        </div>
      </div>
    </div>
  );
}

function KoykoPortfolio() {
  const sectionRef = useRef(null);     // the outer <section>

  return (
    <section
      ref={sectionRef}
      className="koyko-portfolio"
      id="packages"
      aria-label="Portfolio"
    >
      {/* List of projects — each item keeps its own flip/expand state */}
      <div className="koyko-portfolio__list">
        <PortfolioItem
          id="nerdecks"
          logo={NERDECKS_LOGO}
          name="NERDECKS"
          description="A spaced repetition web application that helps users remember information efficiently by reviewing cards at scientifically optimized intervals."
          link="https://nerdeck-981cca01cede.herokuapp.com/"
          linkLabel="NerDecks"
        />

        <PortfolioItem
          id="kumo-ramen"
          logo={KUMO_LOGO}
          logoStyle={{ width: 'clamp(115px, 23vw, 288px)' }}
          name="Kumo Ramen"
          description="A portfolio website for a ramen restaurant."
          link="https://www.kumoramen.koykodesign.com/"
          linkLabel="Kumo Ramen"
        />

        <PortfolioItem
          id="socratic-js"
          logo={SOCRATIC_JS_LOGO}
          name="socraticJS"
          description="Socratic teacher to learn JavaScript"
          link="https://socraticjs-6175a41ed31f.herokuapp.com/"
          linkLabel="socraticJS"
        />
      </div>
    </section>
  );
}

export default KoykoPortfolio;
