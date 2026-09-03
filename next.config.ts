import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Prevent deployment halts from minor linter warnings
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
