/** @type {import('next').NextConfig} */

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['assets.aceternity.com'], // Add your external domain here
  },
};

export default nextConfig;