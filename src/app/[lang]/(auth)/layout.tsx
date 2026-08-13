import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen } from "lucide-react";
import { Brand } from "@/components/brand";
import { LanguageSwitch } from "@/components/language-switch";
import { getDictionary, hasLocale, localePath } from "@/lib/i18n";
import { textClass } from "@/lib/i18n/content";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Sign-in chrome: deliberately not the public header and footer. There is one
 * thing to do on these pages, and one way back out — plus the language switch,
 * because a librarian should be able to sign in in their own language.
 */
export default async function AuthLayout(props: LayoutProps<"/[lang]">) {
  const { lang } = await props.params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <div className="paper-grain relative flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-4 py-6 sm:gap-4 sm:px-5 lg:px-8">
        <Link
          href={localePath(lang)}
          className="min-w-0 shrink"
          aria-label={`${site.name} — ${dict.common.home}`}
        >
          <Brand />
        </Link>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <LanguageSwitch lang={lang} label={dict.common.switchLanguage} />
          {/* "Browse", not "back": this is the first page of the site, so a
              visitor here has nothing to go back to.

              The label is the icon's alone below `sm`: spelled out it wrapped
              to four lines in the corner of a 360px header and still pushed the
              row past the viewport. The sign-in card below repeats the same
              link in full, so nothing is lost on a phone. */}
          <Link
            href={localePath(lang)}
            aria-label={dict.auth.freeBrowse}
            className={cn(
              "inline-flex size-10 shrink-0 items-center justify-center rounded-full text-ink-mute transition-colors hover:bg-accent-soft hover:text-ink sm:size-auto sm:gap-2 sm:rounded-none sm:text-sm sm:hover:bg-transparent",
              textClass(lang),
            )}
          >
            <BookOpen className="size-4 shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">{dict.auth.freeBrowse}</span>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center">{props.children}</main>
    </div>
  );
}
