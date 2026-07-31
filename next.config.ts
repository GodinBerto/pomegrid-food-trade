import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/v1/api/:path*",
        destination: "http://pomegrid.pythonanywhere.com/api/v1/:path*", // Proxy to Backend
      },
      {
        source: "/api/v1/:path*",
        destination: "http://pomegrid.pythonanywhere.com/api/v1/:path*", // Fallback proxy
      },
      {
        source: "/uploads/:path*",
        destination: "http://pomegrid.pythonanywhere.com/uploads/:path*",
      },
    ];
  },
};

export default nextConfig;
