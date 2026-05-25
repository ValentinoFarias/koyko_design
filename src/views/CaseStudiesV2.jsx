'use client';

// CaseStudiesV2 — /casestudies-v2/[id] route
//
// V2 chrome (cursor + theme picker + navbar) wrapping a KoykoStudiesV2
// body. Receives projectId from the dynamic route and forwards it down.

import KoykoCursorV2  from '../components/v2/KoykoCursorV2';
import KoykoNavbarV2  from '../components/v2/KoykoNavbarV2';
import KoykoFooterV2  from '../components/v2/KoykoFooterV2';
import KoykoStudiesV2 from '../components/v2/KoykoStudiesV2';
import V2ThemePicker  from '../components/v2/V2ThemePicker';
import { useV2Theme } from '../components/v2/useV2Theme';

export default function CaseStudiesV2({ projectId }) {
  const [theme, setTheme] = useV2Theme();

  return (
    // suppressHydrationWarning silences the data-theme mismatch — SSR
    // uses the default, client reads the saved theme from localStorage.
    <div
      className="home-v2 v2-studies-page"
      data-theme={theme}
      suppressHydrationWarning
    >
      <KoykoCursorV2 />
      <V2ThemePicker theme={theme} setTheme={setTheme} />
      <KoykoNavbarV2 />
      <KoykoStudiesV2 projectId={projectId} />
      <KoykoFooterV2 />
    </div>
  );
}
