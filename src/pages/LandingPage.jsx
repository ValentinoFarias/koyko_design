import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import TransitionLink from '../components/TransitionLink.jsx';

function LandingPage() {
  const counterRef = useRef(null);

  useEffect(() => {
    const obj = { value: 0 };
    gsap.to(obj, {
      value: 100,
      duration: 3,
      ease: 'power1.inOut',
      onUpdate: () => {
        if (counterRef.current) {
          counterRef.current.textContent = Math.round(obj.value) + '%';
        }
      },
    });
  }, []);

  return (
    <main>
      <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div ref={counterRef} className="landing-counter">0%</div>
        <div className="w-100 text-center">
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
      </div>
    </main>
  );
}

export default LandingPage;
