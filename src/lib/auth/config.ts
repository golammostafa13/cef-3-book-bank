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
 * The two printed codes
 * ---------------------------------------------------------------------- */

/**
 * Registration takes two codes, and both are printed in the hard copy as QR
 * codes. The first opens the sign-up form, the second finishes the account.
 *
 * They are shared secrets on paper, which means they are not secrets in any
 * strong sense: anyone who photographs the page can pass on what they saw.
 * That is inherent to a single static print run and is the level of assurance
 * being bought here — a door with a lock on it, not a vault. Nothing that
 * matters is decided by these codes; being an administrator still hangs
 * entirely on `ADMIN_EMAILS`, which no QR can grant.
 *
 * `SIGNUP_CODE` falls back to the value printed in the current run, so a fresh
 * clone matches the books already in circulation without any configuration.
 */
export const signupCode = (process.env.SIGNUP_CODE ?? "Cef-3").trim();

/** The second code. Unset means the second gate cannot be passed at all. */
export const unlockCode = (process.env.UNLOCK_CODE ?? "").trim();

/**
 * Codes are compared leniently — trimmed, case-insensitive, and with the dashes
 * and spaces people insert when copying from a printed page thrown away.
 *
 * The strictness would buy nothing: an attacker pastes the code exactly, and
 * the only person a case-sensitive comparison ever turns away is the reader
 * typing `cef-3` off the back of a book.
 */
function canonicalCode(value: string): string {
  return value.trim().toLowerCase().replace(/[\s-]+/g, "");
}

/**
 * Compares a submitted code against a configured one.
 *
 * An unset expected code matches nothing. Otherwise a blank `UNLOCK_CODE` on a
 * misconfigured deployment would let an empty form field through the gate.
 */
export function matchesCode(submitted: string, expected: string): boolean {
  if (!expected) return false;
  return canonicalCode(submitted) === canonicalCode(expected);
}

/** True when the printed-code registration flow can actually complete. */
export function isRegistrationOpen(): boolean {
  return Boolean(signupCode && unlockCode);
}

