import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  matchesCode,
  sessionCookieName,
  sessionCookieOptions,
  unlockCode,
} from "@/lib/auth/config";
import { readSessionToken, signSession } from "@/lib/auth/session";
import { localePath } from "@/lib/i18n/config";
import { preferredLocale } from "@/lib/i18n/negotiate";

/**
 * Where the second QR code in a hard copy lands: `/api/unlock?k=<code>`.
 *
 * A route handler rather than a page because this has to set a cookie, and a
 * Server Component cannot. The reader scans, the account finishes, and they
 * arrive at the library — one tap, nothing typed.
 *
 * The code travels in the query string, which normally would be a mistake:
 * query strings end up in server logs and browser history. It is not one here,
 * because the code is printed in a book. There is nothing in that URL that the
 * person holding it does not already have in their hands.
 */
export async function GET(request: NextRequest) {
  // A QR code carries no language. The phone's own preference decides, exactly
  // as it does for anyone typing the bare domain.
  const lang = preferredLocale(request.headers.get("accept-language"));
  const at = (path: string) => new URL(localePath(lang, path), request.url);

  const session = await readSessionToken(
    request.cookies.get(sessionCookieName)?.value,
  );

  // No account to finish. Happens whenever the two codes are scanned in
  // different browsers — the first on a laptop, the second on a phone — which
  // is a thing people will do, so it is a redirect to step one and not an
  // error page.
  if (!session) return NextResponse.redirect(at("/signup"));

  // Already through. Scanning the code again should not be a dead end, and
  // re-signing a session that is not waiting on anything would only reset its
  // clock for no reason.
  if (session.gate !== "registered") return NextResponse.redirect(at("/"));

  if (!matchesCode(request.nextUrl.searchParams.get("k") ?? "", unlockCode)) {
    // Sent to the page rather than answered here, so the reader gets the
    // manual form and an explanation instead of a bare redirect they cannot
    // interpret.
    const target = at("/unlock");
    target.searchParams.set("bad", "1");
    return NextResponse.redirect(target);
  }

  const token = await signSession({
    email: session.email,
    name: session.name,
    picture: session.picture,
    via: session.via ?? "qr",
    gate: "unlocked",
  });

  const response = NextResponse.redirect(at("/"));
  response.cookies.set(sessionCookieName, token, sessionCookieOptions);
  return response;
}
