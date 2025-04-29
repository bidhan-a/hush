import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["hush-lib"],
  experimental: {
    externalDir: true,
  },
};

export default nextConfig;
