import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // allowedDevOrigins: ['http://10.158.120.72:3000/'],
  allowedDevOrigins: ['10.100.6.72'],
  images: {
    qualities: [70, 75, 85],
  },
};

export default nextConfig;
