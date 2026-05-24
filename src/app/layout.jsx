import Script from 'next/script';
import '../assets/css/style.css';
import TransitionOverlay from '../components/TransitionOverlay';
import TransitionRouterSync from '../components/TransitionRouterSync';

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
  return (
    <html lang="en">
      <body>
        {children}
        <TransitionOverlay />
        <TransitionRouterSync />
        <Script
          src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
