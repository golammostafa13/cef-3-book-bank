"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn, Menu, Search, X } from "lucide-react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import {
  AccountMenu,
  AccountPanel,
  SignInLink,
} from "@/components/auth/account-menu";
import { LanguageSwitch } from "@/components/language-switch";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSession } from "@/lib/auth/use-session";
import { localePath, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n";
import { textClass } from "@/lib/i18n/content";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Site header.
 *
 * A Client Component (the mobile menu holds state), so it cannot read the
 * locale from the server — the layout passes `lang` and the strings it needs.
 *
 * The session is not read on the server either, for the same reason it never
 * was: doing so would make every static page render per request, for one name
 * in one corner of one bar. It is fetched from `/api/session` after paint
 * instead, and until it answers the bar shows neither the account nor the
 * sign-in link — a control that changes under the reader's finger is worse
 * than one that arrives a moment late.
 */
export function SiteHeader({
  lang,
}: {
  lang: Locale;
}) {
  const dict = getDictionary(lang);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const href = (path: string) => localePath(lang, path);
  const { session, loading } = useSession();

  const accountStrings = {
    account: dict.common.account,
    signedInAs: dict.common.signedInAs,
    signOut: dict.common.signOut,
  };

  return (
    <header className="sticky top-0 z-50 border-b border-line/60 bg-bg/80 backdrop-blur-xl">
      {/* Tighter gutter and gap below `sm`. The bar has to hold the wordmark
          and up to four controls in 360px, and the 20px gutter plus a 16px gap
          was 36px of the 40 it was short by. */}
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-5 lg:px-8">
        <Link
          href={href("/")}
          className="shrink-0"
          aria-label={`${site.name} — ${dict.common.home}`}
        >
          <Brand />
        </Link>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label={dict.common.mainNav}
        >
          {site.nav.map((item) => {
            const target = href(item.href);
            const active =
              pathname === target || pathname.startsWith(`${target}/`);
            return (
              <Link
                key={item.href}
                href={target}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-4 py-2 text-[0.95rem] transition-colors",
                  active
                    ? "font-semibold text-ink"
                    : "text-ink-mute hover:text-ink",
                )}
              >
                {dict.nav[item.key]}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          {/* Out of the bar below `sm`, into the menu panel below. The switch
              is 86px of a 360px header, and losing it is what buys the menu
              button — which was rendering off-screen entirely — its place. It
              is one tap away there, at a size worth tapping. */}
          <LanguageSwitch
            lang={lang}
            label={dict.common.switchLanguage}
            className="mr-1 hidden sm:inline-flex"
          />
          <Link
            href={href("/search")}
            aria-label={dict.common.searchTheCatalogue}
            className="inline-flex size-10 items-center justify-center rounded-full text-ink-mute transition-colors hover:bg-accent-soft hover:text-accent"
          >
            <Search className="size-[18px]" />
          </Link>
          {/* The empty slot is the same 40px the sign-in link and the collapsed
              account button occupy, so the controls beside it are in their
              final position from first paint and nothing moves under a finger
              already on its way to the theme toggle. */}
          {loading ? (
            <span className="hidden size-10 sm:block" aria-hidden="true" />
          ) : session ? (
            <AccountMenu
              lang={lang}
              session={session}
              strings={accountStrings}
              className="hidden sm:block"
            />
          ) : (
            <SignInLink
              href={href("/signin")}
              label={dict.common.signIn}
              className="hidden size-10 items-center justify-center rounded-full text-ink-mute transition-colors hover:bg-accent-soft hover:text-accent sm:inline-flex"
            />
          )}
          <ThemeToggle />
          <Button
            asChild
            variant="primary"
            size="sm"
            className="hidden lg:inline-flex"
          >
            <Link href={href("/books")}>{dict.common.browseLibrary}</Link>
          </Button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? dict.common.closeMenu : dict.common.openMenu}
            aria-expanded={open}
            className="inline-flex size-10 items-center justify-center rounded-full text-ink lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          className="border-t border-line/60 bg-bg px-5 pb-5 pt-2 lg:hidden"
          aria-label={dict.common.mobileNav}
        >
          {site.nav.map((item) => (
            <Link
              key={item.href}
              href={href(item.href)}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-3 text-lg text-ink hover:bg-surface"
            >
              {dict.nav[item.key]}
            </Link>
          ))}
          {session ? (
            <AccountPanel
              lang={lang}
              session={session}
              strings={accountStrings}
              onSignOut={() => setOpen(false)}
            />
          ) : (
            !loading && (
              <Link
                href={href("/signin")}
                onClick={() => setOpen(false)}
                className="mt-1 flex items-center gap-2 rounded-xl px-3 py-3 text-lg text-ink-mute hover:bg-surface"
              >
                <LogIn className="size-4" aria-hidden="true" />
                {dict.common.signIn}
              </Link>
            )
          )}

          {/* The language switch, for the phone widths where it is not in the
              bar. Hidden from `sm` up so it is never in both places at once. */}
          <div className="mt-3 flex items-center gap-3 border-t border-line/60 px-3 pt-4 sm:hidden">
            <span className={cn("text-sm text-ink-faint", textClass(lang))}>
              {dict.common.switchLanguage}
            </span>
            <LanguageSwitch lang={lang} label={dict.common.switchLanguage} />
          </div>
        </nav>
      )}
    </header>
  );
}

