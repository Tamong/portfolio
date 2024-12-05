/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {};

const nextConfig = {
  transpilePackages: ["next-mdx-remote"],
  images: {
    domains: ["pwallis.com"],
  },
};

export default nextConfig;
