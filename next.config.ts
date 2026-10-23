import type { NextConfig } from "next";

// The generated files are not fingerprinted, so they are cached for a day and refreshed in the background.
const GENERATED_FILES_CACHE = "public, max-age=86400, stale-while-revalidate=604800";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    inlineCss: true,
  },
  async headers() {
    return [
      {
        source: "/:folder(og|share|icons|splash)/:path*",
        headers: [{ key: "Cache-Control", value: GENERATED_FILES_CACHE }],
      },
      {
        source: "/seal-art.webp",
        headers: [{ key: "Cache-Control", value: GENERATED_FILES_CACHE }],
      },
      {
        source: "/inverted-america.svg",
        headers: [{ key: "Cache-Control", value: GENERATED_FILES_CACHE }],
      },
    ];
  },
};

export default nextConfig;
