import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.1.8",
    "192.168.1.2",
    "192.168.1.4",
    "192.168.1.6",
    "192.168.1.3",
    "192.168.1.7",
  ], // Replace with your IP
};

export default nextConfig;
