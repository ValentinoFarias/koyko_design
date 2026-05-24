'use client';

import { useEffect, useRef } from 'react';

// Selectors that trigger the enlarged "hot" cursor state
const HOT = '.v2-nav__link, .v2-nav__brand, .v2-theme-dot';
// Containers where the custom cursor should be visible at all
const ACTIVE_ZONES = '.v2-nav, .v2-theme-picker';

export default function KoykoCursorV2() {
  const cursorRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x, ty = y;
    const speed = 0.22; // lag factor — lower = more lag
    let raf;

    const onMove  = (e) => { tx = e.clientX; ty = e.clientY; };
    // Activate the custom cursor only while the pointer is inside the navbar.
    const activate   = () => cursor.classList.add('is-active');
    const deactivate = () => cursor.classList.remove('is-active');

    const tick = () => {
      x += (tx - x) * speed;
      y += (ty - y) * speed;
      cursor.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Hot state: expand and fill on interactive elements.
    // Theme dots also tint the bloom using their own --dot color.
    // Treat very dark dot colors as "invert" mode, since mix-blend-mode:
    // difference cancels out against black and produces no bloom.
    const isDark = (hex) => {
      const m = hex.replace('#', '').match(/.{1,2}/g);
      if (!m || m.length < 3) return false;
      const [r, g, b] = m.map((h) => parseInt(h, 16));
      // Rec.601 luma — under ~40 it's effectively black
      return (0.299 * r + 0.587 * g + 0.114 * b) < 40;
    };

    const addHot = (e) => {
      const el = e.currentTarget;
      // Read the dot's color (set inline as --dot) and apply it to the cursor.
      const dotColor = el.style.getPropertyValue('--dot').trim();
      if (dotColor) {
        cursor.style.setProperty('--v2-cursor-color', dotColor);
        if (isDark(dotColor)) cursor.classList.add('is-invert');
      }
      cursor.classList.add('is-hot');
    };
    const removeHot = () => {
      cursor.classList.remove('is-hot', 'is-invert');
      cursor.style.removeProperty('--v2-cursor-color');
    };

    // Track bound elements so we don't double-bind on re-runs of the observer.
    const bound = new WeakSet();

    const bindHot = () => {
      document.querySelectorAll(HOT).forEach((el) => {
        if (bound.has(el)) return;
        bound.add(el);
        el.addEventListener('mouseenter', addHot);
        el.addEventListener('mouseleave', removeHot);
      });
    };

    const bindZones = () => {
      document.querySelectorAll(ACTIVE_ZONES).forEach((el) => {
        if (bound.has(el)) return;
        bound.add(el);
        el.addEventListener('mouseenter', activate);
        el.addEventListener('mouseleave', deactivate);
      });
    };

    bindHot();
    bindZones();

    // Re-bind when new elements mount (e.g. section placeholders)
    const observer = new MutationObserver(() => { bindHot(); bindZones(); });
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('mousemove', onMove);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return <div ref={cursorRef} className="v2-cursor" aria-hidden="true" />;
}
