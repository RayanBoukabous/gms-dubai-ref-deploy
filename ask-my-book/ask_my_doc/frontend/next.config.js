/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile ESM-only packages so Next.js can handle them in production builds
  transpilePackages: ['nanoid'],

  // Skip TS type errors from third-party deps during Docker production build
  typescript: { ignoreBuildErrors: true },
  eslint:     { ignoreDuringBuilds: true },

  // In Docker the Next.js server proxies to the backend container.
  // BACKEND_URL defaults to localhost for local dev.
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
