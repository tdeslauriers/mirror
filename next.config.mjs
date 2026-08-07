import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure `pageExtensions` to include markdown and MDX files
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  experimental: {
    serverActions: {
      // form fields only (titles, descriptions, permission/album uuid lists) --
      // image bytes never pass through a server action, they go straight to
      // object storage via a presigned url. 100kb is ~10x the realistic
      // worst case, well under next's 1mb default.
      bodySizeLimit: "100kb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.OBJECT_STORAGE_URL || "localhost",
        port: "9000",
        pathname: "/**",
      },
    ],
  },
};

const withMDX = createMDX();

// Merge MDX config with Next.js config
export default withMDX(nextConfig);
