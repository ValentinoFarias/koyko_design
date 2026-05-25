'use client';

// AboutV2 — /about-v2 route
//
// Page composition:
//   1. KoykoCursorV2 + KoykoNavbarV2 — V2 chrome
//   2. KoykoMissionV2 — scroll-driven brand story (v2-styled mission)
//   3. KoykoFooterV2 — V2 footer (lands after the 500vh mission scroll range)

import KoykoCursorV2  from '../components/v2/KoykoCursorV2';
import KoykoNavbarV2  from '../components/v2/KoykoNavbarV2';
import KoykoFooterV2  from '../components/v2/KoykoFooterV2';
import KoykoMissionV2 from '../components/v2/KoykoMissionV2';
import V2ThemePicker  from '../components/v2/V2ThemePicker';
import { useV2Theme } from '../components/v2/useV2Theme';

export default function AboutV2() {
  const [theme, setTheme] = useV2Theme();

  return (
    // suppressHydrationWarning silences the data-theme mismatch — SSR
    // uses the default, client reads the saved theme from localStorage.
    <div
      className="home-v2 v2-about-page"
      data-theme={theme}
      suppressHydrationWarning
    >
      <KoykoCursorV2 />
      <V2ThemePicker theme={theme} setTheme={setTheme} />
      <KoykoNavbarV2 />
      <KoykoMissionV2 />
      <KoykoFooterV2 />
    </div>
  );
}
