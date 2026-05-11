// KoykoProcessPage — "Your journey with Koyko" standalone page
//
// Shows the 4-stage client journey: Getting Started → Design → Go Live → After Launch.
// Each stage fades up on scroll using GSAP ScrollTrigger (matches site animation pattern).
// Standalone — no navbar or footer, designed to be shared directly with prospective clients.

'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ── All page content defined here so the JSX stays readable ──────────────────

const STAGES = [
  {
    number: '1',
    title: 'Getting',
    em: 'started',
    cards: [
      {
        tag: 'Discovery',
        heading: 'We have a chat',
        body: "Tell me about your business, your goals, and what's not working with your current site. No pressure — just a conversation.",
      },
      {
        tag: 'Proposal',
        heading: 'You receive a proposal',
        body: 'A clear document with scope, timeline, and price. No hidden fees. You sign and send a first payment to kick things off.',
      },
    ],
    notice: {
      strong: 'Kickoff call:',
      body: "once you're on board, we lock in dates and go through everything I'll need from you — logo, copy, images, brand colours.",
    },
  },
  {
    number: '2',
    title: 'The',
    em: 'design',
    cards: [
      {
        tag: 'Structure',
        heading: 'Site map & layout',
        body: 'We map out all your pages and how they connect. You approve the structure before any design begins.',
      },
      {
        tag: 'Design',
        heading: 'Homepage first',
        body: 'I design the homepage, walk you through every decision via a video, and take your feedback on board.',
      },
      {
        tag: 'Build',
        heading: 'All other pages',
        body: 'I build out the rest of the site, keeping things consistent and sending each section to you for review.',
        fullWidth: true, // this card spans both columns
      },
    ],
    notice: {
      strong: 'Revision policy:',
      body: 'you get one round of feedback per stage, with a 24-hour window to respond. This keeps the project moving and gets your site done faster.',
    },
  },
  {
    number: '3',
    title: 'Going',
    em: 'live',
    cards: [
      {
        tag: 'Pre-launch',
        heading: 'Final checks',
        body: 'I test every form, link, and page — so nothing breaks the moment your customers arrive.',
      },
      {
        tag: 'Launch',
        heading: 'Your site goes live',
        body: "We pick a time that works for your business and make it happen. You'll be the first to know when it's up.",
      },
    ],
  },
  {
    number: '4',
    title: 'After',
    em: 'launch',
    cards: [
      {
        tag: 'Support',
        heading: 'You get a personal guide',
        body: 'A document with video walkthroughs showing exactly how to manage your site — yours to keep forever.',
      },
      {
        tag: 'Ongoing',
        heading: 'We stay in touch',
        body: "I check in from time to time. If you ever need updates, new pages, or a fresh direction — I'm here.",
      },
    ],
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

function KoykoProcessPage() {
  const headerRef = useRef(null);
  // One ref per stage — stored in an array
  const stageRefs = useRef([]);

  useEffect(() => {
    // Animate the header in on load
    gsap.fromTo(
      headerRef.current,
      { autoAlpha: 0, y: 16 },
      { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out' }
    );

    // Each stage fades up when it enters the viewport while scrolling
    stageRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 20 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          delay: i * 0.05, // slight stagger so stages don't all pop at once
          scrollTrigger: {
            trigger: el,
            start: 'top 85%', // start when top of stage is 85% down the viewport
          },
        }
      );
    });

    // Clean up all ScrollTrigger instances when the component unmounts
    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div className="koyko-process__wrapper">

      {/* ── Header ── */}
      <header className="koyko-process__header" ref={headerRef}>
        <p className="koyko-process__eyebrow">Koyko Design Studio</p>
        <h1 className="koyko-process__title">
          Your journey,<br /><em>from idea to launch</em>
        </h1>
        <p className="koyko-process__subtitle">
          Here&apos;s exactly what working together looks like — no surprises, no guesswork.
        </p>
      </header>

      {/* ── Stages ── */}
      {STAGES.map((stage, i) => (
        <div key={stage.number}>

          {/* Connector arrow between stages (not before the first one) */}
          {i > 0 && (
            <div className="koyko-process__connector" aria-hidden="true">↓</div>
          )}

          <section
            className="koyko-process__stage"
            ref={(el) => (stageRefs.current[i] = el)}
          >
            {/* Stage heading — number circle + title */}
            <div className="koyko-process__stage-header">
              <div className="koyko-process__stage-number" aria-hidden="true">
                {stage.number}
              </div>
              <h2 className="koyko-process__stage-title">
                {stage.title} <em>{stage.em}</em>
              </h2>
            </div>

            {/* Cards grid */}
            <div className="koyko-process__cards">
              {stage.cards.map((card) => (
                <div
                  key={card.tag}
                  className={`koyko-process__card${card.fullWidth ? ' koyko-process__card--full' : ''}`}
                >
                  <p className="koyko-process__card-tag">{card.tag}</p>
                  <h3 className="koyko-process__card-heading">{card.heading}</h3>
                  <p className="koyko-process__card-body">{card.body}</p>
                </div>
              ))}
            </div>

            {/* Notice bar — only shown on stages that have one */}
            {stage.notice && (
              <div className="koyko-process__notice">
                <div className="koyko-process__notice-dot" aria-hidden="true" />
                <p>
                  <strong>{stage.notice.strong}</strong> {stage.notice.body}
                </p>
              </div>
            )}
          </section>
        </div>
      ))}

      {/* ── Footer ── */}
      <footer className="koyko-process__footer">
        <p>Questions before getting started?</p>
        <p>
          <a href="mailto:hello@koykodesign.com">hello@koykodesign.com</a>
        </p>
        <div className="koyko-process__signature">Koyko</div>
      </footer>

    </div>
  );
}

export default KoykoProcessPage;
