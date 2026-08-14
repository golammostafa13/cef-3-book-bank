import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  canAdminister,
  readSessionToken,
  sessionCookieName,
} from "@/lib/auth/session";
import { hasLocale } from "@/lib/i18n/config";
import { preferredLocale } from "@/lib/i18n/negotiate";

/**
 * Three jobs, in order.
 *
 * 1. **Language.** Every route lives under `/[lang]`, so a request for `/books`
 *    has to be sent to `/en/books` or `/bn/books`. Which one is decided from
 *    the browser's own `Accept-Language`, because a Bengali reader typing the
 *    bare domain should land in Bengali. This runs once, on the way in; from
 *    then on the language is in the URL and every link carries it, so no
 *    further redirects happen while browsing.
 *
 * 2. **The library gate.** Nothing on these shelves opens for a signed-out
 *    visitor. Three routes are outside it — the two doors and the second
 *    printed code — and everything else, catalogue included, needs a session
 *    that has finished getting one.
 *
 * 3. **The admin guard.** This is the optimistic check the Next.js docs
 *    describe: it keeps everyone who is not the administrator from ever seeing
 *    an admin screen, and it costs nothing because the session is a signed
 *    cookie that can be verified here without a data round trip. It is *not*
 *    the authorisation boundary — every Server Action calls `requireAdmin()`
 *    itself, because a POST never passes through a page.
 *
 * Note what this file cannot reach: anything under `/api` or with a file
 * extension is excluded by the matcher below, so the book files are not
 * protected from here. They are served by a route handler that checks the same
 * session itself — see `app/api/file/[slug]/route.ts`.
 */

/**
 * The pages that must stay reachable without an account, or nobody could ever
 * get one. Everything else in the site is behind the gate.
 *
 * `qr` is the proof sheet for the printed codes. It is open here because it
 * has to be scannable before anyone has an account — and it answers 404 in a
 * production build, which is the check that actually matters.
 */
const OPEN_ROUTES = new Set(["signin", "signup", "unlock", "qr"]);

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const segments = pathname.split("/").filter(Boolean);
  const lang = hasLocale(segments[0]) ? segments[0] : null;

  // --- 1. Language prefix ------------------------------------------------
  if (!lang) {
    const target = request.nextUrl.clone();
    const chosen = preferredLocale(request.headers.get("accept-language"));
    // The bare domain opens the door, not the library: `/` lands on sign-in,
    // which is where someone without an account has to start. Every other path
    // keeps whatever it asked for, so a gated URL survives the round trip
    // through sign-in and the reader arrives where they were going.
    target.pathname =
      pathname === "/" ? `/${chosen}/signin` : `/${chosen}${pathname}`;
    return NextResponse.redirect(target);
  }

  const route = segments[1] ?? "";
  if (OPEN_ROUTES.has(route)) return NextResponse.next();

  // --- 2. The library gate -----------------------------------------------
  const session = await readSessionToken(
    request.cookies.get(sessionCookieName)?.value,
  );

  const target = request.nextUrl.clone();
  target.search = "";

  if (!session) {
    target.pathname = `/${lang}/signin`;
    // Come back to whatever was asked for once the sign-in finishes.
    target.searchParams.set("next", pathname + search);
    return NextResponse.redirect(target);
  }

  // Registered with the first printed code and no further. There is exactly
  // one page such a session may see, and it is the one asking for the second.
  if (session.gate === "registered") {
    target.pathname = `/${lang}/unlock`;
    target.searchParams.set("next", pathname + search);
    return NextResponse.redirect(target);
  }

  // --- 3. Admin guard ----------------------------------------------------
  if (route !== "admin") return NextResponse.next();
  if (canAdminister(session)) return NextResponse.next();

  // Signed in, but not as the administrator: there is nothing to sign in *to*,
  // so sending them to the sign-in form would be a loop. They go to the
  // catalogue instead — which is everything this site is for anyway.
  target.pathname = `/${lang}/books`;
  return NextResponse.redirect(target);
}

export const config = {
  /**
   * Everything except Next's own assets and the files that must keep their
   * real, unprefixed paths: the sitemap and robots.txt (crawlers ask for them
   * at the root), the PDF worker, and anything else in `public/`.
   *
   * Matching on "has a dot in the last segment" is what excludes public files
   * without having to list them. The book files themselves are no longer among
   * them — they live outside `public/` now, precisely because a rule this
   * broad cannot tell a protected PDF from a favicon.
   */
  // A plain string literal, not String.raw or a computed value: the build
  // statically parses this export, and anything it cannot evaluate fails the
  // build with "Invalid segment configuration export".
  matcher: [
    "/((?!_next/|api/|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.[\\w]+$).*)",
  ],
};
