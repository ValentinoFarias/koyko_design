'use client';

import { useCallback, useEffect, useState } from 'react';

// Persisted theme for the V2 site. Saves to localStorage so picking a
// theme on one page (e.g. naranjo on /home) sticks when navigating to
// /about, /contact, or /casestudies.
//
// Hydration note: we MUST start with DEFAULT_THEME on the very first
// render (both server and client) so the SSR'd HTML matches the first
// client render. We then read localStorage in useEffect after mount and
// swap to the saved theme. Reading localStorage in the useState lazy
// initializer caused a hydration mismatch when the saved theme differed
// from the default.

const STORAGE_KEY = 'koyko-v2-theme';
const DEFAULT_THEME = 'blanco';

export function useV2Theme() {
  // Start with the default so server and first client render agree.
  const [theme, setThemeInternal] = useState(DEFAULT_THEME);

  // After mount, sync to whatever's in localStorage. This re-render
  // happens on the client only, so no hydration mismatch.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && saved !== DEFAULT_THEME) setThemeInternal(saved);
    } catch {
      // ignore (e.g. storage blocked)
    }
  }, []);

  // Wrapped setter — updates state AND persists in the same call.
  const setTheme = useCallback((next) => {
    setThemeInternal(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  return [theme, setTheme];
}
