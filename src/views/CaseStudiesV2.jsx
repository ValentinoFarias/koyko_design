'use client';

// CaseStudiesV2 — /casestudies-v2/[id] route
//
// V2 chrome (cursor + theme picker + navbar) wrapping a KoykoStudiesV2
// body. Receives projectId from the dynamic route and forwards it down.

import KoykoCursorV2  from '../components/v2/KoykoCursorV2';
import KoykoNavbarV2  from '../components/v2/KoykoNavbarV2';
import KoykoFooterV2  from '../components/v2/KoykoFooterV2';
import KoykoStudiesV2 from '../components/v2/KoykoStudiesV2';
import { useV2Theme } from '../components/v2/useV2Theme';

const THEMES = {
  negro:   '#0A0A0A',
  blanco:  '#F5F5F0',
  naranjo: '#EB5120',
};

export default function CaseStudiesV2({ projectId }) {
  const [theme, setTheme] = useV2Theme();

  return (
    <div className="home-v2 v2-studies-page" data-theme={theme}>
      <KoykoCursorV2 />

      {/* Theme picker — matches HomeV2 / AboutV2 / ContactV2 */}
      <div className="v2-theme-picker">
        {Object.entries(THEMES).map(([name, hex]) => (
          <button
            key={name}
            className={`v2-theme-dot${theme === name ? ' is-on' : ''}`}
            style={{ '--dot': hex }}
            onClick={() => setTheme(name)}
            aria-label={name}
          />
        ))}
        <span className="v2-theme-label">{theme}</span>
      </div>

      <KoykoNavbarV2 />
      <KoykoStudiesV2 projectId={projectId} />
      <KoykoFooterV2 />
    </div>
  );
}
