import React from 'react';

function AboutSection() {
  return (
    <section id="about" className="section section-about" aria-labelledby="about-heading">
      <div className="section__inner section-about__inner">
        <div className="section-about__content">
          <h2 id="about-heading" className="section__title">
            About
          </h2>
          <p className="section__lead">
            100 I craft digital products that balance aesthetics, usability, and performance.
          </p>
          <p className="section__body">
            With experience across design systems, front-end engineering, and motion design, I help teams ship fast,
            accessible interfaces. I enjoy working at the intersection of design and code to turn complex problems into
            simple, meaningful experiences.
          </p>
          <div className="section-about__grid">
            <div className="section-about__item">
              <p className="section-about__label">Focus</p>
              <p className="section-about__value">Design systems, UI engineering, motion</p>
            </div>
            <div className="section-about__item">
              <p className="section-about__label">Stack</p>
              <p className="section-about__value">React, TypeScript, GSAP, CSS Architecture</p>
            </div>
            <div className="section-about__item">
              <p className="section-about__label">Location</p>
              <p className="section-about__value">Remote-friendly, EU time zone</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
