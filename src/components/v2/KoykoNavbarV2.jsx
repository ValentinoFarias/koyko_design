'use client';

import Link from 'next/link';

export default function KoykoNavbarV2() {
  return (
    <header className="v2-nav">
      {/* Brand → home page */}
      <Link className="v2-nav__brand" href="/home" aria-label="Koyko home">
        <img src="/assets/images/logo-wordmark.png" alt="Koyko" />
      </Link>

      <nav className="v2-nav__links" aria-label="Primary">
        {/* about — still an in-page anchor for now */}
        <a href="#about" className="v2-nav__link">about</a>
        <span className="v2-nav__sep" aria-hidden="true" />
        {/* contact → dedicated /contact-v2 route */}
        <Link href="/contact-v2" className="v2-nav__link">contact</Link>
      </nav>
    </header>
  );
}
