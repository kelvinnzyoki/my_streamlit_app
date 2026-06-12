/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'fit.cctamcc.site' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
};
module.exports = nextConfig;
