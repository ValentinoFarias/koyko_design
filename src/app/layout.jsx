import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Syne, Noto_Sans_JP, JetBrains_Mono } from 'next/font/google';
import '../assets/css/style.css';

// Fonts are loaded with next/font/google so Next.js can:
//   • Self-host the font files (no third-party request to fonts.googleapis.com)
//   • Inline them as <link rel="preload"> in the document head
//   • Apply size-adjust fallbacks that match the real font metrics, which
//     eliminates the layout shift (CLS) when the web font finally swaps in.
//
// Each font exposes a CSS custom property that the --v2-ff-* tokens in
// style.css consume. `display: 'swap'` keeps text visible during load.

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
});

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  // Variable weights aren't supported for Noto Sans JP via next/font, so we
  // load the discrete weights actually used in the design (heavy display +
  // a couple of mid weights for body fallbacks).
  weight: ['400', '700', '900'],
  variable: '--font-noto-sans-jp',
  display: 'swap',
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata = {
  title: 'Koyko Portfolio – Creative Developer & Designer',
  description:
    'Portfolio of Koyko – a creative developer and designer crafting thoughtful interfaces and performant web experiences.',
  keywords: ['portfolio', 'frontend', 'design', 'developer', 'UI', 'UX'],
  icons: {
    icon: [
      { url: '/assets/images/favicon_io/favicon.ico', sizes: 'any' },
      { url: '/assets/images/favicon_io/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/assets/images/favicon_io/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/assets/images/favicon_io/apple-touch-icon.png',
  },
  manifest: '/assets/images/favicon_io/site.webmanifest',
  openGraph: {
    title: 'Koyko Portfolio',
    description: 'Showcasing digital product design, front-end engineering, and motion-driven experiences.',
    type: 'website',
    siteName: 'Koyko',
  },
};

export default function RootLayout({ children }) {
  // The three font variables are attached to <html> so every descendant
  // (including the .home-v2 wrappers per page) can consume them via the
  // --v2-ff-* tokens defined in style.css.
  const fontVars = `${syne.variable} ${notoSansJP.variable} ${jetBrainsMono.variable}`;

  return (
    // suppressHydrationWarning here is for third-party HTML mutations
    // (e.g. Chrome on iOS injects __gchrome_remoteframetoken on <html>
    // before React hydrates). Scoped to <html>'s own attributes only.
    <html lang="en" className={fontVars} suppressHydrationWarning>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
