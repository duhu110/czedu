import type { NextConfig } from "next";

process.env.TZ = "Asia/Shanghai";
process.env.PGTZ = "Asia/Shanghai";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
