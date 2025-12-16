import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  turbopack: false, // Disable Turbopack to fix textract build error
};

export default nextConfig;