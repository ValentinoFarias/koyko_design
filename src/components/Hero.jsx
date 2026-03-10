'use client';

import React, { useEffect, useState } from 'react';

/**
 * Hero section with typewriter-style animated headline and CTAs.
 */
function Hero({ onPrimaryAction, onSecondaryAction }) {
  const [headline, setHeadline] = useState('');

  useEffect(() => {
    const fullText = 'Creative Developer & Designer';
    let index = 0;

    const interval = setInterval(() => {
      setHeadline(fullText.slice(0, index + 1));
      index += 1;

      if (index >= fullText.length) {
        clearInterval(interval);
      }
    }, 80);

    return () => clearInterval(interval);
  }, []);

  const handlePrimary = () => {
    if (onPrimaryAction) {
      onPrimaryAction();
    }
  };

  const handleSecondary = () => {
    if (onSecondaryAction) {
      onSecondaryAction();
    }
  };

  return (
    <section id="home" className="section section-hero" aria-labelledby="hero-heading">
      <div className="section__inner section-hero__inner">
        <div className="section-hero__content">
          <p className="eyebrow">Portfolio</p>
          <h1 id="hero-heading" className="section-hero__title">
            {headline}
            <span className="section-hero__cursor" aria-hidden="true">
              |
            </span>
          </h1>
          <p className="section-hero__subtitle">
            Showcasing thoughtful interfaces, performant web apps, and immersive digital experiences.
          </p>

          <div className="section-hero__actions">
            <button type="button" className="btn btn--primary" onClick={handlePrimary}>
              View Portfolio
            </button>
            <button type="button" className="btn btn--ghost" onClick={handleSecondary}>
              Contact Me
            </button>
          </div>
        </div>

        <div className="section-hero__visual" aria-hidden="true">
          <div className="hero-orbit">
            <div className="hero-orbit__planet hero-orbit__planet--primary" />
            <div className="hero-orbit__planet hero-orbit__planet--secondary" />
            <div className="hero-orbit__ring" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
