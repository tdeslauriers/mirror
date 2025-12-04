import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure `pageExtensions` to include markdown and MDX files
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
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
