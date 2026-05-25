'use client';

import Link from 'next/link';

// Portfolio grid — three project cards, each using its iOS-style icon.
// `id` matches the case-study id in src/data/caseStudies.js so the card
// links to /casestudies-v2/[id].
const PROJECTS = [
  {
    id:    'nerdecks',
    num:   '01',
    title: 'NERDECKS',
    tag:   'flashcards · ai',
    src:   '/assets/images/logoNerdecks.png',
  },
  {
    id:    'kumo-ramen',
    num:   '02',
    title: 'KUMO RAMEN',
    tag:   'brand · web',
    src:   '/assets/images/logoIOSkumo.png',
  },
  {
    id:    'socratic-js',
    num:   '03',
    title: 'SOCRATIC JS',
    tag:   'teach · cli · oss',
    src:   '/assets/images/logoiconIOSSocraticJS.png',
  },
];

export default function KoykoPortfolioV2() {
  return (
    <section className="v2-portfolio" aria-label="Selected work">
      {/* Heading row: kicker (left) + live count (right) */}
      <div className="v2-portfolio__heading">
        <span className="v2-portfolio__kicker">{'{ selected_work }'}</span>
        <span className="v2-portfolio__count">03 · live</span>
      </div>

      <div className="v2-portfolio__grid">
        {PROJECTS.map(({ id, num, title, tag, src }) => (
          <Link
            key={id}
            href={`/casestudies-v2/${id}`}
            className="v2-card"
            aria-label={`Open ${title} case study`}
          >
            <div className="v2-card__thumb">
              <img src={src} alt={`${title} icon`} />
            </div>
            <div className="v2-card__meta">
              <span className="v2-card__num">{num}</span>
              <h3 className="v2-card__title">{title}</h3>
              <span className="v2-card__tag">{tag}</span>
            </div>
            <span className="v2-card__open">open →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
