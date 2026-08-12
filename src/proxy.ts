import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAdminEmail } from "@/lib/auth/config";
import { readSessionToken, sessionCookieName } from "@/lib/auth/session";
import { defaultLocale, hasLocale } from "@/lib/i18n/config";

/**
 * Two jobs, in order.
 *
 * 1. **Language.** Every route lives under `/[lang]`, so a request for `/books`
 *    has to be sent to `/en/books` or `/bn/books`. Which one is decided from
 *    the browser's own `Accept-Language`, because a Bengali reader typing the
 *    bare domain should land in Bengali. This runs once, on the way in; from
 *    then on the language is in the URL and every link carries it, so no
 *    further redirects happen while browsing.
 *
 * 2. **The admin guard.** This is the optimistic check the Next.js docs
 *    describe: it keeps everyone who is not the administrator from ever seeing
 *    an admin screen, and it costs nothing because the session is a signed
 *    cookie that can be verified here without a data round trip. It is *not*
 *    the authorisation boundary — every Server Action calls `requireAdmin()`
 *    itself, because a POST never passes through a page.
 */

/**
 * Pick a language from `Accept-Language`.
 *
 * Hand-parsed rather than pulled from `negotiator` + `intl-localematcher`: two
 * locales and no regional variants do not need 40KB of dependency, and this
 * code has to run on every uncached first request.
 */
function preferredLocale(header: string | null) {
  if (!header) return defaultLocale;

  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return {
        tag: tag.trim().toLowerCase(),
        q: q ? Number(q.split("=")[1]) || 0 : 1,
      };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    // "bn-BD" and "bn" both mean Bengali here.
    const base = tag.split("-")[0];
    if (hasLocale(base)) return base;
  }
  return defaultLocale;
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const segments = pathname.split("/").filter(Boolean);
  const lang = hasLocale(segments[0]) ? segments[0] : null;

  // --- 1. Language prefix ------------------------------------------------
  if (!lang) {
    const target = request.nextUrl.clone();
    const chosen = preferredLocale(request.headers.get("accept-language"));
    // The bare domain opens the door, not the library: `/` lands on sign-in,
    // which offers the librarian a way in and everyone else a way straight
    // through to the shelves. Every other path keeps whatever it asked for.
    target.pathname =
      pathname === "/" ? `/${chosen}/signin` : `/${chosen}${pathname}`;
    return NextResponse.redirect(target);
  }

  // --- 2. Admin guard ----------------------------------------------------
  if (segments[1] !== "admin") return NextResponse.next();

  const session = await readSessionToken(
    request.cookies.get(sessionCookieName)?.value,
  );
  if (isAdminEmail(session?.email)) return NextResponse.next();

  const target = request.nextUrl.clone();
  target.search = "";

  // Signed in, but not as the administrator: there is nothing to sign in *to*,
  // so sending them to the sign-in form would be a loop. They go to the
  // catalogue instead — which is everything this site is for anyway.
  if (session) {
    target.pathname = `/${lang}/books`;
    return NextResponse.redirect(target);
  }

  target.pathname = `/${lang}/signin`;
  // Come back to whatever was asked for once the sign-in finishes.
  target.searchParams.set("next", pathname + search);
  return NextResponse.redirect(target);
}

export const config = {
  /**
   * Everything except Next's own assets and the files that must keep their
   * real, unprefixed paths: the sitemap and robots.txt (crawlers ask for them
   * at the root), the PDF worker, and anything else in `public/`.
   *
   * Matching on "has a dot in the last segment" is what excludes public files
   * without having to list them.
   */
  // A plain string literal, not String.raw or a computed value: the build
  // statically parses this export, and anything it cannot evaluate fails the
  // build with "Invalid segment configuration export".
  matcher: [
    "/((?!_next/|api/|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.[\\w]+$).*)",
  ],
};
