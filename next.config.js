/** @type {import('next').NextConfig} */
const nextConfig = {
  // Désactiver le strict mode si nécessaire pour le développement
  reactStrictMode: true,
  // Configurer les en-têtes pour les assets
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig