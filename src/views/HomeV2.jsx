'use client';

import KoykoNavbarV2 from '../components/v2/KoykoNavbarV2';
import KoykoCursorV2 from '../components/v2/KoykoCursorV2';
import V2ThemePicker from '../components/v2/V2ThemePicker';
import { useV2Theme } from '../components/v2/useV2Theme';
import KoykoHeroV2    from '../components/v2/KoykoHeroV2';
import KoykoMarqueeV2   from '../components/v2/KoykoMarqueeV2';
import KoykoPortfolioV2 from '../components/v2/KoykoPortfolioV2';
import KoykoDesignedV2  from '../components/v2/KoykoDesignedV2';
import KoykoContactV2   from '../components/v2/KoykoContactV2';
import KoykoFooterV2    from '../components/v2/KoykoFooterV2';

export default function HomeV2() {
  const [theme, setTheme] = useV2Theme();

  return (
    // suppressHydrationWarning silences the data-theme mismatch — SSR
    // uses the default (blanco), client reads the saved theme from
    // localStorage. The mismatch is intentional.
    <div className="home-v2" data-theme={theme} suppressHydrationWarning>

      <KoykoCursorV2 />

      <V2ThemePicker theme={theme} setTheme={setTheme} />

      <KoykoNavbarV2 />

      {/* 02 — Hero (replaces the placeholder) */}
      <KoykoHeroV2 />

      {/* 03 — Marquee (replaces the placeholder) */}
      <KoykoMarqueeV2 />

      {/* 04 — Portfolio (replaces the placeholder) */}
      <KoykoPortfolioV2 />

      {/* 05 — Designed With… (replaces the placeholder) */}
      <KoykoDesignedV2 />

      {/* 06 — Contact (replaces the placeholder) */}
      <KoykoContactV2 />

      {/* 07 — Footer (replaces the placeholder) */}
      <KoykoFooterV2 />

    </div>
  );
}
