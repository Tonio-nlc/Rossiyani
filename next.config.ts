import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/manual",
        destination: "/lessons",
        permanent: true,
      },
      {
        source: "/manual/:path*",
        destination: "/lessons/:path*",
        permanent: true,
      },
      {
        source: "/explorer",
        destination: "/vocabulary",
        permanent: true,
      },
      {
        source: "/explorer/:path*",
        destination: "/vocabulary",
        permanent: true,
      },
      {
        source: "/search",
        destination: "/vocabulary",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
