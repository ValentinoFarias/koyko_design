'use client';

export default function KoykoNavbarV2() {
  return (
    <header className="v2-nav">
      <a className="v2-nav__brand" href="#top" aria-label="Koyko home">
        <img src="/assets/images/logo-wordmark.png" alt="Koyko" />
      </a>

      <nav className="v2-nav__links" aria-label="Primary">
        <a href="#about"   className="v2-nav__link">about</a>
        <span className="v2-nav__sep" aria-hidden="true" />
        <a href="#contact" className="v2-nav__link">contact</a>
      </nav>
    </header>
  );
}
