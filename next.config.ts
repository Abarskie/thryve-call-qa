import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "26mb",
    },
  },
  eslint: {
    // Prevent deployment halts from minor linter warnings
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
