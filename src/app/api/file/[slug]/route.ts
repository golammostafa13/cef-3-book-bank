import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sessionCookieName } from "@/lib/auth/config";
import { hasLibraryAccess, readSessionToken } from "@/lib/auth/session";
import { getBookFile } from "@/lib/data/books";
import { localePath } from "@/lib/i18n/config";
import { preferredLocale } from "@/lib/i18n/negotiate";

/**
 * The only way to a book file.
 *
 * PDFs are hosted as GitHub Release assets. Because GitHub redirects to
 * release-assets.githubusercontent.com which carries no CORS headers, pdf.js
 * (which uses fetch/XHR) cannot reach the file directly — the browser blocks
 * the cross-origin response. The download button works because <a download> is
 * a navigation, not a fetch, and CORS does not apply to navigations.
 *
 * So this route proxies the bytes rather than redirecting. The browser only
 * ever talks to our own origin; GitHub's CDN is called server-side where CORS
 * is irrelevant. Range requests are forwarded so pdf.js can still stream
 * individual pages without pulling the whole file first.
 *
 * Auth is checked before a single byte is fetched from GitHub.
 */

export const runtime = "nodejs";

const RELEASE_BASE =
  "https://github.com/golammostafa13/cef-3-book-bank/releases/download/v1.0-books";

export async function GET(
  request: NextRequest,
  { params }: RouteContext<"/api/file/[slug]">,
) {
  // ── Auth ────────────────────────────────────────────────────────────────
  const session = await readSessionToken(
    request.cookies.get(sessionCookieName)?.value,
  );

  if (!hasLibraryAccess(session)) {
    if (request.headers.get("sec-fetch-mode") === "navigate") {
      const lang = preferredLocale(request.headers.get("accept-language"));
      return NextResponse.redirect(
        new URL(localePath(lang, "/signin"), request.url),
      );
    }
    return new NextResponse(null, { status: 401 });
  }

  // ── Resolve file ────────────────────────────────────────────────────────
  const { slug } = await params;
  const file = await getBookFile(slug);
  if (!file) return new NextResponse(null, { status: 404 });

  const assetUrl = `${RELEASE_BASE}/${encodeURIComponent(file.storageName)}`;
  const download = request.nextUrl.searchParams.get("download") === "1";

  // ── Proxy request to GitHub ─────────────────────────────────────────────
  // Forward the Range header so pdf.js can request individual page chunks
  // rather than pulling the entire file before drawing page one.
  const upstream = await fetch(assetUrl, {
    headers: {
      // Pass through range requests from pdf.js unchanged
      ...(request.headers.get("range")
        ? { Range: request.headers.get("range")! }
        : {}),
      // GitHub needs a User-Agent for API/release requests
      "User-Agent": "cef-3-book-bank/1.0",
    },
    // Vercel will follow GitHub's redirect to githubusercontent.com for us
    redirect: "follow",
  });

  if (!upstream.ok && upstream.status !== 206) {
    return new NextResponse(null, { status: upstream.status });
  }

  // ── Stream response back to browser ─────────────────────────────────────
  const headers = new Headers({
    "Content-Type": "application/pdf",
    "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${file.downloadName}"`,
    // Tell pdf.js it can make range requests against this route
    "Accept-Ranges": "bytes",
    // Auth-gated — must never be cached by a CDN or shared cache
    "Cache-Control": "private, no-store",
  });

  // Forward content-length and content-range so the reader knows the file
  // size and can position the scrollbar correctly
  const contentLength = upstream.headers.get("content-length");
  const contentRange = upstream.headers.get("content-range");
  if (contentLength) headers.set("Content-Length", contentLength);
  if (contentRange) headers.set("Content-Range", contentRange);

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers,
  });
}
