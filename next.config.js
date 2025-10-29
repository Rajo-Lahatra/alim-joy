/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Forcer le re-rendu côté client
  experimental: {
    esmExternals: 'loose'
  },
  // Désactiver la minimisation pour le débogage
  swcMinify: false,
  // Configurer les en-têtes
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig