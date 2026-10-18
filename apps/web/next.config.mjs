// Next.js configuration

/** @type {import('next').NextConfig} */
function getApiDestination() {
  const rawUrl = process.env.API_URL?.trim();
  if (rawUrl) {
    const urlMatch = rawUrl.match(/(https?:\/\/[^\s"']+)/);
    if (urlMatch) {
      const clean = urlMatch[1].replace(/\/+$/, '');
      if (clean.endsWith('/api')) {
        return `${clean}/:path*`;
      }
      return `${clean}/api/:path*`;
    }
    if (rawUrl.startsWith('/')) {
      return rawUrl;
    }
  }
  return 'http://localhost:3001/api/:path*';
}

const nextConfig = {
  output: process.env.VERCEL ? undefined : 'standalone',
  reactStrictMode: true,
  allowedDevOrigins: ['*.run.app', '*.us-east1.run.app', '*.cloudrun.app', '*.google.com', '*.googleusercontent.com', 'localhost:3000', '127.0.0.1:3000'],
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    cpus: 1,
  },
  async rewrites() {
    if (process.env.API_URL?.trim()) {
      return [
        {
          source: '/api/external/:path*',
          destination: getApiDestination(),
        },
      ];
    }
    return [];
  },
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/fetch-guard.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400' },
        ],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' ws: wss: https://*.supabase.co wss://*.supabase.co https://app.infisical.com https://va.vercel-scripts.com http://127.0.0.1:11434 http://localhost:11434",
              "frame-ancestors *",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;


