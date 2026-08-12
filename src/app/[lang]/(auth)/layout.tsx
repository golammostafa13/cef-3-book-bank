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
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-6 lg:px-8">
        <Link
          href={localePath(lang)}
          aria-label={`${site.name} — ${dict.common.home}`}
        >
          <Brand />
        </Link>

        <div className="flex items-center gap-3">
          <LanguageSwitch lang={lang} label={dict.common.switchLanguage} />
          {/* "Browse", not "back": this is the first page of the site, so a
              visitor here has nothing to go back to. */}
          <Link
            href={localePath(lang)}
            className={cn(
              "inline-flex items-center gap-2 text-sm text-ink-mute transition-colors hover:text-ink",
              textClass(lang),
            )}
          >
            <BookOpen className="size-4" aria-hidden="true" />
            {dict.auth.freeBrowse}
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center">{props.children}</main>
    </div>
  );
}
