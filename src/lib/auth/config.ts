/**
 * Who may read the library, and who is an administrator.
 *
 * Two separate questions, deliberately:
 *
 *   • **Reading** requires an account. Nothing on these shelves opens for a
 *     signed-out visitor — not a book page, not the reader, not a file. An
 *     account is granted either by signing in, or by registering with the two
 *     codes printed in a hard copy (see `signupCode` / `unlockCode` below).
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
 * The session cookie's flags, in one place.
 *
 * Three code paths set this cookie — two Server Actions and the unlock route
 * handler — and a cookie that is `httpOnly` in two of them and not the third
 * is not a cookie anyone can reason about.
 */
export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: sessionTtlSeconds,
} as const;

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
 * Direct email sign-in is allowed when Google is not configured, provided
 * that either we are outside production or admin emails have been configured.
 */
export function isEmailSignInAllowed(): boolean {
  return (
    !googleClientId &&
    (process.env.NODE_ENV !== "production" || adminEmails.length > 0)
  );
}

/** Legacy alias for `isEmailSignInAllowed`. */
export const isDevSignInAllowed = isEmailSignInAllowed;

/* -------------------------------------------------------------------------
 * Registration
 * ---------------------------------------------------------------------- */

/**
 * Password-based registration is always open. The printed-code flow is
 * removed; accounts are created directly from the sign-up form.
 */
export function isRegistrationOpen(): boolean {
  return true;
}

