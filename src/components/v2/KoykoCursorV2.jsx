'use client';

import { useEffect, useRef } from 'react';

// Selectors that trigger the enlarged "hot" cursor state
const HOT = '.v2-nav__link';

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
    const onLeave = ()  => { cursor.style.opacity = '0'; };
    const onEnter = ()  => { cursor.style.opacity = '1'; };

    const tick = () => {
      x += (tx - x) * speed;
      y += (ty - y) * speed;
      cursor.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Hot state: expand and fill on interactive elements
    const addHot    = () => cursor.classList.add('is-hot');
    const removeHot = () => cursor.classList.remove('is-hot');

    const bindHot = () => {
      document.querySelectorAll(HOT).forEach((el) => {
        el.addEventListener('mouseenter', addHot);
        el.addEventListener('mouseleave', removeHot);
      });
    };
    bindHot();

    // Re-bind when new elements mount (e.g. section placeholders)
    const observer = new MutationObserver(bindHot);
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('mousemove',  onMove);
    window.addEventListener('mouseleave', onLeave);
    window.addEventListener('mouseenter', onEnter);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('mousemove',  onMove);
      window.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('mouseenter', onEnter);
    };
  }, []);

  return <div ref={cursorRef} className="v2-cursor" aria-hidden="true" />;
}
