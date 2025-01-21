import { NextConfig } from 'next';

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hazalkaynak.pythonanywhere.com",
        port: "",
        pathname: "/media/**",
      },
    ],
  },
};

export default nextConfig;