'use client';

// AboutV2 — /about-v2 route
//
// Page composition:
//   1. KoykoCursorV2 + KoykoNavbarV2 — V2 chrome
//   2. KoykoMissionV2 — scroll-driven brand story (v2-styled mission)
//   3. KoykoFooterV2 — V2 footer (lands after the 500vh mission scroll range)

import { useState } from 'react';
import KoykoCursorV2  from '../components/v2/KoykoCursorV2';
import KoykoNavbarV2  from '../components/v2/KoykoNavbarV2';
import KoykoFooterV2  from '../components/v2/KoykoFooterV2';
import KoykoMissionV2 from '../components/v2/KoykoMissionV2';

const THEMES = {
  negro:   '#0A0A0A',
  blanco:  '#F5F5F0',
  naranjo: '#EB5120',
};

export default function AboutV2() {
  const [theme, setTheme] = useState('blanco');

  return (
    <div className="home-v2 v2-about-page" data-theme={theme}>
      <KoykoCursorV2 />

      {/* Theme picker — same component pattern as HomeV2 / ContactV2 */}
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
      <KoykoMissionV2 />
      <KoykoFooterV2 />
    </div>
  );
}
