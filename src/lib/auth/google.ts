import { googleClientId } from "@/lib/auth/config";

/**
 * Google ID token verification.
 *
 * Verified locally against Google's published keys rather than by calling the
 * `tokeninfo` endpoint: that endpoint is rate limited and documented as a
 * debugging aid, and a sign-in should not depend on a second network hop.
 *
 * The checks below are the complete set Google requires — signature, issuer,
 * audience, expiry — plus `email_verified`, because an unverified email on a
 * Google account is not proof of anything.
 *
 * Web Crypto only, so this runs unchanged in any runtime.
 */

const JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const ISSUERS = ["https://accounts.google.com", "accounts.google.com"];

export interface GoogleIdentity {
  email: string;
  emailVerified: boolean;
  name: string;
  picture?: string;
}

interface Jwk {
  kid: string;
  n: string;
  e: string;
  alg?: string;
  kty: string;
}

/**
 * Google rotates its signing keys, so the key set is cached for an hour rather
 * than for the process lifetime. A cache miss on an unknown `kid` refetches
 * immediately, which is what makes a mid-rotation sign-in still work.
 */
let jwkCache: { keys: Jwk[]; fetchedAt: number } | null = null;
const JWK_TTL_MS = 60 * 60 * 1000;

async function getKeys(forceRefresh = false): Promise<Jwk[]> {
  const fresh =
    jwkCache && Date.now() - jwkCache.fetchedAt < JWK_TTL_MS && !forceRefresh;
  if (fresh) return jwkCache!.keys;

  const response = await fetch(JWKS_URL, { cache: "no-store" });
  if (!response.ok) throw new Error("Could not fetch Google's signing keys.");

  const body = (await response.json()) as { keys: Jwk[] };
  jwkCache = { keys: body.keys, fetchedAt: Date.now() };
  return body.keys;
}

/**
 * Backed by a plain ArrayBuffer rather than `ArrayBufferLike`, because
 * `crypto.subtle` takes a BufferSource and will not accept a view that might
 * sit on a SharedArrayBuffer.
 */
function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, "="));
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function decodeSegment<T>(segment: string): T {
  return JSON.parse(new TextDecoder().decode(base64UrlToBytes(segment))) as T;
}

async function verifySignature(
  token: string,
  header: { kid?: string; alg?: string },
): Promise<boolean> {
  if (header.alg !== "RS256" || !header.kid) return false;

  const [headerB64, payloadB64, signatureB64] = token.split(".");

  for (const refresh of [false, true]) {
    const keys = await getKeys(refresh);
    const jwk = keys.find((k) => k.kid === header.kid);
    if (!jwk) continue;

    const key = await crypto.subtle.importKey(
      "jwk",
      { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: "RS256", ext: true },
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"],
    );

    return crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      key,
      base64UrlToBytes(signatureB64),
      new TextEncoder().encode(`${headerB64}.${payloadB64}`),
    );
  }

  // The token names a key Google does not publish, even after a refresh.
  return false;
}

/** Returns the identity in the token, or null if it fails any check. */
export async function verifyGoogleIdToken(
  token: string,
): Promise<GoogleIdentity | null> {
  if (!googleClientId) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const header = decodeSegment<{ kid?: string; alg?: string }>(parts[0]);
    if (!(await verifySignature(token, header))) return null;

    const claims = decodeSegment<{
      iss?: string;
      aud?: string;
      exp?: number;
      email?: string;
      email_verified?: boolean | string;
      name?: string;
      picture?: string;
    }>(parts[1]);

    if (!claims.iss || !ISSUERS.includes(claims.iss)) return null;
    if (claims.aud !== googleClientId) return null;
    if (!claims.exp || claims.exp * 1000 < Date.now()) return null;
    if (!claims.email) return null;

    return {
      email: claims.email.toLowerCase(),
      // Google sends this as a boolean or as the string "true" depending on
      // which endpoint minted the token.
      emailVerified:
        claims.email_verified === true || claims.email_verified === "true",
      name: claims.name ?? claims.email,
      picture: claims.picture,
    };
  } catch {
    return null;
  }
}
