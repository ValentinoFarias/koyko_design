import React from 'react';

// A single full-screen block that sweeps horizontally across the screen.
// GSAP will animate its scaleX to cover/uncover the page during transitions.
function TransitionOverlay() {
  return (
    <div className="transitionContainer">
      <div className="block"></div>
    </div>
  );
}

export default TransitionOverlay;
