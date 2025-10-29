/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration de base - pas d'export statique
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig