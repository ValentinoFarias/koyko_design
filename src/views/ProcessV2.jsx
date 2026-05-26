'use client';

// ProcessV2 — /process route (V2 redesign)
//
// Mirrors HomeV2 / AboutV2 / ContactV2 composition:
//   1. KoykoCursorV2 + V2ThemePicker + KoykoNavbarV2 — V2 chrome
//   2. KoykoProcessV2 — page body (4-stage journey)
//   3. KoykoFooterV2 — shared V2 footer
//
// The wrapper carries `home-v2` so every --v2-* token + theme override
// from home-v2.css applies, plus `v2-process-page` for page-specific
// styles. Theme is shared with the rest of the V2 site via useV2Theme().

import KoykoCursorV2  from '../components/v2/KoykoCursorV2';
import KoykoNavbarV2  from '../components/v2/KoykoNavbarV2';
import KoykoFooterV2  from '../components/v2/KoykoFooterV2';
import KoykoProcessV2 from '../components/v2/KoykoProcessV2';
import V2ThemePicker  from '../components/v2/V2ThemePicker';
import { useV2Theme } from '../components/v2/useV2Theme';

export default function ProcessV2() {
  const [theme, setTheme] = useV2Theme();

  return (
    // suppressHydrationWarning silences the data-theme mismatch — SSR uses
    // the default, client reads the saved theme from localStorage.
    <div
      className="home-v2 v2-process-page"
      data-theme={theme}
      suppressHydrationWarning
    >
      <KoykoCursorV2 />
      <V2ThemePicker theme={theme} setTheme={setTheme} />
      <KoykoNavbarV2 />
      <KoykoProcessV2 />
      <KoykoFooterV2 />
    </div>
  );
}
