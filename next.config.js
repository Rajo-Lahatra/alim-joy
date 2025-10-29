/** @type {import('next').NextConfig} */
const nextConfig = {
  // NE PAS utiliser 'export' - laisser Next.js gérer le rendu
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Désactiver les fonctionnalités qui nécessitent le serveur
  experimental: {
    esmExternals: 'loose'
  }
}

module.exports = nextConfig