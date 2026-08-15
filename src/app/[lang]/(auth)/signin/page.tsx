import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { AuthAside, AuthCard, AuthLayoutGrid } from "@/components/auth/auth-aside";
import { GoogleSignIn } from "@/components/auth/google-sign-in";
import { SignInPasswordForm } from "@/components/auth/sign-in-password-form";
import { googleClientId } from "@/lib/auth/config";
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
  const next = typeof sp.next === "string" ? sp.next : "";

  const session = await getSession();
  if (session) {
    redirect(next.startsWith("/") ? next : localePath(lang, "/books"));
  }

  const bn = textClass(lang);

  const showGoogle = Boolean(googleClientId);
  const showPassword = true;

  return (
    <AuthLayoutGrid>
      <AuthAside lang={lang} lead={dict.auth.sideLead} />

      <AuthCard
        lang={lang}
        title={dict.auth.title}
        lead={
          showGoogle
            ? dict.auth.lead
            : showPassword
              ? dict.auth.leadPassword
              : dict.auth.leadEmail
        }
        footer={
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
        }
      >
        {showGoogle && (
          <div className={showPassword ? "mb-6" : ""}>
            <GoogleSignIn clientId={googleClientId} lang={lang} next={next} />
          </div>
        )}

        {showPassword && (
          <>
            {showGoogle && (
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-line" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-surface px-2 text-ink-mute">
                    {dict.auth.orContinueWith}
                  </span>
                </div>
              </div>
            )}
            <SignInPasswordForm lang={lang} next={next} />
          </>
        )}

        {!showGoogle && !showPassword && (
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
