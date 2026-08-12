import {
  authSecret,
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

export interface Session {
  /** Verified, and the only thing that decides whether this account is admin. */
  email: string;
  /** Display name — Google's profile name, or the address for a local sign-in. */
  name: string;
  picture?: string;
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
 */

/**
 * Signing key. A missing AUTH_SECRET in development falls back to a fixed
 * string so a fresh clone can be signed into locally; in production it stays
 * empty, and an empty key disables sign-in altogether rather than silently
 * signing cookies with a value an attacker could guess.
 */
function secret(): string {
  if (authSecret) return authSecret;
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
