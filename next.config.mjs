/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'strapi.vietpolyglots.com',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
