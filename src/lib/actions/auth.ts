"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  adminEmails,
  isAdminEmail,
  isDevSignInAllowed,
  isEmailSignInAllowed,
  normaliseEmail,
  sessionCookieName,
  sessionTtlSeconds,
} from "@/lib/auth/config";
import { verifyGoogleIdToken } from "@/lib/auth/google";
import { signSession } from "@/lib/auth/session";
import { getDictionaryFor, localePath } from "@/lib/i18n";
import { defaultLocale, hasLocale } from "@/lib/i18n/config";

/**
 * Sign-in, in one step.
 *
 * Anyone may sign in. Google returns an ID token, it is verified against
 * Google's published keys, and the address inside becomes the session — no
 * allowlist, no second factor, no waiting to be approved.
 *
 * Whether that session can administer the library is a separate question,
 * answered by `isAdminEmail` every time it is asked rather than granted here.
 * Signing in and being the administrator are different things, and keeping them
 * apart is what lets this page be an ordinary sign-in page.
 */

export interface SignInState {
  ok: boolean;
  message?: string;
}

/**
 * Which language to answer in.
 *
 * Server Actions cannot read route params, so the forms post the locale they
 * were rendered in. It is validated rather than trusted — an unknown value just
 * falls back to the default language.
 */
function localeOf(formData: FormData) {
  const value = String(formData.get("lang") ?? "");
  return hasLocale(value) ? value : defaultLocale;
}

/**
 * Where to go once signed in.
 *
 * The sign-in page passes through whatever the guard asked for, so someone sent
 * here from an admin screen lands back on it. Only ever a path on this site: a
 * `next` of `https://elsewhere` would be an open redirect.
 */
function destination(formData: FormData, lang: ReturnType<typeof localeOf>) {
  const next = String(formData.get("next") ?? "");
  return next.startsWith("/") && !next.startsWith("//")
    ? next
    : localePath(lang, "/books");
}

/** The session cookie's flags are the same in every path that sets one. */
async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(sessionCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionTtlSeconds,
  });
}

/** Called with the credential from Google Identity Services. */
export async function signInWithGoogleAction(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const lang = localeOf(formData);
  const dict = getDictionaryFor(lang);

  const credential = String(formData.get("credential") ?? "");
  if (!credential) {
    return { ok: false, message: dict.auth.errorNoCredential };
  }

  const identity = await verifyGoogleIdToken(credential);
  if (!identity) {
    return { ok: false, message: dict.auth.errorUnverified };
  }

  // An unverified address on a Google account is not proof of anything, and
  // this one decides whether the session is the administrator's.
  if (!identity.emailVerified) {
    return { ok: false, message: dict.auth.errorUnverified };
  }

  await setSessionCookie(
    await signSession({
      email: identity.email,
      name: identity.name,
      picture: identity.picture,
    }),
  );

  redirect(destination(formData, lang));
}

/**
 * Development only, and only when Google is not configured — see
 * `isDevSignInAllowed`. Lets a fresh clone sign in without an OAuth client.
 *
 * It accepts any address, exactly as the Google path does. What it cannot do is
 * *prove* the address belongs to whoever typed it, which is why it is confined
 * to development and compiled out of a production build.
 */
export async function devSignInAction(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const lang = localeOf(formData);
  const dict = getDictionaryFor(lang);

  if (!isEmailSignInAllowed()) {
    return { ok: false, message: dict.auth.errorUnavailable };
  }

  const email = normaliseEmail(String(formData.get("email") ?? ""));
  if (!email) return { ok: false, message: dict.auth.errorEmailEmpty };
  // Deliberately loose: one @, a dot in the domain, no spaces. Anything
  // stricter rejects valid addresses, and this path proves nothing about the
  // address anyway. Split rather than matched — a pattern for this shape
  // backtracks, and there is no reason to hand a form field a regex to chew on.
  const parts = email.split("@");
  const valid =
    parts.length === 2 &&
    parts[0].length > 0 &&
    parts[1].includes(".") &&
    !parts[1].startsWith(".") &&
    !parts[1].endsWith(".") &&
    !email.includes(" ");
  if (!valid) return { ok: false, message: dict.auth.errorEmailInvalid };

  if (adminEmails.length > 0 && !isAdminEmail(email)) {
    return { ok: false, message: dict.auth.errorNotAdmin };
  }

  await setSessionCookie(
    await signSession({ email, name: email.split("@")[0] }),
  );

  redirect(destination(formData, lang));
}

/**
 * Sign out. Takes no form data, so it has no locale to read — it lands on the
 * default language's home page, which `proxy.ts` would have chosen anyway.
 */
export async function signOutAction(): Promise<void> {
  const store = await cookies();
  store.delete(sessionCookieName);
  redirect(localePath(defaultLocale));
}
