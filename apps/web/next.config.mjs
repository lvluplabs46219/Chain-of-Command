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
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: getApiDestination(),
      },
    ];
  },
};

export default nextConfig;

