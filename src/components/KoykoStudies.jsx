'use client';

// KoykoStudies — displays ONE case study at a time.
//
// It receives a projectId prop (from the URL: /casestudies/kumo-ramen).
// It looks up that project in CASE_STUDIES, shows its content,
// then renders a bottom navigation bar with the two neighbouring projects.
//
// Bottom nav logic:
//   - LEFT  button = previous project in the CASE_STUDIES array (wraps around)
//   - RIGHT button = next project in the CASE_STUDIES array (wraps around)
//   The array order matches the portfolio's left → center → right layout.
//
// To add a new project: edit src/data/caseStudies.js only.

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CASE_STUDIES } from '../data/caseStudies';
import { animateTransition } from '../assets/anim/pageTransitions';

function KoykoStudies({ projectId }) {
  const router = useRouter();

  // ── Find the current study by its id ──────────────────────────────────────
  const currentIndex = CASE_STUDIES.findIndex((s) => s.id === projectId);
  const study = CASE_STUDIES[currentIndex];

  // If the id in the URL doesn't match any study, render nothing.
  // This prevents a crash if someone types a bad URL.
  if (!study) return null;

  const n = CASE_STUDIES.length;

  // Wrap-around neighbours:
  //   (currentIndex - 1 + n) % n  gives the last item when index is 0
  //   (currentIndex + 1) % n      gives the first item when at the end
  const prev = CASE_STUDIES[(currentIndex - 1 + n) % n];
  const next = CASE_STUDIES[(currentIndex + 1) % n];

  // ── Navigation with page transition ───────────────────────────────────────
  // Same pattern used in KoykoPortfolio — animateTransition() fires the wipe,
  // then router.push() navigates once the curtain is fully across.
  const navigateTo = useCallback(
    (id) => {
      animateTransition().then(() => {
        router.push(`/casestudies/${id}`);
      });
    },
    [router]
  );

  // ── Split the 6 images into 3 pairs (rows) ────────────────────────────────
  const imagePairs = [
    [study.images[0], study.images[1]],
    [study.images[2], study.images[3]],
    [study.images[4], study.images[5]],
  ];

  return (
    <section className="koyko-studies">

      {/* ── Case study content ─────────────────────────────────────────────── */}
      <article className="koyko-studies__entry">

        {/* Large editorial project title */}
        <h2 className="koyko-studies__title">{study.title}</h2>

        {/* Thin rule separating title from the info columns */}
        <hr className="koyko-studies__rule" />

        {/* Three info columns: services | project link | overview */}
        <div className="koyko-studies__info">

          <div className="koyko-studies__col">
            <p className="koyko-studies__col-label">services</p>
            <ul className="koyko-studies__services-list">
              {study.services.map((service) => (
                <li key={service}>{service}</li>
              ))}
            </ul>
          </div>

          <div className="koyko-studies__col">
            <p className="koyko-studies__col-label">project</p>
            <a
              href={study.siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="koyko-studies__link"
            >
              visit site
            </a>
          </div>

          <div className="koyko-studies__col">
            <p className="koyko-studies__col-label">overview</p>
            <p className="koyko-studies__overview-text">{study.overview}</p>
          </div>

        </div>

        {/* Image gallery — 3 rows × 2 images */}
        <div className="koyko-studies__gallery">
          {imagePairs.map((pair, rowIndex) => (
            <div key={rowIndex} className="koyko-studies__gallery-row">
              {pair.map((src, imgIndex) =>
                src ? (
                  <img
                    key={imgIndex}
                    src={src}
                    alt={`${study.title} — project image ${rowIndex * 2 + imgIndex + 1}`}
                    className="koyko-studies__img"
                  />
                ) : null
              )}
            </div>
          ))}
        </div>

      </article>

      {/* ── Bottom project navigator ───────────────────────────────────────── */}
      {/* Two buttons: ← previous project on the left, next project → on the right.
          Hovering reveals a thumbnail of that project's first image. */}
      <nav className="koyko-studies__nav" aria-label="Browse other projects">

        {/* LEFT — previous project */}
        <button
          className="koyko-studies__nav-btn koyko-studies__nav-btn--left"
          onClick={() => navigateTo(prev.id)}
          aria-label={`Go to ${prev.title}`}
        >
          {/* Preview image — hidden by default, revealed on hover via CSS */}
          {prev.images[0] && (
            <img
              src={prev.images[0]}
              alt=""
              className="koyko-studies__nav-preview"
              aria-hidden="true"
            />
          )}
          <span className="koyko-studies__nav-inner">
            <span className="koyko-studies__nav-arrow">←</span>
            <span className="koyko-studies__nav-label">{prev.title}</span>
          </span>
        </button>

        {/* RIGHT — next project */}
        <button
          className="koyko-studies__nav-btn koyko-studies__nav-btn--right"
          onClick={() => navigateTo(next.id)}
          aria-label={`Go to ${next.title}`}
        >
          {next.images[0] && (
            <img
              src={next.images[0]}
              alt=""
              className="koyko-studies__nav-preview"
              aria-hidden="true"
            />
          )}
          <span className="koyko-studies__nav-inner">
            <span className="koyko-studies__nav-label">{next.title}</span>
            <span className="koyko-studies__nav-arrow">→</span>
          </span>
        </button>

      </nav>

    </section>
  );
}

export default KoykoStudies;
