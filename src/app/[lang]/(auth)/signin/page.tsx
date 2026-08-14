import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { AuthAside, AuthCard, AuthLayoutGrid } from "@/components/auth/auth-aside";
import { DevSignIn } from "@/components/auth/dev-sign-in";
import { GoogleSignIn } from "@/components/auth/google-sign-in";
import {
  adminEmails,
  googleClientId,
  isEmailSignInAllowed,
  isRegistrationOpen,
} from "@/lib/auth/config";
import { getSession } from "@/lib/auth/current";
import { getDictionary, hasLocale, localePath } from "@/lib/i18n";
import { textClass } from "@/lib/i18n/content";
import { cn } from "@/lib/utils";

export async function generateMetadata(
  props: PageProps<"/[lang]/signin">,
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!hasLocale(lang)) return {};
  return {
    title: getDictionary(lang).auth.metaSignIn,
    // The one indexable page on the site. It was noindexed back when the
    // catalogue was open and this was a side door for librarians; now it is
    // the only address a crawler can reach without an account, so noindexing
    // it would make the whole library unfindable by name. Nothing is followed
    // from here — every onward link is gated.
    robots: { index: true, follow: false },
  };
}

/** Sign-in state is per-request; nothing here may be prerendered. */
export const dynamic = "force-dynamic";

export default async function SignInPage(props: PageProps<"/[lang]/signin">) {
  const { lang } = await props.params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);

  const sp = await props.searchParams;
  // Passed through to the action, which lands on it afterwards. Only ever a
  // path on this site — see `destination` there.
  const next = typeof sp.next === "string" ? sp.next : "";

  const session = await getSession();
  // A half-finished registration is owed a code, not a form it is already past.
  if (session?.gate === "registered") redirect(localePath(lang, "/unlock"));
  if (session) {
    redirect(next.startsWith("/") ? next : localePath(lang, "/books"));
  }

  const bn = textClass(lang);

  return (
    <AuthLayoutGrid>
      <AuthAside lang={lang} lead={dict.auth.sideLead} />

      <AuthCard
        lang={lang}
        title={dict.auth.title}
        lead={googleClientId ? dict.auth.lead : dict.auth.leadEmail}
        footer={
          // The other door. Someone holding a hard copy has no account yet and
          // no way to guess that the codes printed in their book are what this
          // site wants from them, so it is said here rather than left to be
          // discovered.
          isRegistrationOpen() && (
            <Link
              href={localePath(lang, "/signup")}
              className={cn(
                "mt-5 flex items-center justify-center gap-1.5 text-sm font-medium text-ink-mute transition-colors hover:text-ink",
                bn,
              )}
            >
              {dict.auth.needAccount}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          )
        }
      >
        {googleClientId ? (
          <GoogleSignIn clientId={googleClientId} lang={lang} next={next} />
        ) : isEmailSignInAllowed() ? (
          <DevSignIn
            lang={lang}
            next={next}
            hasAdminEmails={adminEmails.length > 0}
          />
        ) : (
          <p
            role="alert"
            className={cn(
              "rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger",
              bn,
            )}
          >
            {dict.auth.notConfigured}
          </p>
        )}
      </AuthCard>
    </AuthLayoutGrid>
  );
}
