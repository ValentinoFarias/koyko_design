'use client';

// FAQsV2 — /faqs route (V2)
//
// Mirrors ProcessV2 composition:
//   1. KoykoCursorV2 + V2ThemePicker + KoykoNavbarV2 — V2 chrome
//   2. KoykoFAQsV2 — page body (accordion list of common questions)
//   3. KoykoFooterV2 — shared V2 footer
//
// The wrapper carries `home-v2` so every --v2-* token + theme override
// from style.css applies, plus `v2-faqs-page` for page-specific styles.

import KoykoCursorV2 from '../components/v2/KoykoCursorV2';
import KoykoNavbarV2 from '../components/v2/KoykoNavbarV2';
import KoykoFooterV2 from '../components/v2/KoykoFooterV2';
import KoykoFAQsV2   from '../components/v2/KoykoFAQsV2';
import V2ThemePicker from '../components/v2/V2ThemePicker';
import { useV2Theme } from '../components/v2/useV2Theme';

export default function FAQsV2() {
  const [theme, setTheme] = useV2Theme();

  return (
    // suppressHydrationWarning silences the data-theme mismatch — SSR uses
    // the default, client reads the saved theme from localStorage.
    <div
      className="home-v2 v2-faqs-page"
      data-theme={theme}
      suppressHydrationWarning
    >
      <KoykoCursorV2 />
      <V2ThemePicker theme={theme} setTheme={setTheme} />
      <KoykoNavbarV2 />
      <KoykoFAQsV2 />
      <KoykoFooterV2 />
    </div>
  );
}
