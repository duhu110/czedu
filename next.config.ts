import type { NextConfig } from "next";

process.env.TZ = "Asia/Shanghai";
process.env.PGTZ = "Asia/Shanghai";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "github.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
