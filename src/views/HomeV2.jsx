'use client';

import { useState } from 'react';
import KoykoNavbarV2 from '../components/v2/KoykoNavbarV2';
import KoykoCursorV2 from '../components/v2/KoykoCursorV2';
import KoykoHeroV2    from '../components/v2/KoykoHeroV2';
import KoykoMarqueeV2   from '../components/v2/KoykoMarqueeV2';
import KoykoPortfolioV2 from '../components/v2/KoykoPortfolioV2';
import KoykoDesignedV2  from '../components/v2/KoykoDesignedV2';
import KoykoContactV2   from '../components/v2/KoykoContactV2';
import KoykoFooterV2    from '../components/v2/KoykoFooterV2';

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
