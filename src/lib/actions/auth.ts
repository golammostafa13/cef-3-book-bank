"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  adminEmails,
  isAdminEmail,
  isEmailSignInAllowed,
  isRegistrationOpen,
  matchesCode,
  normaliseEmail,
  sessionCookieName,
  sessionCookieOptions,
  signupCode,
  unlockCode,
} from "@/lib/auth/config";
import { verifyGoogleIdToken } from "@/lib/auth/google";
import { readSessionToken, signSession } from "@/lib/auth/session";
import { getDictionaryFor, localePath } from "@/lib/i18n";
import { defaultLocale, hasLocale } from "@/lib/i18n/config";

/**
 * Getting in, by either of the two doors.
 *
 * **Signing in** is for people who already have an account with this library —
 * in practice its librarians. Google returns an ID token, it is verified
 * against Google's published keys, and the address inside becomes the session.
 *
 * **Registering** is for whoever is holding a hard copy. Two codes are printed
 * in the book as QR codes: the first opens the sign-up form, the second
 * finishes the account. Neither proves anything about the address that was
 * typed — only that the person had the book in their hands.
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
   *
   * React resets a form once its action returns, which for a one-field form is
   * invisible and for the three-field sign-up is infuriating: mistype the code
   * and you retype your name and address as well. The form remounts its fields
   * from these, keyed on `attempt`, so only the field that was wrong is empty.
   */
  values?: { name?: string; email?: string };
  /** Bumped every time, so a second identical rejection still remounts. */
  attempt?: number;
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
 *
 * Anything stricter rejects valid addresses, and neither path that calls this
 * proves anything about the address anyway. Split rather than matched — a
 * pattern for this shape backtracks, and there is no reason to hand a form
 * field a regex to chew on.
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
      via: "google",
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
  if (!isEmailShaped(email)) {
    return { ok: false, message: dict.auth.errorEmailInvalid };
  }

  if (adminEmails.length > 0 && !isAdminEmail(email)) {
    return { ok: false, message: dict.auth.errorNotAdmin };
  }

  await setSessionCookie(
    await signSession({ email, name: email.split("@")[0], via: "email" }),
  );

  redirect(destination(formData, lang));
}

/* -------------------------------------------------------------------------
 * Registering from a hard copy
 * ---------------------------------------------------------------------- */

/**
 * The first of the two printed codes.
 *
 * Takes a name, an address and the code from the book, and issues a session
 * that can see exactly one page: the one asking for the second code. Stopping
 * here on purpose is what makes the second QR worth printing — otherwise the
 * first code alone would be the whole gate and the second would be ceremony.
 *
 * Nothing is stored. There is no users table to write to, and the name and
 * address go straight into the signed cookie, which is the entire account. A
 * reader on a new device registers again; the codes are in their book.
 */
export async function signUpAction(
  prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const lang = localeOf(formData);
  const dict = getDictionaryFor(lang);

  const name = String(formData.get("name") ?? "").trim();
  const email = normaliseEmail(String(formData.get("email") ?? ""));

  // Every rejection below hands back what was typed. The code is deliberately
  // not among it: it is the one field that might be wrong, and a form that
  // helpfully refills a wrong answer is a form you cannot get past.
  const reject = (message: string): SignInState => ({
    ok: false,
    message,
    values: { name, email },
    attempt: (prev.attempt ?? 0) + 1,
  });

  if (!isRegistrationOpen()) return reject(dict.auth.errorUnavailable);

  if (!name) return reject(dict.auth.errorNameEmpty);
  if (!email) return reject(dict.auth.errorEmailEmpty);
  if (!isEmailShaped(email)) return reject(dict.auth.errorEmailInvalid);

  // The codes are printed and therefore public, and this form takes whatever
  // address it is handed. Without this, a reader could register as the
  // librarian and `canAdminister` would be the only thing standing between
  // them and /admin. It is — but one lock on a door this cheap to reach is
  // one too few, so the address is refused here as well.
  if (isAdminEmail(email)) return reject(dict.auth.errorEmailReserved);

  if (!matchesCode(String(formData.get("code") ?? ""), signupCode)) {
    return reject(dict.auth.errorCodeWrong);
  }

  await setSessionCookie(
    await signSession({ email, name, via: "qr", gate: "registered" }),
  );

  redirect(localePath(lang, "/unlock"));
}

/**
 * The second of the two printed codes, typed by hand.
 *
 * The QR itself goes to `/api/unlock`, which does this without a form — a
 * Server Component cannot set a cookie, so a scan has to land on a route
 * handler. This action is the fallback for a camera that will not focus and
 * for anyone who would rather read the code off the page and type it.
 */
export async function unlockAction(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const lang = localeOf(formData);
  const dict = getDictionaryFor(lang);

  const store = await cookies();
  const session = await readSessionToken(store.get(sessionCookieName)?.value);
  // Nothing to upgrade. Sent back to the first code rather than shown an
  // error: an expired half-finished registration is not a mistake anyone made.
  if (!session) redirect(localePath(lang, "/signup"));

  if (!matchesCode(String(formData.get("code") ?? ""), unlockCode)) {
    return { ok: false, message: dict.auth.errorCodeWrong };
  }

  // Re-signed rather than patched: the cookie is the account, and the only
  // thing that changes is how far through the door it is. The expiry is reset
  // with it, which is right — this is the moment the account began.
  await setSessionCookie(
    await signSession({
      email: session.email,
      name: session.name,
      picture: session.picture,
      via: session.via ?? "qr",
      gate: "unlocked",
    }),
  );

  redirect(destination(formData, lang, "/"));
}

/**
 * Sign out.
 *
 * The form may post a `lang`, in which case that is the language signed out
 * *of* and the one to land in — a reader who was in বাংলা has not asked to
 * read English by leaving. Without one it falls back to the default, which is
 * what `proxy.ts` would have chosen anyway.
 *
 * It lands on the door rather than the home page, which is where `proxy.ts`
 * sends a session-less visitor asking for `/` anyway. The difference is *when*:
 * a redirect the router follows in place never passes through the proxy, so
 * naming the home page here left the catalogue on screen — signed out, but
 * still showing — until the next full page load.
 */
export async function signOutAction(formData?: FormData): Promise<void> {
  const store = await cookies();
  store.delete(sessionCookieName);
  redirect(localePath(formData ? localeOf(formData) : defaultLocale, "/signin"));
}
