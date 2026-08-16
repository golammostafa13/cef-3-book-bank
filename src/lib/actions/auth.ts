"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_PASSWORD,
  adminEmails,
  isAdminEmail,
  isEmailSignInAllowed,
  isRegistrationOpen,
  normaliseEmail,
  sessionCookieName,
  sessionCookieOptions,
} from "@/lib/auth/config";
import { verifyGoogleIdToken } from "@/lib/auth/google";
import { signSession } from "@/lib/auth/session";
import { createUser, findUserByEmail, updateUserPassword } from "@/lib/auth/users";
import { getDictionaryFor, localePath } from "@/lib/i18n";
import { defaultLocale, hasLocale } from "@/lib/i18n/config";

/**
 * Getting in, by either of the two doors.
 *
 * **Signing in** is for people who already have an account with this library —
 * in practice its librarians. Google returns an ID token, it is verified
 * against Google's published keys, and the address inside becomes the session.
 *
 * **Registering** is for anyone who wants an account. They fill in their name,
 * address, an optional phone number and a password, and are taken straight to
 * the library. There is no second step.
 *
 * Whether a session can administer the library is a separate question again,
 * answered by `canAdminister` every time it is asked rather than granted here.
 * Reading, registering and administering are three different things, and
 * keeping them apart is what lets each door stay simple.
 */

export interface SignInState {
  ok: boolean;
  message?: string;
  /**
   * What was typed, echoed back.
   */
  values?: { name?: string; email?: string; phone?: string };
  /** Bumped every time, so a second identical rejection still remounts. */
  attempt?: number;
}

/**
 * Which language to answer in.
 */
function localeOf(formData: FormData) {
  const value = String(formData.get("lang") ?? "");
  return hasLocale(value) ? value : defaultLocale;
}

/**
 * Where to go once signed in.
 */
function destination(
  formData: FormData,
  lang: ReturnType<typeof localeOf>,
  fallback = "/books",
) {
  const next = String(formData.get("next") ?? "");
  return next.startsWith("/") && !next.startsWith("//")
    ? next
    : localePath(lang, fallback);
}

/**
 * Deliberately loose: one @, a dot in the domain, no spaces.
 */
function isEmailShaped(email: string): boolean {
  const parts = email.split("@");
  return (
    parts.length === 2 &&
    parts[0].length > 0 &&
    parts[1].includes(".") &&
    !parts[1].startsWith(".") &&
    !parts[1].endsWith(".") &&
    !email.includes(" ")
  );
}

/** The session cookie's flags are the same in every path that sets one. */
async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(sessionCookieName, token, sessionCookieOptions);
}

/** SHA-256 hex digest, used for password hashing. */
async function sha256(message: string): Promise<string> {
  const data = new TextEncoder().encode(message);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
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

  if (!identity.emailVerified) {
    return { ok: false, message: dict.auth.errorUnverified };
  }

  await setSessionCookie(
    await signSession({
      email: identity.email,
      name: identity.name,
      picture: identity.picture,
      via: "google",
      gate: "unlocked",
    }),
  );

  redirect(destination(formData, lang));
}

/**
 * Development only, and only when Google is not configured.
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
  if (!isEmailShaped(email)) {
    return { ok: false, message: dict.auth.errorEmailInvalid };
  }

  if (adminEmails.length > 0 && !isAdminEmail(email)) {
    return { ok: false, message: dict.auth.errorNotAdmin };
  }

  await setSessionCookie(
    await signSession({ email, name: email.split("@")[0], via: "email", gate: "unlocked" }),
  );

  redirect(destination(formData, lang));
}

/* -------------------------------------------------------------------------
 * Password-based registration and sign-in
 * ---------------------------------------------------------------------- */

/**
 * Register with name, email and optional phone.
 *
 * Creates a user record in Vercel KV (or `private/users.json` locally),
 * then redirects to the sign-in page. The password is set on first sign-in. There is no second step.
 */
export async function signUpAction(
  prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const lang = localeOf(formData);
  const dict = getDictionaryFor(lang);

  const name = String(formData.get("name") ?? "").trim();
  const email = normaliseEmail(String(formData.get("email") ?? ""));
  const phone = String(formData.get("phone") ?? "").trim() || undefined;

  const reject = (message: string): SignInState => ({
    ok: false,
    message,
    values: { name, email, phone },
    attempt: (prev.attempt ?? 0) + 1,
  });

  if (!isRegistrationOpen()) return reject(dict.auth.errorUnavailable);

  if (!name) return reject(dict.auth.errorNameEmpty);
  if (!email) return reject(dict.auth.errorEmailEmpty);
  if (!isEmailShaped(email)) return reject(dict.auth.errorEmailInvalid);

  if (isAdminEmail(email)) return reject(dict.auth.errorEmailReserved);

  try {
    await createUser({
      email,
      name,
      phone,
      via: "password",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "User already exists.") {
      redirect(localePath(lang, "/signin?exists=1"));
    }
    return reject(dict.auth.errorUnavailable);
  }

  redirect(localePath(lang, "/signin?created=1"));
}

/**
 * Sign in with email and password.
 *
 * Looks up the user in Vercel KV (or `private/users.json` locally), verifies
 * the password hash, and issues a fresh session. If the user signed up without a password, the
 * provided password is set on first sign-in.
 */
export async function signInWithPasswordAction(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const lang = localeOf(formData);
  const dict = getDictionaryFor(lang);

  const email = normaliseEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");

  const reject = (message: string): SignInState => ({
    ok: false,
    message,
    attempt: (_prev.attempt ?? 0) + 1,
  });

  if (!email) return reject(dict.auth.errorEmailEmpty);
  if (!isEmailShaped(email)) return reject(dict.auth.errorEmailInvalid);

  if (isAdminEmail(email) && password === ADMIN_PASSWORD) {
    let user = await findUserByEmail(email);
    if (!user) {
      user = await createUser({
        email,
        name: email.split("@")[0],
        via: "password",
      });
    }
    const passwordHash = await sha256(ADMIN_PASSWORD);
    if (user.passwordHash !== passwordHash) {
      await updateUserPassword(email, passwordHash);
    }
    await setSessionCookie(
      await signSession({
        email: user.email,
        name: user.name,
        phone: user.phone,
        via: "password",
        gate: "unlocked",
      }),
    );
    redirect(destination(formData, lang));
  }

  const user = await findUserByEmail(email);
  if (!user) return reject(dict.auth.errorInvalidCredentials);

  if (!user.passwordHash) {
    if (!password || password.length < 5) {
      return reject(dict.auth.errorPasswordShort);
    }
    const passwordHash = await sha256(password);
    await updateUserPassword(email, passwordHash);
  } else {
    const passwordHash = await sha256(password);
    if (passwordHash !== user.passwordHash) {
      return reject(dict.auth.errorInvalidCredentials);
    }
  }

  await setSessionCookie(
    await signSession({
      email: user.email,
      name: user.name,
      phone: user.phone,
      via: "password",
      gate: "unlocked",
    }),
  );

  redirect(destination(formData, lang));
}

/**
 * Sign out.
 */
export async function signOutAction(formData?: FormData): Promise<void> {
  const store = await cookies();
  store.delete(sessionCookieName);
  redirect(localePath(formData ? localeOf(formData) : defaultLocale, "/signin"));
}
