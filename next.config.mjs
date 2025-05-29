import createMDX from "@next/mdx";
import remarkSlug from "remark-slug";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure `pageExtensions` to include markdown and MDX files
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  // Optionally, add any other Next.js config below
};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkSlug],
  },
});

// Merge MDX config with Next.js config
export default withMDX(nextConfig);
