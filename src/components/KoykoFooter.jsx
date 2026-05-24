// KoykoFooter — site footer with contact info and back-to-top
//
// Grid layout (desktop — 4 columns):
//   Col 1 → Koyko logo mark (scaled down)
//   Col 2 → 2px vertical divider line
//   Col 3 → Email contact: bold "hello" label + mailto link
//   Col 4 → Social contacts: Whatsapp, Telegram, "Ask for Valentino"
//           + mouse-trail image that follows the cursor on desktop
//
// Row 2 (full-width):
//   "Back to top >" button — right-aligned, scrolls to top on click
//
// On mobile (≤640px) the grid stacks vertically and the vertical divider
// becomes a horizontal one — handled in CSS.

'use client';

import { useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { LOGO } from '../assets/koykoAssets';

// ---------------------------------------------------------------------------
// useMouseTrailImage — custom hook that attaches a cursor-following image
// to a container element.
//
// How it works:
//   1. On mount, creates an <img> element and appends it to the container.
//      The image is absolutely positioned and starts invisible (opacity: 0).
//   2. On mouseenter → fade the image in.
//   3. On mousemove  → smoothly move the image toward the cursor using
//      gsap.to with a short duration so it "trails" behind the pointer.
//   4. On mouseleave → fade the image out.
//   5. On touch devices (pointer: coarse) → skip everything.
//   6. Cleanup removes the image element and all listeners on unmount.
//
// Parameters:
//   containerRef — React ref to the container element
//   imageSrc     — path to the trailing image
// ---------------------------------------------------------------------------
function useMouseTrailImage(containerRef, imageSrc) {
  const imgRef = useRef(null); // the trailing <img> element

  // --- Handlers (stable references via useCallback) ---

  const handleEnter = useCallback(() => {
    // Fade the image in when the cursor enters the container
    if (imgRef.current) {
      gsap.to(imgRef.current, { opacity: 1, duration: 0.3, ease: 'power2.out' });
    }
  }, []);

  const handleMove = useCallback((e) => {
    if (!imgRef.current || !containerRef.current) return;

    // Position relative to <footer> (where the image is appended),
    // not the social col — so x/y map correctly to the absolute image.
    const footer = containerRef.current.closest('footer');
    if (!footer) return;
    const rect = footer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Move the image toward the cursor with a slight delay (trailing feel)
    gsap.to(imgRef.current, {
      x: x,
      y: y,
      duration: 0.4,
      ease: 'power2.out',
    });
  }, [containerRef]);

  const handleLeave = useCallback(() => {
    // Fade the image out when the cursor leaves the container
    if (imgRef.current) {
      gsap.to(imgRef.current, { opacity: 0, duration: 0.3, ease: 'power2.in' });
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Skip entirely on touch devices — no mouse trail needed
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    // Append the image to <footer> (the container's parent), NOT to the social
    // col itself. The social col is only ~3 lines tall — the image would be
    // clipped immediately. The footer is position:relative in CSS so absolute
    // positioning resolves correctly inside it.
    const footer = container.closest('footer');
    if (!footer) return;

    // Create the trailing image element once
    const img = document.createElement('img');
    img.src = imageSrc;
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    img.className = 'koyko-footer__trail-img';

    // xPercent/yPercent handle centering (-50% of the image's own size).
    // This way GSAP controls ALL transforms — no CSS transform conflict.
    gsap.set(img, { opacity: 0, x: 0, y: 0, xPercent: -50, yPercent: -50 });

    footer.appendChild(img);
    imgRef.current = img;

    // Attach listeners to the social col (hover zone stays the same)
    container.addEventListener('mouseenter', handleEnter);
    container.addEventListener('mousemove', handleMove);
    container.addEventListener('mouseleave', handleLeave);

    // Cleanup on unmount
    return () => {
      container.removeEventListener('mouseenter', handleEnter);
      container.removeEventListener('mousemove', handleMove);
      container.removeEventListener('mouseleave', handleLeave);
      gsap.killTweensOf(img);
      img.remove();
      imgRef.current = null;
    };
  }, [containerRef, imageSrc, handleEnter, handleMove, handleLeave]);
}

// ---------------------------------------------------------------------------
// KoykoFooter — main footer section
// ---------------------------------------------------------------------------
function KoykoFooter() {
  const socialColRef = useRef(null);

  // Attach the mouse-trail image effect to the social column
  useMouseTrailImage(socialColRef, '/assets/images/phoneNumber.jpg');

  // Scroll the page back to the top smoothly when the button is clicked
  const handleBackToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="koyko-footer">

      {/* ── Col 1: Logo — clicking navigates to the home page ───── */}
      <div className="koyko-footer__logo-col">
        <a href="/home" aria-label="Go to home page">
          <img
            src={LOGO}
            alt="Koyko Design"
            className="koyko-footer__logo"
          />
        </a>
      </div>

      {/* ── Col 2: Vertical divider ───────────────────────────────── */}
      {/* CSS handles switching this to a horizontal rule on mobile */}
      <div className="koyko-footer__vdivider" aria-hidden="true" />

      {/* ── Col 3: Email contact ──────────────────────────────────── */}
      <div className="koyko-footer__contact-col">
        {/* Bold "hello" label above the email address */}
        <span className="koyko-footer__label">hello</span>
        <a
          href="mailto:hello@koykodesign.com"
          className="koyko-footer__value"
        >
          hello@koykodesign.com
        </a>
      </div>

      {/* ── Col 4: Social / messaging ─────────────────────────────── */}
      {/* Mouse-trail image follows the cursor over this column on desktop */}
      <div ref={socialColRef} className="koyko-footer__social-col">
        <span className="koyko-footer__value">Whatsapp</span>
        <span className="koyko-footer__value">Telegram</span>
        {/* Light-weight note — matches the Figma "Ask for Valentino" label */}
        <span className="koyko-footer__social-note">Ask for Valentino</span>
      </div>

      {/* ── Row 2: Back to top ────────────────────────────────────── */}
      {/* grid-column: 1 / -1 in CSS makes this span all four columns */}
      <button
        className="koyko-footer__back-to-top"
        onClick={handleBackToTop}
        aria-label="Scroll back to top of page"
      >
        Back to top &gt;
      </button>

    </footer>
  );
}

export default KoykoFooter;
