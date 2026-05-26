'use client';

// Hero section for the V2 homepage.
// Direct port of the proposal markup — all animation logic lives in CSS,
// so no useEffect / useState here.
export default function KoykoHeroV2() {
  return (
    <section className="v2-hero" id="top">
      {/* Meta strip: availability tag (with pulsing dot) + location */}
      <div className="v2-hero__meta">
        <span className="v2-hero__tag">
          <i className="v2-hero__dot" aria-hidden="true" /> available · jun '26
        </span>
        <span className="v2-hero__loc">Bristol &nbsp;/&nbsp; remote</span>
      </div>

      {/* Centered figure with the wordmark overlapping its lower edge */}
      <figure className="v2-hero__logo">
        <img
          className="v2-hero__figure-img"
          src="/assets/images/v2images/FullLogo.svg"
          alt=""
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
