import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "source.unsplash.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "ext.same-assets.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "ugc.same-assets.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "cdn.brandfetch.io",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "unavatar.io",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "media.licdn.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "licdn.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "**",
      }
    ],
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default withNextIntl(nextConfig as any);
