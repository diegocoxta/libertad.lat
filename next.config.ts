import type { NextConfig } from "next";

// The generated files are not fingerprinted, so they are cached for a day and refreshed in the background.
const GENERATED_FILES_CACHE = "public, max-age=86400, stale-while-revalidate=604800";

// Everything comes from the site itself. Inline scripts and styles stay allowed because the framework
// writes them into every page and the pages are static, so there is no per-request nonce to give them.
// The development server also needs eval and websockets, so the policy only applies to production.
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const SECURITY_HEADERS = [
  ...(process.env.NODE_ENV === "production"
    ? [{ key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY }]
    : []),
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
];

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // No header or source map says what the site runs on, and the image optimizer endpoint stays off.
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  images: { unoptimized: true },
  experimental: {
    globalNotFound: true,
    inlineCss: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        // Blocked countries get an empty 404 (see proxy.ts), so they get none of these either. The country repeats
        // BLOCKED_COUNTRIES, since the config cannot import from the app.
        missing: [{ type: "header", key: "x-vercel-ip-country", value: "US" }],
        headers: SECURITY_HEADERS,
      },
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
