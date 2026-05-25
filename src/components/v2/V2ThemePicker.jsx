'use client';

import { useEffect, useState } from 'react';

// Theme dots shown floating top-right on every V2 page.
// Deferred until after mount so it never appears in SSR HTML — that
// avoids hydration mismatches on the .is-on className and the label
// text, which differ between SSR (default theme) and client (saved
// theme from localStorage).

const THEMES = {
  negro:   '#0A0A0A',
  blanco:  '#F5F5F0',
  naranjo: '#EB5120',
};

export default function V2ThemePicker({ theme, setTheme }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Render nothing on the server / first client paint so no hydration
  // diff exists. Picker appears one frame later.
  if (!mounted) return null;

  return (
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
  );
}
