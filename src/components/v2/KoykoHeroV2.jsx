'use client';

import { getAvailability } from '../../lib/availability';

// Hero section for the V2 homepage.
// Direct port of the proposal markup — all animation logic lives in CSS,
// so no useEffect / useState here.
export default function KoykoHeroV2() {
  // Next free slot = one month from today, so the tag never goes stale.
  const availability = getAvailability();

  return (
    <section className="v2-hero" id="top">
      {/* Meta strip: availability tag (with pulsing dot) + location */}
      <div className="v2-hero__meta">
        <span className="v2-hero__tag">
          <i className="v2-hero__dot" aria-hidden="true" /> available · {availability}
        </span>
        <span className="v2-hero__loc">Bristol &nbsp;/&nbsp; remote</span>
      </div>

      {/* Centered figure with the wordmark overlapping its lower edge */}
      <figure className="v2-hero__logo">
        {/* Explicit width/height + fetchPriority="high" tell the browser to
            reserve space (no CLS) and prioritize this asset (better LCP).
            The CSS sets width:100% so the intrinsic ratio still scales fluidly. */}
        <img
          className="v2-hero__figure-img"
          src="/assets/images/v2images/FullLogo.svg"
          alt=""
          width="728"
          height="961"
          fetchPriority="high"
          decoding="async"
        />
      </figure>

      {/* Claim — "design" is italic Syne + accent color */}
      <h1 className="v2-hero__claim">
        <span className="v2-hero__claim-row">
          web&nbsp;<em>design</em>
        </span>
      </h1>

      {/* Bottom-left scroll cue. #features doesn't exist yet — no-op until added. */}
      <a className="v2-hero__scroll" href="#features">
        <span>scroll</span>
        <svg viewBox="0 0 24 40" aria-hidden="true">
          <path d="M12 2v32m0 0l-7-7m7 7l7-7" />
        </svg>
      </a>
    </section>
  );
}
