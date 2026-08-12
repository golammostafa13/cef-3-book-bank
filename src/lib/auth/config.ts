/**
 * Who may sign in, and who is an administrator.
 *
 * Two separate questions, deliberately:
 *
 *   • **Signing in** is open. Anyone with a Google account can, and it gives
 *     them nothing they did not already have — the catalogue is free to read
 *     without an account at all.
 *   • **Administering** is a short list of addresses. `ADMIN_EMAILS` is compared
 *     against the signed-in address every time it matters, which is the whole
 *     authorisation model: no users table, no roles to assign, no invitations to
 *     revoke.
 *
 * Everything comes from the environment. Nothing sensitive is committed.
 */

/** The admin account's username. Defined apart from here — see that module. */
export { adminUsername } from "@/lib/auth/username";

/** Google OAuth 2.0 Web client id. Public by design — it ships to the browser. */
export const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

/**
 * The addresses that administer this library.
 *
 * One value, comma- or whitespace-separated, so a librarian with several
 * accounts — or several librarians — need not share one inbox. `ADMIN_EMAIL`
 * (singular) is still read as a fallback: it is the older name for the same
 * setting and a single address remains a perfectly good list.
 *
 * Empty means *nobody* is an administrator — `isAdminEmail` refuses everything
 * rather than letting an unset variable match a blank email and hand /admin to
 * the next visitor.
 */
export const adminEmails: readonly string[] = parseEmailList(
  process.env.ADMIN_EMAILS ?? process.env.ADMIN_EMAIL ?? "",
);

/** Cookie signing secret. Any long random string; rotate to log everyone out. */
export const authSecret = process.env.AUTH_SECRET ?? "";

export const sessionCookieName = "cef3_session";

/** Eight hours: one working day at the desk, then sign in again. */
export const sessionTtlSeconds = 8 * 60 * 60;

/**
 * Addresses are compared case-insensitively, and untrimmed input is a typo
 * rather than a different account — so both sides of every comparison go
 * through here.
 */
export function normaliseEmail(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Splits a configured list into normalised addresses.
 *
 * Commas, semicolons and any whitespace all separate, because a value pasted
 * into a hosting dashboard picks up whichever the person happened to type — and
 * an empty entry from a trailing comma is a typo, not an address that matches
 * everyone.
 */
export function parseEmailList(value: string): string[] {
  return value
    .split(/[\s,;]+/)
    .map(normaliseEmail)
    .filter(Boolean);
}

/**
 * The authorisation decision, in one function.
 *
 * Called on every admin page, every admin Server Action and in the route guard,
 * against the address in the session rather than anything the browser sent.
 */
export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return adminEmails.includes(normaliseEmail(email));
}

/** True when Google sign-in can actually run. */
export function isGoogleConfigured(): boolean {
  return Boolean(googleClientId && authSecret);
}

/**
 * The local escape hatch.
 *
 * Without a Google client id there is no way to sign in at all, which makes the
 * admin unreachable on a fresh clone. In development only, and only when Google
 * is *not* configured, the sign-in page accepts an address directly. Production
 * builds can never take this path — the check is on NODE_ENV, which Next inlines
 * at build time, so the branch is compiled out of a production bundle entirely.
 */
export function isDevSignInAllowed(): boolean {
  return process.env.NODE_ENV !== "production" && !googleClientId;
}
