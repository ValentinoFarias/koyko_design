// KoykoHosting — Hosting & Care Plans, Notes, and Add-ons
//
// Renders three sub-sections below the packages comparison grid:
//   1. Hosting & Care Plans — monthly maintenance table (Basic / Care / Partner)
//   2. Notes               — clarifications on scope, revisions, content, etc.
//   3. Add-ons             — optional extras with pricing
//
// GSAP ScrollTrigger slide-in animation:
//   Card 1 (Hosting) → slides in from the LEFT
//   Card 2 (Notes)   → slides in from the RIGHT
//   Card 3 (Add-ons) → slides in from the LEFT
//   Trigger: when each card reaches 80% of the viewport height

'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

// Register ScrollTrigger plugin once at module level
gsap.registerPlugin(ScrollTrigger);

function KoykoHosting() {
  // One ref per card
  const card1Ref = useRef(null);
  const card2Ref = useRef(null);
  const card3Ref = useRef(null);

  useEffect(() => {
    // Cards alternate direction: left, right, left
    // xPercent: -100 = fully off-screen to the left
    //           100  = fully off-screen to the right
    const cards = [
      { el: card1Ref.current, from: -80 },  // left
      { el: card2Ref.current, from:  80 },  // right
      { el: card3Ref.current, from: -80 },  // left
    ];

    // Set all cards to their off-screen starting position before the page paints
    cards.forEach(({ el, from }) => {
      gsap.set(el, { x: from, opacity: 0 });
    });

    // Create a ScrollTrigger animation for each card individually
    const triggers = cards.map(({ el }) => {
      return gsap.to(el, {
        x: 0,          // slide into place
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 80%', // fire when the card top hits 80% down the viewport
          once: true,       // only animate in once
        },
      });
    });

    // Cleanup: kill all ScrollTrigger instances when the component unmounts
    return () => {
      triggers.forEach((t) => t.scrollTrigger?.kill());
    };
  }, []);

  return (
    <div className="koyko-table__hosting">

      {/* ---- Card 1: Hosting & Care Plans (slides from LEFT) ---- */}
      <div ref={card1Ref} className="koyko-hosting__card">
        <h2 className="koyko-table__hosting-title">HOSTING & CARE PLANS</h2>
        <hr className="koyko-table__hosting-rule" />

        <p className="koyko-table__hosting-intro">
          Optional monthly plans to keep your site live, secure, and maintained after launch.
        </p>

        <table className="koyko-table__plans">
          <thead>
            <tr>
              <th>PLAN</th>
              <th>PRICE</th>
              <th>INCLUDES</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Basic</strong></td>
              <td>£25 / month</td>
              <td>Hosting + security updates</td>
            </tr>
            <tr>
              <td><strong>Care</strong></td>
              <td>£60 / month</td>
              <td>Hosting + updates + 1 hour of changes per month</td>
            </tr>
            <tr>
              <td><strong>Partner</strong></td>
              <td>£120 / month</td>
              <td>Hosting + updates + 3 hours of changes per month</td>
            </tr>
          </tbody>
        </table>

        <p className="koyko-table__hosting-note">
          <em>
            Care and Partner plans include a dedicated response within 48 hours for any issue.
            <br />
            Hosting is self-arranged if no plan is selected — I can recommend providers.
          </em>
        </p>
      </div>

      {/* ---- Card 2: Notes (slides from RIGHT) ---- */}
      <div ref={card2Ref} className="koyko-hosting__card">
        <h2 className="koyko-table__hosting-title">NOTES</h2>
        <hr className="koyko-table__hosting-rule" />

        <ul className="koyko-table__notes">
          <li>Number of pages, revision rounds, and delivery time are confirmed in writing before any project begins.</li>
          <li>&quot;Pages&quot; refers to unique page designs — not content volume.</li>
          <li>&quot;Design system&quot; means a documented set of typography, colour tokens, spacing rules, and reusable components.</li>
          <li>&quot;Advanced interactions&quot; covers scroll-triggered animations, custom cursor effects, parallax, and similar.</li>
          <li>&quot;Performance audit&quot; includes Core Web Vitals review, image optimisation, and load speed recommendations.</li>
          <li>Content (copy, images, assets) is provided by the client unless copywriting is added as an add-on.</li>
          <li>All projects begin with a discovery call to scope requirements before a quote is confirmed.</li>
        </ul>

        <p className="koyko-table__payment">
          Payment: 50% upfront to begin, 50% on launch.<br />
          VAT not included. Prices in GBP.
        </p>
      </div>

      {/* ---- Card 3: Add-ons (slides from LEFT) ---- */}
      <div ref={card3Ref} className="koyko-hosting__card">
        <h2 className="koyko-table__hosting-title">ADD-ONS</h2>
        <hr className="koyko-table__hosting-rule" />

        <ul className="koyko-table__notes">
          <li>E-commerce (Signature only) — from £600 depending on scope</li>
          <li>Logo & brand identity — from £300</li>
          <li>Copywriting support — from £150 per page</li>
          <li>Rush delivery (under 2 weeks) — +25% on project price</li>
          <li>Extra revision rounds — £80 per round</li>
          <li>Domain setup & configuration — £50 one-off</li>
        </ul>
      </div>

    </div>
  );
}

export default KoykoHosting;
