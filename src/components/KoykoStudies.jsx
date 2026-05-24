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

  // ── Normalise each media slot ─────────────────────────────────────────────
  // A slot can be a plain string (src only) or an object with extra options:
  //   { src: '...', scale: 1.2, position: '50% 30%' }
  // normalizeMedia() guarantees every slot becomes a full object so the rest
  // of the component never has to check which format it received.
  function normalizeMedia(item) {
    if (!item) return null;
    if (typeof item === 'string') return { src: item, scale: 1, position: '50% 50%', posterTime: null };
    // Object form — spread defaults first so any provided key wins.
    return { scale: 1, position: '50% 50%', posterTime: null, ...item };
  }

  // ── Split the 6 slots into 3 pairs (rows) ────────────────────────────────
  const imagePairs = [
    [normalizeMedia(study.images[0]), normalizeMedia(study.images[1])],
    [normalizeMedia(study.images[2]), normalizeMedia(study.images[3])],
    [normalizeMedia(study.images[4]), normalizeMedia(study.images[5])],
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

        {/* Image gallery — 3 rows × 2 images.
            Slots can hold either an image (.webp/.jpg/etc.) or a video (.mp4).
            We detect the file type by checking the extension and render the
            appropriate element so both always occupy the same grid cell size. */}
        <div className="koyko-studies__gallery">
          {imagePairs.map((pair, rowIndex) => (
            <div key={rowIndex} className="koyko-studies__gallery-row">
              {pair.map((media, imgIndex) => {
                if (!media) return null;

                // Destructure the normalised media object.
                // scale, position, and posterTime are all optional — normalizeMedia()
                // guarantees they exist with sensible defaults.
                const { src, scale, position, posterTime } = media;

                // Check whether this slot is a video file.
                const isVideo = src.endsWith('.mp4');

                // The very first slot is visible on load — keep it eager.
                // Every other slot is below the fold — defer loading.
                const isFirstSlot = rowIndex === 0 && imgIndex === 0;

                // CSS custom properties passed as inline styles.
                // The stylesheet reads these via var(--video-scale) and var(--video-pos).
                const mediaStyle = {
                  '--video-scale': scale,
                  '--video-pos':   position,
                };

                if (isVideo) {
                  return (
                    <video
                      key={imgIndex}
                      src={src}
                      className="koyko-studies__img koyko-studies__video"
                      style={mediaStyle}
                      controls
                      muted
                      loop
                      playsInline
                      // metadata must load so we can seek to the poster frame.
                      // Without at least 'metadata', currentTime seeks are ignored.
                      preload="metadata"
                      // onLoadedMetadata fires once the browser knows the video's
                      // duration and dimensions. At that point we can safely seek
                      // to any timestamp — the browser will decode and freeze that
                      // frame as the visible cover until the user presses play.
                      onLoadedMetadata={(e) => {
                        if (posterTime != null) e.target.currentTime = posterTime;
                      }}
                    />
                  );
                }

                return (
                  <img
                    key={imgIndex}
                    src={src}
                    alt={`${study.title} — project image ${rowIndex * 2 + imgIndex + 1}`}
                    className="koyko-studies__img"
                    style={mediaStyle}
                    loading={isFirstSlot ? 'eager' : 'lazy'}
                  />
                );
              })}
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
          {/* Preview image — lazy loaded since it's only revealed on hover */}
          {prev.images[0] && (
            <img
              src={prev.images[0]}
              alt=""
              className="koyko-studies__nav-preview"
              aria-hidden="true"
              loading="lazy"
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
              loading="lazy"
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
