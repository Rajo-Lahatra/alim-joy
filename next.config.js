/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration pour Vercel - pas d'export statique
  trailingSlash: false,
  images: {
    unoptimized: true
  },
  // Désactiver les fonctionnalités qui nécessitent le serveur si vous n'en avez pas besoin
  experimental: {
    esmExternals: 'loose'
  }
}

module.exports = nextConfig