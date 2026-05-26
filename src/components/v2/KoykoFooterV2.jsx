'use client';

import Link from 'next/link';

// Smooth-scrolls back to the top of the page.
const handleBackToTop = () =>
  window.scrollTo({ top: 0, behavior: 'smooth' });

export default function KoykoFooterV2() {
  return (
    <footer className="v2-foot">

      {/* Left figure mark — clickable, navigates back to /home */}
      <div className="v2-foot__left">
        <Link href="/home" aria-label="Koyko home" className="v2-foot__figure-link">
          <img
            className="v2-foot__figure"
            src="/assets/images/v2images/logoFigura.svg"
            alt="Koyko"
          />
        </Link>
      </div>

      {/* 1.5px vertical rule between the figure and the contact columns */}
      <div className="v2-foot__rule" aria-hidden="true" />

      {/* Col 1: hello / email */}
      <div className="v2-foot__col">
        <span className="v2-foot__h">hello</span>
        <a className="v2-foot__a" href="mailto:hello@koykodesign.com">
          hello@koykodesign.com
        </a>
      </div>

      {/* Col 2: FAQs — one question for now, links to deeper content */}
      <div className="v2-foot__col">
        <span className="v2-foot__h">FAQs</span>
        <Link className="v2-foot__a v2-foot__a--sm" href="/process">
          what&apos;s it like to work with Koyko?
        </Link>
      </div>

      {/* Bottom strip (spans full width): copy line + back-to-top */}
      <div className="v2-foot__col v2-foot__col--bot">
        <span className="v2-foot__small">© koyko '26 · hecho con amor</span>
        <button
          className="v2-foot__top"
          onClick={handleBackToTop}
          aria-label="Scroll back to top"
        >
          back to top&nbsp;↑
        </button>
      </div>

    </footer>
  );
}
