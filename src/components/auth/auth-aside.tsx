import { BookOpen, KeyRound, Languages } from "lucide-react";
import { ReadingScene } from "@/components/auth/reading-scene";
import { getFeatured } from "@/lib/data/books";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { textClass } from "@/lib/i18n/content";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * The panel beside the card, shared by all three doors.
 *
 * The illustration is built from the same featured volumes the catalogue is
 * showing today — their titles are on the spines — so the door is made of the
 * building rather than of stock art.
 *
 * Desktop only: on a phone the form is the page, and nothing should stand
 * between the reader and it.
 */
export async function AuthAside({
  lang,
  lead,
}: {
  lang: Locale;
  /** Each door says something different about why it is asking. */
  lead: string;
}) {
  const dict = getDictionary(lang);
  const pile = await getFeatured(5);
  const bn = textClass(lang);

  return (
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
        {lead}
      </p>

      <ReadingScene
        books={pile}
        lang={lang}
        label={dict.auth.sideAlt}
        className="mt-1 -ml-3 max-w-[30rem]"
      />

      {/* Three facts about the library, one line, under the drawing. They
          answer the question the card provokes — "do I need this?" — without
          another paragraph of prose. */}
      <ul
        className={cn(
          "-mt-3 flex max-w-md flex-wrap items-center gap-x-5 gap-y-2 text-[0.82rem] font-medium text-ink-mute",
          bn,
        )}
      >
        {[
          { key: "book", Icon: KeyRound, label: dict.auth.badgeWithBook },
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
  );
}

/**
 * The card itself: heading, lead, and whatever form the door needs. Shared so
 * that sign-in, sign-up and unlock are visibly the same object seen three
 * times rather than three pages that happen to look similar.
 */
export function AuthCard({
  lang,
  title,
  lead,
  step,
  children,
  footer,
}: {
  lang: Locale;
  title: string;
  lead: string;
  /** "Step 1 of 2" — only the registration doors are part of a sequence. */
  step?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const bn = textClass(lang);

  return (
    <div className="mx-auto w-full max-w-sm lg:mx-0">
      <div className="rounded-3xl border border-line bg-surface p-8 shadow-e3">
        {step && (
          <p
            className={cn(
              "mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-accent",
              bn,
            )}
          >
            {step}
          </p>
        )}

        <h1
          className={cn("text-[1.65rem] font-bold tracking-tight text-ink", bn)}
        >
          {title}
        </h1>

        <div className="mt-7">{children}</div>
      </div>

      {footer}
    </div>
  );
}

/** The shell both columns sit in. */
export function AuthLayoutGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid w-full max-w-6xl items-center gap-16 px-5 pb-20 lg:grid-cols-[1fr_24rem] lg:gap-20 lg:px-8">
      {children}
    </div>
  );
}
