'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Site header with navigation, dark/light toggle and mobile menu.
 */
function Header({ theme, onToggleTheme, onNavClick }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const handleNavClick = (sectionId) => {
    if (onNavClick) {
      onNavClick(sectionId);
    }
  };

  return (
    <header className={`site-header ${isScrolled ? 'site-header--scrolled' : ''}`}>
      <div className="site-header__inner">
        <div className="site-header__brand">
          <Link href="/home" className="site-header__logo" aria-label="Go to homepage">
            Koyko
          </Link>
        </div>

        <nav className="site-header__nav" aria-label="Primary navigation">
          <ul className="nav-list nav-list--desktop">
            <li className="nav-list__item">
              <button type="button" className="nav-list__link" onClick={() => handleNavClick('home')}>
                Home
              </button>
            </li>
            <li className="nav-list__item">
              <button type="button" className="nav-list__link" onClick={() => handleNavClick('about')}>
                About
              </button>
            </li>
            <li className="nav-list__item">
              <button type="button" className="nav-list__link" onClick={() => handleNavClick('portfolio')}>
                Portfolio
              </button>
            </li>
            <li className="nav-list__item">
              <button type="button" className="nav-list__link" onClick={() => handleNavClick('services')}>
                Services
              </button>
            </li>
            <li className="nav-list__item">
              <button type="button" className="nav-list__link" onClick={() => handleNavClick('contact')}>
                Contact
              </button>
            </li>
          </ul>
        </nav>

        <div className="site-header__actions">
          <button
            type="button"
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label={`Activate ${theme === 'dark' ? 'light' : 'dark'} mode`}
            aria-pressed={theme === 'dark'}
          >
            <span aria-hidden="true">{theme === 'dark' ? '🌙' : '☀️'}</span>
          </button>

          <button
            type="button"
            className="menu-toggle"
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <span className="menu-toggle__bar" />
            <span className="menu-toggle__bar" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <nav className={`mobile-nav ${isMenuOpen ? 'mobile-nav--open' : ''}`} aria-label="Mobile navigation">
        <ul className="mobile-nav__list">
          <li className="mobile-nav__item">
            <button type="button" className="mobile-nav__link" onClick={() => handleNavClick('home')}>
              Home
            </button>
          </li>
          <li className="mobile-nav__item">
            <button type="button" className="mobile-nav__link" onClick={() => handleNavClick('about')}>
              About
            </button>
          </li>
          <li className="mobile-nav__item">
            <button type="button" className="mobile-nav__link" onClick={() => handleNavClick('portfolio')}>
              Portfolio
            </button>
          </li>
          <li className="mobile-nav__item">
            <button type="button" className="mobile-nav__link" onClick={() => handleNavClick('services')}>
              Services
            </button>
          </li>
          <li className="mobile-nav__item">
            <button type="button" className="mobile-nav__link" onClick={() => handleNavClick('contact')}>
              Contact
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
