import type { MetadataRoute } from "next";
import { getAllBooks, getAuthors, getCategories } from "@/lib/data/books";
import { localePath, locales, type Locale } from "@/lib/i18n";
import { site } from "@/lib/site";

/**
 * Sitemap.
 *
 * Every public URL in every language, each entry carrying `alternates.languages`
 * so a crawler knows the Bengali and English pages are the same document rather
 * than duplicate content. Book pages carry their own `lastModified`, so a
 * re-catalogued title gets recrawled without the whole file looking stale.
 *
 * /read/* and /admin/* are left out on purpose: the reader is a viewer for
 * content already indexed at /books/[slug], and the admin is not public.
 */

const full = (lang: Locale, path = "/") => `${site.url}${localePath(lang, path)}`;

/** The hreflang block every entry shares, for one path. */
const alternatesFor = (path: string) => ({
  languages: Object.fromEntries(
    locales.map((lang) => [lang, full(lang, path)]),
  ),
});

function entriesFor(
  path: string,
  options: {
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
    lastModified?: Date;
  },
): MetadataRoute.Sitemap {
  return locales.map((lang) => ({
    url: full(lang, path),
    lastModified: options.lastModified,
    changeFrequency: options.changeFrequency,
    priority: options.priority,
    alternates: alternatesFor(path),
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [books, categories, authors] = await Promise.all([
    getAllBooks(),
    getCategories(),
    getAuthors(),
  ]);

  return [
    ...entriesFor("/", { changeFrequency: "daily", priority: 1 }),
    ...entriesFor("/books", { changeFrequency: "daily", priority: 0.9 }),
    ...entriesFor("/categories", { changeFrequency: "weekly", priority: 0.7 }),
    ...entriesFor("/authors", { changeFrequency: "weekly", priority: 0.7 }),
    ...entriesFor("/search", { changeFrequency: "monthly", priority: 0.5 }),
    ...entriesFor("/about", { changeFrequency: "yearly", priority: 0.4 }),
    ...entriesFor("/contact", { changeFrequency: "yearly", priority: 0.3 }),

    ...books.flatMap((book) =>
      entriesFor(`/books/${book.slug}`, {
        changeFrequency: "monthly",
        priority: book.featured ? 0.8 : 0.6,
        lastModified: new Date(`${book.addedAt}T00:00:00Z`),
      }),
    ),
    ...categories.flatMap((c) =>
      entriesFor(`/categories/${c.slug}`, {
        changeFrequency: "weekly",
        priority: 0.6,
      }),
    ),
    ...authors.flatMap((a) =>
      entriesFor(`/authors/${a.slug}`, {
        changeFrequency: "monthly",
        priority: 0.5,
      }),
    ),
  ];
}
