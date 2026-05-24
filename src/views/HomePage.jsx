'use client';

// HomePage — /home route
//
// This view is a thin orchestrator: it imports each section as its own
// component and renders them in page order. All visual logic lives in
// the individual Koyko* components under src/components/.
//
// Page order (top → bottom):
//   1. KoykoNavbar    — fixed top nav bar
//   2. KoykoHero      — full-viewport hero with wordmark + logo
//   3. KoykoMission   — dark brand-story section
//   4. KoykoFeatures  — scrolling ticker strip
//   5. KoykoPortfolio — right-aligned project screenshot
//   6. KoykoDesigned  — "DESIGNED WITH LOVE" heading
//   7. <hr>           — thin divider between designed and contact
//   8. KoykoContact   — CTA section with email arrow button
//   9. KoykoFooter    — logo + contact info + back-to-top

import KoykoNavbar   from '../components/KoykoNavbar';
import KoykoHero     from '../components/KoykoHero';
import KoykoMission  from '../components/KoykoMission';
import KoykoFeatures from '../components/KoykoFeatures';
import KoykoPortfolio from '../components/KoykoPortfolio';
import KoykoDesigned from '../components/KoykoDesigned';
import KoykoContact  from '../components/KoykoContact';
import KoykoFooter   from '../components/KoykoFooter';

function HomePage() {
  return (
    // koyko-page: white canvas, overflow-x hidden (contains the marquee)
    <div className="koyko-page">
      <KoykoNavbar />
      <KoykoHero />
      <KoykoMission />
      <KoykoFeatures />
      <KoykoPortfolio />
      <KoykoDesigned />

      {/* Thin 2px horizontal rule between "Designed With Love" and Contact */}
      <hr className="koyko-divider" />

      <KoykoContact />
      <KoykoFooter />
    </div>
  );
}

export default HomePage;
