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
 * Files are hosted as GitHub Release assets and are technically public URLs,
 * but this route is the only place those URLs are ever constructed — they are
 * never put in the HTML or handed to the client directly. Auth is checked here
 * before the redirect is issued, so the gate still holds at the application
 * layer: an unauthenticated request never learns the underlying URL.
 *
 * It cannot lean on `proxy.ts` for that. The proxy's matcher excludes `/api`
 * and anything with a file extension — it has to, or it would run on every
 * static asset — so the check is done here, against the same signed cookie the
 * proxy would have read.
 */

/** nodejs runtime — consistent with the rest of the API routes. */
export const runtime = "nodejs";

/**
 * GitHub Release base URL. All 20 PDFs are attached to this release tag.
 * The filename is the slug + ".pdf", matching exactly what was uploaded.
 */
const RELEASE_BASE =
  "https://github.com/golammostafa13/cef-3-book-bank/releases/download/v1.0-books";

export async function GET(
  request: NextRequest,
  { params }: RouteContext<"/api/file/[slug]">,
) {
  const session = await readSessionToken(
    request.cookies.get(sessionCookieName)?.value,
  );

  if (!hasLibraryAccess(session)) {
    // A person who typed the address gets sent somewhere they can do something
    // about it; a script — or the PDF reader fetching in the background — gets
    // a status code it can act on rather than a page of HTML to choke on.
    if (request.headers.get("sec-fetch-mode") === "navigate") {
      const lang = preferredLocale(request.headers.get("accept-language"));
      return NextResponse.redirect(
        new URL(localePath(lang, "/signin"), request.url),
      );
    }
    return new NextResponse(null, { status: 401 });
  }

  const { slug } = await params;
  const file = await getBookFile(slug);
  if (!file) return new NextResponse(null, { status: 404 });

  // Build the GitHub Release asset URL from the storage filename.
  // `storageName` is already just the basename (e.g. "nelson-textbook-of-pediatrics.pdf")
  // so no path traversal is possible.
  const assetUrl = `${RELEASE_BASE}/${encodeURIComponent(file.storageName)}`;

  // For the download button (?download=1) we still want the browser to save
  // the file with a clean name. We can't set Content-Disposition on a redirect
  // to a third-party origin, so we use a meta-refresh workaround: redirect the
  // browser directly; the filename in the GitHub URL is already the slug.
  //
  // For the in-browser reader, pdf.js fetches the URL returned here — it will
  // follow the redirect and issue range requests directly against GitHub's CDN,
  // which supports Accept-Ranges: bytes natively.
  return NextResponse.redirect(assetUrl, {
    status: 302,
    headers: {
      // Do not cache this redirect: it is auth-gated and the underlying URL
      // could change if assets are re-uploaded to a new release.
      "Cache-Control": "private, no-store",
    },
  });
}
