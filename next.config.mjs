/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development';

const nextConfig = {
  // Keep dev and production artifacts in separate folders to prevent
  // runtime chunk mismatches when switching between `next dev` and `next build`.
  distDir: isDev ? '.next-dev' : '.next',
  reactStrictMode: true,
  experimental: {
    // Work around an intermittent dev-runtime crash:
    // "Cannot read properties of undefined (reading 'call')"
    // caused by segment explorer module manifest mismatches.
    devtoolSegmentExplorer: false,
  },
};

export default nextConfig;
