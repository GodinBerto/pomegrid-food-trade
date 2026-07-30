import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/v1/api/:path*",
        destination: "http://127.0.0.1:8000/api/v1/:path*", // Proxy to Backend
      },
      {
        source: "/api/v1/:path*",
        destination: "http://127.0.0.1:8000/api/v1/:path*", // Fallback proxy
      }
    ];
  },
};

export default nextConfig;
