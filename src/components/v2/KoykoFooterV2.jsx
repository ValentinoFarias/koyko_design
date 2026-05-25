'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

// Smooth-scrolls back to the top of the page.
const handleBackToTop = () =>
  window.scrollTo({ top: 0, behavior: 'smooth' });

// useMouseTrailImage — appends an image to the footer that follows the
// cursor while a trigger element is hovered. Ported from the v1
// KoykoFooter (which used it for the phone-number reveal on
// "ask for valentino"). Skipped entirely on touch devices.
function useMouseTrailImage(triggerRef, imageSrc) {
  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    // No mouse → nothing to trail
    if (window.matchMedia('(pointer: coarse)').matches) return;

    // The trail image is appended to <footer> (the trigger's ancestor)
    // so it can move freely across the whole footer area, not just the
    // small trigger element.
    const footer = trigger.closest('footer');
    if (!footer) return;

    const img = document.createElement('img');
    img.src = imageSrc;
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    img.className = 'v2-foot__trail-img';

    // xPercent/yPercent center the image around the cursor.
    gsap.set(img, { opacity: 0, x: 0, y: 0, xPercent: -50, yPercent: -50 });
    footer.appendChild(img);

    const onEnter = () =>
      gsap.to(img, { opacity: 1, duration: 0.3, ease: 'power2.out' });

    const onMove = (e) => {
      const rect = footer.getBoundingClientRect();
      gsap.to(img, {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        duration: 0.4,         // small delay creates the "trail" feel
        ease: 'power2.out',
      });
    };

    const onLeave = () =>
      gsap.to(img, { opacity: 0, duration: 0.3, ease: 'power2.in' });

    trigger.addEventListener('mouseenter', onEnter);
    trigger.addEventListener('mousemove',  onMove);
    trigger.addEventListener('mouseleave', onLeave);

    return () => {
      trigger.removeEventListener('mouseenter', onEnter);
      trigger.removeEventListener('mousemove',  onMove);
      trigger.removeEventListener('mouseleave', onLeave);
      gsap.killTweensOf(img);
      img.remove();
    };
  }, [triggerRef, imageSrc]);
}

export default function KoykoFooterV2() {
  // Ref attached to the entire "say hi" column — hovering anywhere in it
  // (whatsapp / telegram / "ask for valentino") reveals a phone-number
  // image that trails the cursor across the footer. Matches the v1 hit
  // area: the muted "ask for valentino" span alone is too small.
  const sayHiRef = useRef(null);
  useMouseTrailImage(sayHiRef, '/assets/images/phoneNumber.jpg');

  return (
    <footer className="v2-foot">

      {/* Left figure mark — uses the v2 logoFigura (just the silhouette) */}
      <div className="v2-foot__left">
        <img
          className="v2-foot__figure"
          src="/assets/images/v2images/logoFigura.svg"
          alt=""
          aria-hidden="true"
        />
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

      {/* Col 2: say hi / messaging channels. Hovering anywhere in this
          column triggers the phone-number trail (see sayHiRef + hook). */}
      <div ref={sayHiRef} className="v2-foot__col">
        <span className="v2-foot__h">say hi</span>
        <a className="v2-foot__a v2-foot__a--sm" href="#">whatsapp</a>
        <a className="v2-foot__a v2-foot__a--sm" href="#">telegram</a>
        <span className="v2-foot__a v2-foot__a--sm v2-foot__a--mute">
          ask for valentino
        </span>
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
