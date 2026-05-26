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
        {/* about → dedicated /about route */}
        <Link href="/about" className="v2-nav__link">about</Link>
        <span className="v2-nav__sep" aria-hidden="true" />
        {/* contact → dedicated /contact route */}
        <Link href="/contact" className="v2-nav__link">contact</Link>
      </nav>
    </header>
  );
}
