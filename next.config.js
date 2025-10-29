/** @type {import('next').NextConfig} */
const nextConfig = {
  // NE PAS utiliser 'export' pour Vercel
  trailingSlash: false,
  images: {
    unoptimized: true
  },
  // Désactiver le strict mode si ça cause des problèmes
  reactStrictMode: false,
}

module.exports = nextConfig