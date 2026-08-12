import type { NextConfig } from "next";

/**
 * Security headers.
 *
 * These are set statically here rather than in `proxy.ts` on purpose. A
 * nonce-based CSP has to be generated per request, which opts every page out
 * of static rendering — and static rendering is the entire reason this
 * architecture can absorb a 100k-visitors/minute spike from cache.
 *
 * Production hardening step: move the CSP to a Cloudflare Transform Rule /
 * Worker at the edge, where a nonce or hash can be injected into an already
 * cached response. Until then `script-src` needs 'unsafe-inline', because
 * Next's hydration payload and the pre-paint theme script are both inline.
 * Every other directive below is already locked down.
 */
const isDev = process.env.NODE_ENV === "development";

/**
 * Google Identity Services, used only by /signin, needs its script, its iframe
 * and its token endpoint allowed. Listed once here so the exceptions are
 * visible rather than scattered through the directives below.
 */
const google = {
  script: "https://accounts.google.com https://apis.google.com",
  frame: "https://accounts.google.com",
  connect: "https://accounts.google.com https://www.googleapis.com",
  img: "https://lh3.googleusercontent.com https://*.googleusercontent.com",
};

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  // React's dev build needs eval() for stack reconstruction and HMR.
  // Production never gets it.
  `script-src 'self' 'unsafe-inline' ${google.script}${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  // Fonts are self-hosted by next/font, so no font CDN needs allowing.
  "font-src 'self'",
  // data:/blob: cover PDF.js canvas rendering and generated cover art;
  // googleusercontent serves the signed-in librarian's avatar.
  `img-src 'self' data: blob: ${google.img}`,
  // PDF.js runs its parser in a worker created from a blob URL.
  "worker-src 'self' blob:",
  // The sign-in button renders inside a Google-hosted iframe.
  `frame-src 'self' ${google.frame}`,
  // Dev needs the HMR websocket; production talks to its own origin and to
  // Google's key and token endpoints.
  `connect-src 'self' ${google.connect}${isDev ? " ws: http://localhost:*" : ""}`,
  "media-src 'self'",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
