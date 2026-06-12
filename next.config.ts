import type { NextConfig } from 'next';

const config: NextConfig = {
  experimental: {
    serverActions: { allowedOrigins: ['localhost:3000'] },
  },
  webpack: (config) => {
    config.externals = [
      ...(Array.isArray(config.externals) ? config.externals : []),
      { 'utf-8-validate': 'commonjs utf-8-validate', bufferutil: 'commonjs bufferutil' },
    ];
    return config;
  },
};

export default config;
