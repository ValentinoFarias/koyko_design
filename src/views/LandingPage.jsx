'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import TransitionLink from '../components/TransitionLink.jsx';
import { setupInitialRevealIfNeeded, animateTransition } from '../assets/anim/pageTransitions.js';

function LandingPage() {
  // Two refs: one for the number (left edge), one for the % sign (right edge)
  const counterNumberRef = useRef(null);
  const counterPercentRef = useRef(null);
  const router = useRouter(); // used to navigate programmatically after the counter finishes

  useEffect(() => {
    // Only play the initial block-reveal on the very first visit to the site.
    // If the user navigates back to '/' from the navbar, skip it — no animation.
    const isFirstVisit = !sessionStorage.getItem('koyko-visited');

    if (isFirstVisit) {
      sessionStorage.setItem('koyko-visited', 'true');
      document.body.classList.add('run-reveal');
      setupInitialRevealIfNeeded();
    }

    return () => {
      document.body.classList.remove('run-reveal');
    };
  }, []);

  useEffect(() => {
    // Wait for all fonts (including Inter from Google Fonts) to be ready
    // before starting the counter animation, so the correct typeface is
    // visible from the first frame rather than swapping mid-animation.
    const fontReadyPromise = document.fonts?.ready ?? Promise.resolve();
    fontReadyPromise.then(() => {
      const obj = { value: 0 };
      gsap.to(obj, {
        value: 100,
        duration: 3,
        ease: 'power1.inOut',
        onUpdate: () => {
          // Update only the number — the % sign is a separate static element
          if (counterNumberRef.current) {
            counterNumberRef.current.textContent = Math.round(obj.value);
          }
        },
        // When the counter reaches 100, wait 1 second, then fire the
        // block transition and navigate to the home page.
        onComplete: () => {
          setTimeout(() => {
            animateTransition().then(() => {
              router.push('/home');
            });
          }, 1000);
        },
      });
    });
  }, []);

  return (
    <main>
      <div className="landing-layout">
        {/* Number on the left edge, % sign on the right edge */}
        <div ref={counterNumberRef} className="landing-counter landing-counter--number">0</div>
        <div className="landing-logo-slot">
          <TransitionLink to="/home" className="logo-link d-inline-block">
            <lottie-player
              class="logoMain img-fluid w-100"
              src="/assets/anim/logoAnimation.json"
              background="#ffffff"
              speed="1"
              autoplay
            ></lottie-player>
          </TransitionLink>
        </div>
        <div ref={counterPercentRef} className="landing-counter landing-counter--percent">%</div>
      </div>
    </main>
  );
}

export default LandingPage;
