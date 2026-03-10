import { gsap } from 'gsap';

// --- REVEAL (page enter) ---
// The block is currently covering the screen (scaleX: 1).
// We change the transform origin to 'right' so it collapses to the right,
// sweeping off-screen and revealing the new page underneath.
export function revealTransition() {
  return new Promise((resolve) => {
    gsap.set('.block', {
      transformOrigin: 'right', // collapse toward the right edge
    });

    gsap.to('.block', {
      scaleX: 0,
      duration: 0.7,
      ease: 'expo.inOut',
      onComplete: resolve,
    });
  });
}

// --- ANIMATE OUT (page exit) ---
// The block starts flat (scaleX: 0) and sweeps in from the left,
// covering the screen before the new route is pushed.
export function animateTransition() {
  return new Promise((resolve) => {
    gsap.set('.block', {
      visibility: 'visible',
      scaleX: 0,
      transformOrigin: 'left', // expand from the left edge
    });

    gsap.to('.block', {
      scaleX: 1,
      duration: 0.7,
      ease: 'expo.inOut',
      onComplete: resolve,
    });
  });
}

// --- INITIAL LOAD REVEAL ---
// If the landing page adds .run-reveal to <body>, we start with the block
// fully covering the screen and animate it away on first load.
export function setupInitialRevealIfNeeded() {
  if (document.body.classList.contains('run-reveal')) {
    gsap.set('.block', {
      visibility: 'visible',
      scaleX: 1,
      transformOrigin: 'right',
    });

    revealTransition().then(() => {
      gsap.set('.block', { visibility: 'hidden' });
      document.body.classList.remove('run-reveal');
    });
  }
}
