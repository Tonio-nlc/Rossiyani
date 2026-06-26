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
    ];
  },
};

export default nextConfig;
