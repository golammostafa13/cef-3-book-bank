import {
  adminEmails,
  authSecret,
  isAdminEmail,
  sessionCookieName,
  sessionTtlSeconds,
} from "@/lib/auth/config";

/**
 * Session cookie: a JSON payload with an HMAC-SHA256 tag appended.
 *
 * Stateless on purpose. There is exactly one administrator, so a session store
 * would be a database table with one row in it — and a stateless token can be
 * checked inside `proxy.ts` without a round trip, which is what keeps the guard
 * on /admin free.
 *
 * Everything here uses Web Crypto only (no `node:crypto`), because the same
 * verification runs in the proxy runtime as in Server Actions.
 */

/**
 * How the account was obtained. This is not a role — see the note below — it
 * records *what was proved* at the door, which is a fact about the past and so
 * is safe to carry in the token.
 *
 *   • `google` — an ID token verified against Google's published keys.
 *   • `email`  — an address typed into the direct sign-in form.
 *   • `qr`     — the codes printed in a hard copy. Proves possession of a book
 *                and nothing whatever about the address that was typed.
 */
export type SignInMethod = "google" | "email" | "qr";

/**
 * How far through the printed-code flow this account is.
 *
 * `registered` has passed the first code and may see exactly one page: the one
 * asking for the second. `unlocked` has passed both and reads the library.
 * Sessions from `google` and `email` sign-in carry no gate at all — they never
 * entered the flow, and an absent gate reads as open.
 */
export type Gate = "registered" | "unlocked";

export interface Session {
  /** Verified, and the only thing that decides whether this account is admin. */
  email: string;
  /** Display name — Google's profile name, or the address for a local sign-in. */
  name: string;
  picture?: string;
  via?: SignInMethod;
  gate?: Gate;
  /** Seconds since the epoch. */
  exp: number;
}

/**
 * There is deliberately no `role` in the token.
 *
 * Anyone may sign in; whether a session is an administrator is decided by
 * comparing its email against `ADMIN_EMAILS` at the moment it is checked
 * (`isAdminEmail`). Stamping a role into an eight-hour cookie would mean an
 * env change took eight hours to take effect — and that revoking an admin
 * would not revoke the sessions already carrying the claim.
 *
 * `via` and `gate` are not counter-examples. Neither grants anything: `via`
 * only ever *withholds* administration (below), and `gate` only ever withholds
 * the catalogue. A forged token cannot be produced without the signing key, and
 * one that sets them to their most permissive values still gets no further than
 * an honest sign-in would.
 */

/**
 * Whether a session may read the library at all.
 *
 * Everything except the door is behind this: the catalogue, the book pages,
 * the reader and the files. Half-finished registrations are held back so that
 * scanning only the first of the two printed codes is not enough.
 */
export function hasLibraryAccess(
  session: Session | null | undefined,
): session is Session {
  return session != null && session.gate !== "registered";
}

/**
 * Whether a session may administer the library.
 *
 * The `via` check is the point of this function. The printed codes are public
 * — they are on paper, in circulation — and the sign-up form takes whatever
 * address it is given, so without this a reader could register as the
 * librarian's address and walk into /admin. A QR session is never an
 * administrator no matter whose address it carries; administration is reached
 * by proving an identity, and a code from a book proves possession of a book.
 */
export function canAdminister(session: Session | null | undefined): boolean {
  if (!session || session.via === "qr") return false;
  return isAdminEmail(session.email);
}

/**
 * Signing key. A missing AUTH_SECRET in development falls back to a fixed
 * string so a fresh clone can be signed into locally; in production it stays
 * empty, and an empty key disables sign-in altogether rather than silently
 * signing cookies with a value an attacker could guess.
 */
function secret(): string {
  if (authSecret) return authSecret;
  if (adminEmails.length > 0) return `admin-secret-${adminEmails.join(",")}`;
  return process.env.NODE_ENV === "production" ? "" : "dev-only-insecure-secret";
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array<ArrayBuffer> {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, "="));
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hmac(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  return base64UrlEncode(new Uint8Array(signature));
}

/** Length-independent comparison, so a tag can't be guessed a byte at a time. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function signSession(
  session: Omit<Session, "exp"> & { exp?: number },
): Promise<string> {
  if (!secret()) throw new Error("AUTH_SECRET is not set.");

  const payload: Session = {
    ...session,
    exp: session.exp ?? Math.floor(Date.now() / 1000) + sessionTtlSeconds,
  };
  const body = base64UrlEncode(
    new TextEncoder().encode(JSON.stringify(payload)),
  );
  return `${body}.${await hmac(body)}`;
}

/**
 * Verify and decode. Returns null for anything at all suspicious — a bad tag,
 * a malformed payload, an expired session — so callers only ever handle a
 * valid session or nothing.
 */
export async function readSessionToken(
  token: string | undefined,
): Promise<Session | null> {
  if (!token || !secret()) return null;

  const [body, tag] = token.split(".");
  if (!body || !tag) return null;
  if (!safeEqual(tag, await hmac(body))) return null;

  try {
    const session = JSON.parse(
      new TextDecoder().decode(base64UrlDecode(body)),
    ) as Session;

    if (typeof session.email !== "string" || typeof session.exp !== "number") {
      return null;
    }
    if (session.exp * 1000 < Date.now()) return null;

    return session;
  } catch {
    return null;
  }
}

export { sessionCookieName };
