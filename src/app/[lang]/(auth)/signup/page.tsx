import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AuthAside, AuthCard, AuthLayoutGrid } from "@/components/auth/auth-aside";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { isRegistrationOpen } from "@/lib/auth/config";
import { getSession } from "@/lib/auth/current";
import { getDictionary, hasLocale, localePath } from "@/lib/i18n";
import { textClass } from "@/lib/i18n/content";
import { cn } from "@/lib/utils";

export async function generateMetadata(
  props: PageProps<"/[lang]/signup">,
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!hasLocale(lang)) return {};
  return {
    title: getDictionary(lang).auth.metaSignUp,
    robots: { index: false, follow: false },
  };
}

/** Session state is per-request; nothing here may be prerendered. */
export const dynamic = "force-dynamic";

/**
 * Where the first QR code in a hard copy lands.
 *
 * Step one of two. It takes a name, an address and the code printed beside the
 * QR, and hands back a session that can see step two and nothing else.
 */
export default async function SignUpPage(props: PageProps<"/[lang]/signup">) {
  const { lang } = await props.params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);

  const sp = await props.searchParams;
  const next = typeof sp.next === "string" ? sp.next : "";

  // Someone who is already through has nothing to do here. A half-finished
  // registration is sent on to the code it still owes rather than back to the
  // start, which would ask for the first code a second time.
  const session = await getSession();
  if (session?.gate === "registered") redirect(localePath(lang, "/unlock"));
  if (session) redirect(next.startsWith("/") ? next : localePath(lang));

  const bn = textClass(lang);

  return (
    <AuthLayoutGrid>
      <AuthAside lang={lang} lead={dict.auth.sideLeadSignUp} />

      <AuthCard
        lang={lang}
        step={dict.auth.stepOne}
        title={dict.auth.signUpTitle}
        lead={dict.auth.signUpLead}
        footer={
          <Link
            href={localePath(lang, "/signin")}
            className={cn(
              "mt-5 flex items-center justify-center gap-1.5 text-sm font-medium text-ink-mute transition-colors hover:text-ink",
              bn,
            )}
          >
            {dict.auth.haveAccount}
          </Link>
        }
      >
        {isRegistrationOpen() ? (
          <SignUpForm lang={lang} next={next} />
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
