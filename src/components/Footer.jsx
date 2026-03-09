import React from 'react';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer" aria-label="Footer">
      <div className="site-footer__inner">
        <p className="site-footer__copy">
          © {currentYear} Koyko Studio. All rights reserved.
        </p>
        <nav aria-label="Footer navigation" className="site-footer__nav">
          <a href="#home" className="site-footer__link">
            Home
          </a>
          <a href="#portfolio" className="site-footer__link">
            Work
          </a>
          <a href="#contact" className="site-footer__link">
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}

export default Footer;
