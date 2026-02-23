import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // No service worker, no page caching by default in Next.js
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;


