import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Serve the static marketing pages (ported from the Python site) at clean URLs.
    return {
      beforeFiles: [
        { source: "/", destination: "/manifesto.html" },
        { source: "/manifesto", destination: "/manifesto.html" },
        { source: "/home", destination: "/home.html" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
