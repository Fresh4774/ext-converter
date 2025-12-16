import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    turbo: false, // Try this instead
  },
};

export default nextConfig;