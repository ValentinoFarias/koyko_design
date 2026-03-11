// KoykoPortfolio — featured project showcase
//
// Displays a right-aligned screenshot of the Nerdecks project.
// The section anchor id="packages" matches the nav link "p a c k a g e s".
//
// Layout:
//   - The outer section (koyko-portfolio) is a flex container that pushes
//     content to the right with justify-content: flex-end
//   - The image wrapper (koyko-portfolio__item) clips overflow so only
//     part of the screenshot is visible, matching the Figma crop

import { PORTFOLIO } from '../assets/koykoAssets';

function KoykoPortfolio() {
  return (
    <section
      className="koyko-portfolio"
      id="packages"           // targeted by the "p a c k a g e s" nav link
      aria-label="Portfolio"
    >
      {/* Clipping container — right side of the page, ~50% of viewport width */}
      <div className="koyko-portfolio__item">
        <img
          src={PORTFOLIO}
          alt="Featured project: Nerdecks website"
          className="koyko-portfolio__img"
        />
      </div>
    </section>
  );
}

export default KoykoPortfolio;
