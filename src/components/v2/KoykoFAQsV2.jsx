// KoykoFAQsV2 — V2-styled body for the /faqs page.
//
// Renders 12 questions as a native <details>/<summary> accordion. Using the
// browser-native element keeps it fully accessible (keyboard + screen reader)
// and avoids extra JS for open/close state. Typography uses the same
// Syne / Noto Sans JP / JetBrains Mono stack and --v2-* tokens as the rest
// of the V2 site so all three themes (blanco / negro / naranjo) work for free.
//
// Animation matches the process page:
//   • Header fades up on mount.
//   • Each item fades up when it enters the viewport on scroll.

'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ── Page content ────────────────────────────────────────────────────────────

const FAQS = [
  {
    number: '01',
    question: 'What is a domain?',
    answer:
      "A domain is your website's address — yourrestaurant.com. You purchase it separately from a registrar (Namecheap, Google Domains, etc.) and renew it annually for around £10–£20/year. Think of it as your plot of land on the internet — without it, no one can find you.",
  },
  {
    number: '02',
    question: 'What is hosting?',
    answer:
      "Hosting is the server where your website actually lives — the files, the database, the images. Without it, your site isn't accessible online. Koyko uses professional infrastructure (Netlify + Supabase) — the same tools used by companies serving millions of users — so your site loads fast, stays online, and scales with you.",
  },
  {
    number: '03',
    question: "What's the difference between custom code and Squarespace or WordPress?",
    answer:
      "With Squarespace or WordPress, you're inside a platform that makes decisions for you — forced updates, plugin conflicts, design limitations. With custom code, the site is fully yours: no platform can raise their prices, push a breaking update, or limit what your site can do. You get a faster, more secure site built exactly for your business — with no lock-in to any platform, including Koyko.",
  },
  {
    number: '04',
    question: 'Does my website need maintenance?',
    answer:
      "Every live website does — especially one with bookings and payments. Browsers update, integrations shift, and the web moves fast. The good news: with a custom-built site, maintenance is predictable and contained. Nothing changes unless you decide it does. You're never at the mercy of a platform pushing an update overnight.",
  },
  {
    number: '05',
    question: 'What does website maintenance include?',
    answer:
      "For a site with live bookings and payments: uptime monitoring, critical bug fixes, and minor updates. Koyko's Care plan (£65/month) covers all of this — if the site goes down or payments break, it gets resolved with no extra charge. For a simple informational site, maintenance is minimal: occasional content updates and little else.",
  },
  {
    number: '06',
    question: 'Why is a custom site safer long-term than WordPress or plugins?',
    answer:
      "With WordPress, your site depends on third-party decisions you can't control. A plugin like Amelia could raise their prices, change their terms, or release an update that breaks your bookings — overnight, without warning. With a custom site, the code is yours. Nothing changes unless you want it to. Any developer can work on it — you're never locked in.",
  },
  {
    number: '07',
    question: 'Do WordPress, Wix or Squarespace have more maintenance issues?',
    answer:
      "Generally, yes. With custom code, any issue has a single source and is straightforward to fix. With third-party platforms, problems can come from WordPress core updates, plugin conflicts, or your hosting provider changing server settings — all without you touching anything. With Wix and Squarespace, updates are automatic and forced. With custom code, you're in control.",
  },
  {
    number: '08',
    question: 'What happens if something breaks after launch?',
    answer:
      'The first 30 days post-launch are covered as part of every project — any issue directly caused by the build gets resolved at no extra cost. After that, the Care plan (£65/month) covers critical bugs on an ongoing basis: site down, payments failing, bookings broken — fixed, no additional charge. New features or design changes are billed separately at £35/hour.',
  },
  {
    number: '09',
    question: "What's the difference between a bug and a new feature?",
    answer:
      "A bug is something agreed in the original scope that isn't working as expected — a confirmation email not sending, a payment failing unexpectedly. A new feature is something outside the original scope — a new page, a design change, a new integration. The distinction is always discussed transparently before any work begins. No surprises.",
  },
  {
    number: '10',
    question: 'Is it normal for issues to appear after launch?',
    answer:
      "Completely. Real users interact with a site in ways no testing environment can fully replicate. Edge cases surface, devices behave unexpectedly, and integrations occasionally need fine-tuning in production. It's not a sign of poor quality — it's how every software product works, from small websites to apps used by millions. What matters is having a clear plan for when it happens.",
  },
  {
    number: '11',
    question: 'What is the Care plan?',
    answer:
      "£65/month — hosting on professional infrastructure (Netlify + Supabase), uptime monitoring to catch issues before you notice them, and critical bug coverage. If something breaks that affects your clients' ability to book or pay, it gets fixed at no extra cost. Recommended for any site with live transactions.",
  },
  {
    number: '12',
    question: 'What technology does Koyko use?',
    answer:
      'Next.js, Supabase, Stripe, Netlify, Cloudflare — industry-standard tools used by companies worldwide. Everything is open, well-documented, and free of lock-in. The code is yours. Any developer can work on it, at any time.',
  },
];

// ── Component ────────────────────────────────────────────────────────────────

export default function KoykoFAQsV2() {
  const headerRef = useRef(null);
  // One ref per FAQ item, stored in an array
  const itemRefs = useRef([]);

  useEffect(() => {
    // Header fades up on mount
    gsap.fromTo(
      headerRef.current,
      { autoAlpha: 0, y: 16 },
      { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out' }
    );

    // Each item fades up when it scrolls into view
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 16 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out',
          delay: (i % 4) * 0.04,
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
          },
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <main className="v2-faqs-page__main">

      {/* ── Header ── */}
      <header className="v2-faqs-page__header" ref={headerRef}>
        <p className="v2-faqs-page__eyebrow">K O Y K O&nbsp;&nbsp;F A Q s</p>
        <h1 className="v2-faqs-page__title">
          Everything you might be <em>wondering</em>
        </h1>
        <p className="v2-faqs-page__subtitle">
          The honest answers to the questions clients ask most — domains, hosting, maintenance, and how working together actually works.
        </p>
      </header>

      {/* ── Accordion list — native <details>/<summary> for free a11y ── */}
      <ul className="v2-faqs-page__list">
        {FAQS.map((faq, i) => (
          <li
            key={faq.number}
            className="v2-faqs-page__item"
            ref={(el) => (itemRefs.current[i] = el)}
          >
            <details className="v2-faqs-page__details">
              <summary className="v2-faqs-page__summary">
                <span className="v2-faqs-page__num" aria-hidden="true">{faq.number}</span>
                <span className="v2-faqs-page__q">{faq.question}</span>
                {/* Mono +/- indicator — flips to − when the item is open */}
                <span className="v2-faqs-page__sign" aria-hidden="true">+</span>
              </summary>
              <div className="v2-faqs-page__answer">
                <p>{faq.answer}</p>
              </div>
            </details>
          </li>
        ))}
      </ul>

      {/* ── Closing CTA — same email handoff pattern as /process ── */}
      <div className="v2-faqs-page__cta">
        <p className="v2-faqs-page__cta-prompt">Still have a question?</p>
        <a className="v2-faqs-page__cta-mail" href="mailto:hello@koykodesign.com">
          hello@koykodesign.com
        </a>
      </div>

    </main>
  );
}
