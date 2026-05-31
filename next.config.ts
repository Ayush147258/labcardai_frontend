import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },
  experimental: { typedRoutes: true },
  // CRITICAL: prevents pdf-parse + razorpay bundling failure on Vercel edge
  serverExternalPackages: ['pdf-parse', 'razorpay'],
};

export default nextConfig;
