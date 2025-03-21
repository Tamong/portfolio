/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["next-mdx-remote"],
  images: {
    localPatterns: [
      {
        pathname: "/**",
        search: "",
      },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.pwallis.com/**",
        port: "",
        search: "",
      },
      {
        protocol: "https",
        hostname: "**.googleusercontent.com/**",
        port: "",
        search: "",
      },
    ],
  },
};

export default nextConfig;
