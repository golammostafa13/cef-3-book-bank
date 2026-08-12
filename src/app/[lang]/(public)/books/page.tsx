import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, Download, LayoutDashboard } from "lucide-react";
import { BookCard } from "@/components/book-card";
import { CatalogueFilters } from "@/components/catalogue-filters";
import { Pagination } from "@/components/pagination";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { adminUsername, isAdminEmail } from "@/lib/auth/config";
import { getSession } from "@/lib/auth/current";
import { getBooks, getCategories } from "@/lib/data/books";
import { getDictionary, hasLocale, localePath } from "@/lib/i18n";
import { bookTitle, textClass } from "@/lib/i18n/content";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { BookLanguage, CatalogueQuery } from "@/types";

export async function generateMetadata(
  props: PageProps<"/[lang]/books">,
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!hasLocale(lang)) return {};
  const dict = getDictionary(lang);

  return {
    title: dict.catalogue.metaTitle,
    description: dict.catalogue.metaDescription,
    alternates: {
      canonical: localePath(lang, "/books"),
      languages: {
        en: localePath("en", "/books"),
        bn: localePath("bn", "/books"),
      },
    },
  };
}

export default async function BooksPage(props: PageProps<"/[lang]/books">) {
  const { lang } = await props.params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);

  const sp = await props.searchParams;
  const first = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;

  const query: CatalogueQuery = {
    q: first(sp.q),
    category: first(sp.category),
    language: first(sp.language) as BookLanguage | undefined,
    sort: first(sp.sort) as CatalogueQuery["sort"],
    page: Number(first(sp.page) ?? 1) || 1,
    perPage: 12,
  };

  // This page is dynamic already (it reads searchParams), so reading the
  // session here costs nothing — which is why the signed-in state lives on the
  // catalogue rather than in the header, where it would make every static page
  // render per request.
  const [result, categories, session] = await Promise.all([
    getBooks(query),
    getCategories(),
    getSession(),
  ]);
  // Signing in is open to anyone; only one address gets the catalogue tools.
  const isAdmin = isAdminEmail(session?.email);

  // ItemList tells search engines this is a browsable collection rather
  // than a single document.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${site.name} — ${dict.catalogue.title}`,
    inLanguage: lang,
    numberOfItems: result.total,
    itemListElement: result.items.map((b, i) => ({
      "@type": "ListItem",
      position: (result.page - 1) * result.perPage + i + 1,
      url: `${site.url}${localePath(lang, `/books/${b.slug}`)}`,
      name: bookTitle(b, lang),
    })),
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
      {session && (
        <div className="mb-10 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-line bg-surface px-5 py-3.5 shadow-e1">
          <p className={cn("text-sm text-ink-mute", textClass(lang))}>
            {dict.catalogue.signedInAs}{" "}
            {/* The administrator is shown by account handle, everyone else by
                the name they signed in with. */}
            <span
              className={cn(
                "font-medium text-ink",
                isAdmin ? "font-mono" : textClass(lang),
              )}
            >
              {isAdmin ? adminUsername : session.name}
            </span>
          </p>
          {isAdmin && (
            <Link
              href={localePath(lang, "/admin")}
              className={cn(
                "inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline",
                textClass(lang),
              )}
            >
              <LayoutDashboard className="size-4" aria-hidden="true" />
              {dict.catalogue.adminTools}
            </Link>
          )}
          <SignOutButton
            label={dict.common.signOut}
            className="ml-auto"
            icon
          />
        </div>
      )}

      <header className="reveal-3d max-w-2xl">
        <p
          className={cn(
            "text-sm font-semibold uppercase tracking-[0.2em] text-accent",
            textClass(lang),
          )}
        >
          {dict.catalogue.eyebrow}
        </p>
        <h1
          className={cn(
            "mt-2 text-[clamp(2.1rem,5vw,3.4rem)] font-bold tracking-tight text-ink",
            lang === "bn" && "bn leading-[1.3]",
          )}
        >
          {dict.catalogue.title}
        </h1>
        <p className={cn("mt-4 text-lg text-ink-mute", textClass(lang))}>
          {dict.catalogue.lead}
        </p>
        <p
          className={cn(
            "mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-ink-faint",
            textClass(lang),
          )}
        >
          <span className="inline-flex items-center gap-1.5">
            <BookOpen className="size-3.5" aria-hidden="true" />
            {dict.catalogue.readInBrowser}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Download className="size-3.5" aria-hidden="true" />
            {dict.catalogue.orKeepTheFile}
          </span>
        </p>
      </header>

      <div className="mt-12">
        {/* useSearchParams needs a Suspense boundary during prerender. */}
        <Suspense fallback={<div className="h-32" />}>
          <CatalogueFilters
            categories={categories}
            total={result.total}
            lang={lang}
          />
        </Suspense>
      </div>

      {result.items.length === 0 ? (
        <p
          className={cn(
            "py-24 text-center text-lg text-ink-mute",
            textClass(lang),
          )}
        >
          {dict.catalogue.empty}
        </p>
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
          {result.items.map((book, i) => (
            <BookCard
              key={book.id}
              book={book}
              lang={lang}
              dict={dict}
              index={i}
            />
          ))}
        </div>
      )}

      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        basePath={localePath(lang, "/books")}
        dict={dict}
        searchParams={{
          q: query.q,
          category: query.category,
          language: query.language,
          sort: query.sort,
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
