import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
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
 * The files used to sit in `public/`, which meant the gate on the pages was
 * decoration: anyone with a URL could take the PDF without ever meeting the
 * sign-in form. They live outside the served tree now, and this handler is the
 * whole of their access control.
 *
 * It cannot lean on `proxy.ts` for that. The proxy's matcher excludes `/api`
 * and anything with a file extension — it has to, or it would run on every
 * static asset — so the check is done here, against the same signed cookie the
 * proxy would have read.
 */

/** `fs` and streaming: this route cannot run on the edge. */
export const runtime = "nodejs";

/**
 * Private storage. Resolved from the working directory rather than relative to
 * this file, because the built output does not preserve the source layout.
 */
const STORAGE = path.join(process.cwd(), "private", "books");

const CONTENT_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  epub: "application/epub+zip",
};

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

  // `slug` reached us from the URL. It has already been matched against the
  // catalogue, so it cannot be arbitrary — but the name it resolved to is
  // still confined to one directory, because one day that lookup will be a
  // database column somebody can edit.
  const full = path.join(STORAGE, path.basename(file.storageName));
  if (!full.startsWith(STORAGE + path.sep)) {
    return new NextResponse(null, { status: 404 });
  }

  let size: number;
  try {
    size = (await stat(full)).size;
  } catch {
    return new NextResponse(null, { status: 404 });
  }

  const type = CONTENT_TYPES[file.format] ?? "application/octet-stream";
  // `?download=1` is the download button; everything else is the reader, which
  // wants the file rendered in place rather than saved.
  const download = request.nextUrl.searchParams.get("download") === "1";

  const headers = new Headers({
    "Content-Type": type,
    // PDF.js asks for the file a slice at a time and only does so if the
    // server says it can. Without this the reader pulls all 36MB of a
    // handbook before it can draw page one.
    "Accept-Ranges": "bytes",
    "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${file.downloadName}"`,
    // The response depends on a cookie, so no shared cache may keep it. This
    // is the header that stops a CDN turning a gated file back into a public
    // one.
    "Cache-Control": "private, no-store",
  });

  const range = parseRange(request.headers.get("range"), size);
  if (range === "unsatisfiable") {
    headers.set("Content-Range", `bytes */${size}`);
    return new NextResponse(null, { status: 416, headers });
  }

  const { start, end } = range ?? { start: 0, end: size - 1 };
  headers.set("Content-Length", String(end - start + 1));
  if (range) headers.set("Content-Range", `bytes ${start}-${end}/${size}`);

  const body = Readable.toWeb(
    createReadStream(full, { start, end }),
  ) as ReadableStream<Uint8Array>;

  return new NextResponse(body, { status: range ? 206 : 200, headers });
}

/**
 * The one form of Range header worth supporting: a single byte range.
 *
 * Multipart ranges are legal and no client that matters sends them for a PDF.
 * Anything unparseable returns null and is served as a whole file, which is
 * what the spec asks for.
 */
function parseRange(
  header: string | null,
  size: number,
): { start: number; end: number } | "unsatisfiable" | null {
  if (!header?.startsWith("bytes=")) return null;

  const [rawStart, rawEnd] = header.slice(6).split("-", 2);
  if (rawEnd === undefined) return null;

  let start: number;
  let end: number;

  if (rawStart === "") {
    // "bytes=-500" — the last 500 bytes, which is how PDF.js finds the index
    // at the end of the file before it asks for anything else.
    const length = Number(rawEnd);
    if (!Number.isInteger(length) || length <= 0) return null;
    start = Math.max(0, size - length);
    end = size - 1;
  } else {
    start = Number(rawStart);
    if (!Number.isInteger(start) || start < 0) return null;
    // Checked before the end, and before comparing the two. A request that
    // begins past the last byte is unsatisfiable, and answering it with the
    // whole file — which is what treating it as malformed would do — hands
    // back 36MB to a client that asked for none of it.
    if (start >= size) return "unsatisfiable";

    end = rawEnd === "" ? size - 1 : Number(rawEnd);
    if (!Number.isInteger(end) || end < start) return null;
    end = Math.min(end, size - 1);
  }

  return { start, end };
}
