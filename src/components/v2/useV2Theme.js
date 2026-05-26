'use client';

import { useCallback, useState } from 'react';

// Persisted theme for the V2 site. Saves to localStorage so picking a
// theme on one page (e.g. naranjo on /home) sticks when navigating to
// /about, /contact, or /casestudies — with no visible flash.
//
// Key design points:
//   - useState uses a *synchronous* lazy initializer that reads
//     localStorage. That means the very first render already produces
//     the correct theme — no useEffect → setTheme dance, no flash.
//   - Writes happen inside the returned setTheme (not in a useEffect on
//     [theme]). An on-every-change effect would fire once at mount with
//     the default value and clobber the saved value.
//   - Server-side rendering: `window` is undefined, so the initializer
//     falls back to DEFAULT_THEME. Client-side navigation between V2
//     pages is the common case and stays flash-free.

const STORAGE_KEY = 'koyko-v2-theme';
const DEFAULT_THEME = 'blanco';

function readSavedTheme() {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  try {
    return window.localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function useV2Theme() {
  // Lazy initializer — passing the function (not its result) makes React
  // run it only once per mount.
  const [theme, setThemeInternal] = useState(readSavedTheme);

  // Wrapped setter — updates state AND persists in the same call.
  // Fires only on picker clicks, so it can never clobber storage on mount.
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
