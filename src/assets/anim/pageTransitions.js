import { gsap } from 'gsap';

export function revealTransition() {
  return new Promise((resolve) => {
    const tl = gsap.timeline({
      onComplete: resolve,
    });

    tl.fromTo(
      '.row-1 .block',
      { scaleY: 1 },
      {
        scaleY: 0,
        duration: 1,
        delay: 0.2,
        stagger: {
          each: 0.1,
          from: 'start',
          grid: [1, 5],
          axis: 'x',
        },
        ease: 'expo.inOut',
      },
      0
    );

    tl.fromTo(
      '.row-2 .block',
      { scaleY: 1 },
      {
        scaleY: 0,
        duration: 1,
        delay: 0.2,
        stagger: {
          each: 0.1,
          from: 'start',
          grid: [1, 5],
          axis: 'x',
        },
        ease: 'expo.inOut',
      },
      0
    );
  });
}

export function animateTransition() {
  return new Promise((resolve) => {
    gsap.set('.block', {
      visibility: 'visible',
      scaleY: 0,
    });

    const tl = gsap.timeline({
      onComplete: resolve,
    });

    tl.fromTo(
      '.row-1 .block',
      { scaleY: 0 },
      {
        scaleY: 1,
        duration: 1,
        delay: 0.2,
        stagger: {
          each: 0.1,
          from: 'end',
          grid: [1, 5],
          axis: 'x',
        },
        ease: 'expo.out',
      },
      0
    );

    tl.fromTo(
      '.row-2 .block',
      { scaleY: 0 },
      {
        scaleY: 1,
        duration: 1,
        delay: 0.2,
        stagger: {
          each: 0.1,
          from: 'end',
          grid: [1, 5],
          axis: 'x',
        },
        ease: 'expo.out',
      },
      0
    );
  });
}

export function setupInitialRevealIfNeeded() {
  if (document.body.classList.contains('run-reveal')) {
    gsap.set('.block', {
      visibility: 'visible',
      scaleY: 1,
    });

    revealTransition().then(() => {
      gsap.set('.block', { visibility: 'hidden' });
      document.body.classList.remove('run-reveal');
    });
  }
}
