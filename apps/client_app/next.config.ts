import type { NextConfig } from 'next';
import { config as loadDotenv } from 'dotenv';
import { resolve } from 'node:path';

loadDotenv({ path: resolve(__dirname, '../../.env') });

const parseImageRemoteHosts = (): Array<{ hostname: string; port: string }> => {
  const defaults = ['localhost:9000', '127.0.0.1:9000'];
  const configured = process.env.NEXT_PUBLIC_IMAGE_REMOTE_HOSTS?.split(',') ?? defaults;

  return configured
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [hostname, port = '9000'] = entry.split(':');

      return { hostname, port };
    });
};

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: parseImageRemoteHosts().map(({ hostname, port }) => ({
      protocol: 'http',
      hostname,
      port,
      pathname: '/**',
    })),
  },
};

export default nextConfig;
