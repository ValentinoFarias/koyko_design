'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';
import { revealTransition } from '../assets/anim/pageTransitions';

function TransitionRouterSync() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const firstBlock = document.querySelector('.block');
    if (!firstBlock) {
      return;
    }

    if (window.getComputedStyle(firstBlock).visibility !== 'visible') {
      return;
    }

    revealTransition().then(() => {
      gsap.set('.block', { visibility: 'hidden' });
    });
  }, [pathname]);

  return null;
}

export default TransitionRouterSync;
