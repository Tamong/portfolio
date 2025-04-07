/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["next-mdx-remote"],
  experimental: {
    viewTransition: true,
  },
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
  async rewrites() {
    return [
      { source: "/llms.txt", destination: "/llm" },
      { source: "/rss.xml", destination: "/feed/rss.xml" },
      { source: "/atom.xml", destination: "/feed/atom.xml" },
      { source: "/feed.json", destination: "/feed/feed.json" },
      { source: "/rss", destination: "/feed/rss.xml" },
      { source: "/atom", destination: "/feed/atom.xml" },
      { source: "/feed", destination: "/feed/feed.json" },
    ];
  },
};

export default nextConfig;
