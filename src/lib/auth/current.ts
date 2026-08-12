import { cookies } from "next/headers";
import { isAdminEmail } from "@/lib/auth/config";
import {
  readSessionToken,
  sessionCookieName,
  type Session,
} from "@/lib/auth/session";

/**
 * Reading the current session from a Server Component or Server Action.
 *
 * Split from `session.ts` because that module has to stay importable by
 * `proxy.ts`, which has no access to `next/headers`.
 */

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  return readSessionToken(store.get(sessionCookieName)?.value);
}

/**
 * The signed-in administrator, or null — including when someone *is* signed in
 * but is not the admin, which is the ordinary case now that anyone may sign in.
 */
export async function getAdmin(): Promise<Session | null> {
  const session = await getSession();
  return session && isAdminEmail(session.email) ? session : null;
}

/**
 * Hard gate for anything that mutates the catalogue.
 *
 * Server Actions are reachable by direct POST, so this is called inside every
 * one of them rather than being left to the proxy — a route guard protects
 * navigation, not endpoints.
 */
export async function requireAdmin(): Promise<Session> {
  const admin = await getAdmin();
  if (!admin) throw new Error("Not authorised.");
  return admin;
}
