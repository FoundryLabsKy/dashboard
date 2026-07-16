import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export so the app can be served from GitHub Pages.
  output: "export",
  // Set by the Pages deploy workflow (e.g. "/dashboard"); empty locally.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  images: { unoptimized: true },
};

export default nextConfig;
