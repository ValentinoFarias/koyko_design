'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { animateTransition } from '../assets/anim/pageTransitions.js';

function TransitionLink({ to, children, className, ...rest }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = (event) => {
    if (rest.onClick) {
      rest.onClick(event);
    }

    if (event.defaultPrevented) {
      return;
    }

    if (
      !to ||
      to.startsWith('http://') ||
      to.startsWith('https://') ||
      to.startsWith('mailto:') ||
      to.startsWith('tel:')
    ) {
      return;
    }

    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || rest.target === '_blank') {
      return;
    }

    if (pathname === to) {
      event.preventDefault();
      return;
    }

    event.preventDefault();

    animateTransition().then(() => {
      router.push(to);
    });
  };

  return (
    <a href={to} className={className} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}

export default TransitionLink;
