'use client';

import { useState } from 'react';
import KoykoNavbarV2 from '../components/v2/KoykoNavbarV2';
import KoykoCursorV2 from '../components/v2/KoykoCursorV2';

const THEMES = {
  negro:   '#0A0A0A',
  blanco:  '#F5F5F0',
  naranjo: '#EB5120',
};

const SECTIONS = [
  { id: '02', name: 'KoykoHeroV2' },
  { id: '03', name: 'KoykoMarqueeV2' },
  { id: '04', name: 'KoykoPortfolioV2' },
  { id: '05', name: 'KoykoDesignedV2' },
  { id: '06', name: 'KoykoContactV2' },
  { id: '07', name: 'KoykoFooterV2' },
];

export default function HomeV2() {
  const [theme, setTheme] = useState('blanco');

  return (
    <div className="home-v2" data-theme={theme}>

      <KoykoCursorV2 />

      {/* Theme Picker */}
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

      {/* Section placeholders — replaced one by one as V2 components are built */}
      {SECTIONS.map(({ id, name }) => (
        <div key={id} className="v2-placeholder">
          <span className="v2-placeholder__label">{id} · {name}</span>
          <span className="v2-placeholder__note">coming next</span>
        </div>
      ))}

    </div>
  );
}
