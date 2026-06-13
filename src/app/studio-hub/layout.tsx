import type { ReactNode } from 'react';

/* Private, URL-only route. This nested layout sets per-route metadata so the
   page is never indexed by search engines — without adding anything to
   robots.txt, the sitemap, or any site navigation. */
export const metadata = {
  title: 'Studio Hub — Koyko',
  robots: { index: false, follow: false },
};

export default function StudioHubLayout({ children }: { children: ReactNode }) {
  return children;
}
