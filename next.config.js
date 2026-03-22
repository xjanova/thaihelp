const { execSync } = require('child_process');

// Auto version from git
let appVersion = 'dev';
try {
  const count = execSync('git rev-list --count HEAD', { encoding: 'utf8' }).trim();
  const sha = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  appVersion = `v1.0.${count}-${sha}`;
} catch { /* fallback */ }

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: appVersion,
  },
  output: 'standalone',
  images: {
    unoptimized: true, // Use unoptimized images for PHP proxy compatibility
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          { key: 'Content-Type', value: 'application/manifest+json' },
        ],
      },
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
