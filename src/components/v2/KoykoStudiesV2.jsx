'use client';

// KoykoStudiesV2 — v2-styled re-skin of KoykoStudies.
//
// Displays ONE case study at a time. Receives projectId from the dynamic
// /casestudies/[id] route. Same logic as v1 KoykoStudies — data from
// CASE_STUDIES, image-pair split, video poster-frame seek, prev/next
// wrap-around — but uses plain Next <Link> navigation (no curtain wipe).

import Link from 'next/link';
import { CASE_STUDIES } from '../../data/caseStudies';

// A slot in `images` can be a plain string OR an object with extra options:
//   { src, scale, position, posterTime }
// This wrapper guarantees every slot becomes a full object so downstream
// code never has to branch on the shape.
function normalizeMedia(item) {
  if (!item) return null;
  if (typeof item === 'string') {
    return { src: item, scale: 1, position: '50% 50%', posterTime: null };
  }
  return { scale: 1, position: '50% 50%', posterTime: null, ...item };
}

// Pulls the URL out of either form (string or { src }) — used for the
// nav-preview thumbnails where we don't need scale/position.
function previewSrc(item) {
  if (!item) return null;
  return typeof item === 'string' ? item : item.src;
}

export default function KoykoStudiesV2({ projectId }) {
  // ── Locate the current study by id ──────────────────────────────────────
  const currentIndex = CASE_STUDIES.findIndex((s) => s.id === projectId);
  const study = CASE_STUDIES[currentIndex];
  if (!study) return null;                          // unknown id → render nothing

  // Wrap-around neighbours for the bottom prev/next nav
  const n = CASE_STUDIES.length;
  const prev = CASE_STUDIES[(currentIndex - 1 + n) % n];
  const next = CASE_STUDIES[(currentIndex + 1) % n];

  // Split the 6 image slots into 3 pairs (rows)
  const imagePairs = [
    [normalizeMedia(study.images[0]), normalizeMedia(study.images[1])],
    [normalizeMedia(study.images[2]), normalizeMedia(study.images[3])],
    [normalizeMedia(study.images[4]), normalizeMedia(study.images[5])],
  ];

  return (
    <section className="v2-studies">
      <article className="v2-studies__entry">

        {/* Editorial project title */}
        <h2 className="v2-studies__title">{study.title}</h2>
        <hr className="v2-studies__rule" />

        {/* Three info columns: services | project link | overview */}
        <div className="v2-studies__info">
          <div className="v2-studies__col">
            <p className="v2-studies__col-label">services</p>
            <ul className="v2-studies__services-list">
              {study.services.map((service) => (
                <li key={service}>{service}</li>
              ))}
            </ul>
          </div>

          <div className="v2-studies__col">
            <p className="v2-studies__col-label">project</p>
            <a
              href={study.siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="v2-studies__link"
            >
              visit site →
            </a>
          </div>

          <div className="v2-studies__col">
            <p className="v2-studies__col-label">overview</p>
            <p className="v2-studies__overview-text">{study.overview}</p>
          </div>
        </div>

        {/* 3 rows × 2 cols gallery. Slots can be image OR video (.mp4).
            We detect by extension so both end up in identical grid cells. */}
        <div className="v2-studies__gallery">
          {imagePairs.map((pair, rowIndex) => (
            <div key={rowIndex} className="v2-studies__gallery-row">
              {pair.map((media, imgIndex) => {
                if (!media) return null;
                const { src, scale, position, posterTime } = media;
                const isVideo     = src.endsWith('.mp4');
                const isFirstSlot = rowIndex === 0 && imgIndex === 0;

                // CSS custom properties consumed by .v2-studies__img:
                //   --video-scale → applied as transform: scale(...)
                //   --video-pos   → applied as object-position
                const mediaStyle = {
                  '--video-scale': scale,
                  '--video-pos':   position,
                };

                if (isVideo) {
                  return (
                    <video
                      key={imgIndex}
                      src={src}
                      className="v2-studies__img v2-studies__video"
                      style={mediaStyle}
                      controls
                      muted
                      loop
                      playsInline
                      // metadata must load so we can seek to the poster frame
                      preload="metadata"
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
                    className="v2-studies__img"
                    style={mediaStyle}
                    loading={isFirstSlot ? 'eager' : 'lazy'}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </article>

      {/* Bottom project navigator — prev on the left, next on the right.
          Hovering reveals a low-opacity preview thumbnail behind the label. */}
      <nav className="v2-studies__nav" aria-label="Browse other projects">
        <Link
          href={`/casestudies/${prev.id}`}
          className="v2-studies__nav-btn v2-studies__nav-btn--left"
          aria-label={`Go to ${prev.title}`}
        >
          {prev.images[0] && (
            <img
              src={previewSrc(prev.images[0])}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="v2-studies__nav-preview"
            />
          )}
          <span className="v2-studies__nav-inner">
            <span className="v2-studies__nav-arrow">←</span>
            <span className="v2-studies__nav-label">{prev.title}</span>
          </span>
        </Link>

        <Link
          href={`/casestudies/${next.id}`}
          className="v2-studies__nav-btn v2-studies__nav-btn--right"
          aria-label={`Go to ${next.title}`}
        >
          {next.images[0] && (
            <img
              src={previewSrc(next.images[0])}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="v2-studies__nav-preview"
            />
          )}
          <span className="v2-studies__nav-inner">
            <span className="v2-studies__nav-label">{next.title}</span>
            <span className="v2-studies__nav-arrow">→</span>
          </span>
        </Link>
      </nav>
    </section>
  );
}
