import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export so the app can be served from GitHub Pages.
  output: "export",
  // Set by the Pages deploy workflow (e.g. "/dashboard"); empty locally.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  // Folder-style URLs (todo/index.html) so GitHub Pages serves every route
  // on direct navigation, not just via client-side routing.
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
