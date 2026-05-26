// KoykoProcessV2 — V2-styled body for the /process page.
//
// Renders the 4-stage client journey using Syne / Noto Sans JP / JetBrains
// Mono typography and the --v2-* token system. Themes (blanco / negro /
// naranjo) come for free because every selector lives under the .home-v2
// wrapper supplied by the parent view (ProcessV2.jsx).
//
// Animations match the rest of the site:
//   • Header fades up once on mount.
//   • Each stage fades up when it enters the viewport on scroll.

'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ── Page content (mirrors the v1 KoykoProcessPage data) ─────────────────────

const STAGES = [
  {
    number: '01',
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
    number: '02',
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
        // fullWidth — this card spans both columns on ≥720px
        body: 'I build out the rest of the site, keeping things consistent and sending each section to you for review.',
        fullWidth: true,
      },
    ],
    notice: {
      strong: 'Revision policy:',
      body: 'you get one round of feedback per stage, with a 24-hour window to respond. This keeps the project moving and gets your site done faster.',
    },
  },
  {
    number: '03',
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
    number: '04',
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

// ── Component ────────────────────────────────────────────────────────────────

export default function KoykoProcessV2() {
  const headerRef = useRef(null);
  // One ref per stage section, stored in an array
  const stageRefs = useRef([]);

  useEffect(() => {
    // Header fades up on mount
    gsap.fromTo(
      headerRef.current,
      { autoAlpha: 0, y: 16 },
      { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out' }
    );

    // Each stage fades up when scrolled into view
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
          delay: i * 0.05,
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
          },
        }
      );
    });

    // Clean up ScrollTrigger instances on unmount
    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <main className="v2-process-page__main">

      {/* ── Header ── */}
      <header className="v2-process-page__header" ref={headerRef}>
        <p className="v2-process-page__eyebrow">K O Y K O&nbsp;&nbsp;D E S I G N</p>
        <h1 className="v2-process-page__title">
          Your journey, from idea to <em>launch</em>
        </h1>
        <p className="v2-process-page__subtitle">
          Here&apos;s exactly what working together looks like — no surprises, no guesswork.
        </p>
      </header>

      {/* ── Stages ── */}
      {STAGES.map((stage, i) => (
        <div key={stage.number}>

          {/* Mono down-arrow between stages (skip before the first) */}
          {i > 0 && (
            <div className="v2-process-page__connector" aria-hidden="true">↓</div>
          )}

          <section
            className="v2-process-page__stage"
            ref={(el) => (stageRefs.current[i] = el)}
          >
            {/* Stage header — large display number + Syne title with italic accent */}
            <div className="v2-process-page__stage-header">
              <div className="v2-process-page__stage-number" aria-hidden="true">
                {stage.number}
              </div>
              <h2 className="v2-process-page__stage-title">
                {stage.title} <em>{stage.em}</em>
              </h2>
            </div>

            {/* Cards grid */}
            <div className="v2-process-page__cards">
              {stage.cards.map((card) => (
                <div
                  key={card.tag}
                  className={`v2-process-page__card${card.fullWidth ? ' v2-process-page__card--full' : ''}`}
                >
                  <p className="v2-process-page__card-tag">{card.tag}</p>
                  <h3 className="v2-process-page__card-heading">{card.heading}</h3>
                  <p className="v2-process-page__card-body">{card.body}</p>
                </div>
              ))}
            </div>

            {/* Notice bar (only on stages that have one) */}
            {stage.notice && (
              <div className="v2-process-page__notice">
                <div className="v2-process-page__notice-bar" aria-hidden="true" />
                <p>
                  <strong>{stage.notice.strong}</strong> {stage.notice.body}
                </p>
              </div>
            )}
          </section>
        </div>
      ))}

      {/* ── Closing CTA — keeps the email handoff that v1 had ── */}
      <div className="v2-process-page__cta">
        <p className="v2-process-page__cta-prompt">Questions before getting started?</p>
        <a className="v2-process-page__cta-mail" href="mailto:hello@koykodesign.com">
          hello@koykodesign.com
        </a>
      </div>

    </main>
  );
}
