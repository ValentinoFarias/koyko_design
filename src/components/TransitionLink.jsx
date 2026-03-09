import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { animateTransition } from '../assets/anim/pageTransitions.js';

function TransitionLink({ to, children, className, ...rest }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (event) => {
    if (rest.onClick) {
      rest.onClick(event);
    }

    if (event.defaultPrevented) {
      return;
    }

    if (!to || location.pathname === to) {
      event.preventDefault();
      return;
    }

    event.preventDefault();

    animateTransition().then(() => {
      navigate(to);
    });
  };

  return (
    <a href={to} className={className} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}

export default TransitionLink;
