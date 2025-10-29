/** @type {import('next').NextConfig} */
const nextConfig = {
  // NE PAS utiliser 'export' - nous voulons une application React
  trailingSlash: false,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig