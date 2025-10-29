/** @type {import('next').NextConfig} */
const nextConfig = {
  // Désactiver le rendu statique pour les pages dynamiques
  output: 'standalone',
  // Ou utiliser 'export' si vous voulez un site statique
  // output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Désactiver les optimisations qui peuvent causer des problèmes
  experimental: {
    esmExternals: 'loose'
  },
  // Ignorer les erreurs de dépendance pendant le build
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
}

module.exports = nextConfig