import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRight, BookOpen, Languages, Sparkles } from "lucide-react";
import { DevSignIn } from "@/components/auth/dev-sign-in";
import { GoogleSignIn } from "@/components/auth/google-sign-in";
import { ReadingScene } from "@/components/auth/reading-scene";
import {
  adminEmails,
  googleClientId,
  isEmailSignInAllowed,
} from "@/lib/auth/config";
import { getSession } from "@/lib/auth/current";
import { getFeatured } from "@/lib/data/books";
import { getDictionary, hasLocale, localePath } from "@/lib/i18n";
import { textClass } from "@/lib/i18n/content";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export async function generateMetadata(
  props: PageProps<"/[lang]/signin">,
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!hasLocale(lang)) return {};
  return {
    title: getDictionary(lang).auth.metaSignIn,
    robots: { index: false, follow: false },
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
  if (session) {
    redirect(next.startsWith("/") ? next : localePath(lang, "/books"));
  }

  const pile = await getFeatured(5);
  const bn = textClass(lang);

  return (
    <div className="mx-auto grid w-full max-w-6xl items-center gap-16 px-5 pb-20 lg:grid-cols-[1fr_24rem] lg:gap-20 lg:px-8">
      {/* Left: the library itself, drawn. The illustration is built from the
          same featured volumes the catalogue is showing today — their titles
          are on the spines — so the door is made of the building rather than
          of stock art. Desktop only: on a phone the form is the page, and
          nothing should stand between the reader and it. */}
      <div className="hidden lg:block">
        <p
          className={cn(
            "inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-ink-mute",
            bn,
          )}
        >
          <span
            aria-hidden="true"
            className="brand-mark inline-block size-2 rounded-full"
          />
          {dict.auth.sideEyebrow}
        </p>

        <p
          className={cn(
            "mt-3 text-[clamp(1.6rem,2.6vw,2.2rem)] font-bold tracking-[-0.02em] text-ink",
            lang === "bn" ? "bn leading-[1.35]" : "leading-[1.15]",
          )}
        >
          {lang === "bn" ? site.taglineBn : site.tagline}
        </p>

        <p className={cn("mt-3 max-w-md text-[0.95rem] text-ink-mute", bn)}>
          {dict.auth.sideLead}
        </p>

        <ReadingScene
          books={pile}
          lang={lang}
          label={dict.auth.sideAlt}
          className="mt-1 -ml-3 max-w-[30rem]"
        />

        {/* Three facts about the library, one line, under the drawing. They
            answer the question the sign-in card provokes — "do I need this?" —
            without another paragraph of prose. */}
        <ul
          className={cn(
            "-mt-3 flex max-w-md flex-wrap items-center gap-x-5 gap-y-2 text-[0.82rem] font-medium text-ink-mute",
            bn,
          )}
        >
          {[
            { key: "free", Icon: Sparkles, label: dict.auth.badgeFree },
            { key: "bi", Icon: Languages, label: dict.auth.badgeBilingual },
            { key: "browser", Icon: BookOpen, label: dict.auth.badgeBrowser },
          ].map(({ key, Icon, label }) => (
            <li key={key} className="inline-flex items-center gap-1.5">
              <Icon className="size-4 text-accent" aria-hidden="true" />
              {label}
            </li>
          ))}
        </ul>
      </div>

      {/* Right: the one thing to do. */}
      <div className="mx-auto w-full max-w-sm lg:mx-0">
        <div className="rounded-3xl border border-line bg-surface p-8 shadow-e3">
          <h1
            className={cn(
              "text-[1.65rem] font-bold tracking-tight text-ink",
              bn,
            )}
          >
            {dict.auth.title}
          </h1>
          <p className={cn("mt-2 text-[0.95rem] text-ink-mute", bn)}>
            {googleClientId ? dict.auth.lead : dict.auth.leadEmail}
          </p>

          <div className="mt-7">
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
          </div>
        </div>

        {/* Nobody has to sign in to use this library, so the way past the door
            sits directly under it rather than being left to be discovered. */}
        <Link
          href={localePath(lang)}
          className={cn(
            "mt-5 flex items-center justify-center gap-1.5 text-sm font-medium text-ink-mute transition-colors hover:text-ink",
            bn,
          )}
        >
          {dict.auth.freeBrowse}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
