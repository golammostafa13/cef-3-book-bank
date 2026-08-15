import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AuthAside, AuthCard, AuthLayoutGrid } from "@/components/auth/auth-aside";
import { SignUpForm } from "@/components/auth/sign-up-form";
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

export default async function SignUpPage(props: PageProps<"/[lang]/signup">) {
  const { lang } = await props.params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);

  const sp = await props.searchParams;
  const next = typeof sp.next === "string" ? sp.next : "";

  const { getSession } = await import("@/lib/auth/current");
  const session = await getSession();
  if (session) redirect(next.startsWith("/") ? next : localePath(lang));

  const bn = textClass(lang);

  return (
    <AuthLayoutGrid>
      <AuthAside lang={lang} lead={dict.auth.sideLeadSignUp} />

      <AuthCard
        lang={lang}
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
        <SignUpForm lang={lang} next={next} />
      </AuthCard>
    </AuthLayoutGrid>
  );
}
