import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sessionCookieName } from "@/lib/auth/config";
import {
  canAdminister,
  hasLibraryAccess,
  readSessionToken,
} from "@/lib/auth/session";

/**
 * Who the browser is signed in as, for the header.
 *
 * The session cookie is `httpOnly` — deliberately, so a script that gets onto
 * the page cannot walk off with it — which means the client cannot read the
 * name out of it. This endpoint is how it asks.
 *
 * It exists so the header can stay out of the render path. Reading the session
 * in the layout would opt every page in the site out of prerendering for one
 * name in one corner of one bar; asking for it after paint keeps the pages
 * static and costs a request that overlaps with the rest of the page load.
 *
 * Nothing sensitive is returned that the person is not already holding, and
 * `no-store` keeps one reader's name off another's screen via a shared cache.
 */

export interface SessionSummary {
  name: string;
  email: string;
  /** Whether this account may administer the library. */
  admin: boolean;
  /** Registered with the first printed code and no further. */
  pending: boolean;
}

const noStore = {
  // `private` as well as `no-store`: the response is per-reader, and a proxy in
  // front of this deployment must never hold it for anyone else.
  "cache-control": "no-store, private",
} as const;

export async function GET(request: NextRequest) {
  const session = await readSessionToken(
    request.cookies.get(sessionCookieName)?.value,
  );

  if (!session) {
    return NextResponse.json({ session: null }, { headers: noStore });
  }

  const summary: SessionSummary = {
    // An email sign-in stores the local part as the name, but a token written
    // by an older build may have neither — so fall back rather than render an
    // empty pill.
    name: session.name?.trim() || session.email.split("@")[0],
    email: session.email,
    admin: canAdminister(session),
    pending: !hasLibraryAccess(session),
  };

  return NextResponse.json({ session: summary }, { headers: noStore });
}
