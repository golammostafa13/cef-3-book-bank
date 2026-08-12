import type { Metadata } from "next";
import { ViewTransition } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BookOpen,
  Building2,
  Calendar,
  Download,
  FileText,
  Hash,
  Languages,
  Layers,
  MapPin,
  Star,
} from "lucide-react";
import { Book3D } from "@/components/book-3d";
import { BookCard } from "@/components/book-card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import {
  getAllBooks,
  getAuthorById,
  getBook,
  getRelated,
} from "@/lib/data/books";
import { getDictionary, hasLocale, localePath, locales } from "@/lib/i18n";
import {
  bookAuthorName,
  bookDescription,
  bookSubtitle,
  bookTitle,
  formatCompactIn,
  formatDateIn,
  formatNumberIn,
  formatYearIn,
  textClass,
} from "@/lib/i18n/content";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { fill } from "@/lib/i18n/format";

/**
 * Prerender every book in both languages. Two locales × forty books is eighty
 * static documents — still nothing next to what a rebuild would cost, and it
 * means a Bengali book page is as cacheable as an English one.
 */
export async function generateStaticParams() {
  const books = await getAllBooks();
  return locales.flatMap((lang) => books.map((b) => ({ lang, slug: b.slug })));
}

export async function generateMetadata(
  props: PageProps<"/[lang]/books/[slug]">,
): Promise<Metadata> {
  const { lang, slug } = await props.params;
  if (!hasLocale(lang)) return {};

  const dict = getDictionary(lang);
  const book = await getBook(slug);
  if (!book) return { title: dict.book.notFound };

  const primary = bookTitle(book, lang);
  const secondary = bookSubtitle(book, lang);
  const title = secondary ? `${primary} (${secondary})` : primary;
  const description = `${bookDescription(book, lang)} ${
    lang === "bn"
      ? `${bookAuthorName(book, lang)}-এর ${primary} অনলাইনে বিনামূল্যে পড়ুন বা ${book.format.toUpperCase()} ডাউনলোড করুন।`
      : `Read ${primary} by ${bookAuthorName(book, lang)} online free, or download the ${book.format.toUpperCase()}.`
  }`;

  return {
    title,
    description,
    alternates: {
      canonical: localePath(lang, `/books/${book.slug}`),
      languages: {
        en: localePath("en", `/books/${book.slug}`),
        bn: localePath("bn", `/books/${book.slug}`),
      },
    },
    openGraph: {
      type: "article",
      title,
      description,
      locale: lang === "bn" ? "bn_BD" : "en_US",
      url: `${site.url}${localePath(lang, `/books/${book.slug}`)}`,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function BookDetailPage(
  props: PageProps<"/[lang]/books/[slug]">,
) {
  const { lang, slug } = await props.params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);

  const book = await getBook(slug);
  if (!book) notFound();

  const [related, author] = await Promise.all([
    getRelated(book, 4),
    getAuthorById(book.authorId),
  ]);

  const title = bookTitle(book, lang);
  const subtitle = bookSubtitle(book, lang);
  const href = (path: string) => localePath(lang, path);

  const bookJsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    alternateName: book.titleBn,
    author: { "@type": "Person", name: book.authorName },
    publisher: { "@type": "Organization", name: book.publisher },
    datePublished: String(book.year),
    isbn: book.isbn,
    numberOfPages: book.pages,
    inLanguage: book.language === "bn" ? "bn" : "en",
    bookFormat: "https://schema.org/EBook",
    description: book.description,
    url: `${site.url}${href(`/books/${book.slug}`)}`,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: book.rating,
      bestRating: 5,
      ratingCount: Math.max(12, Math.round(book.downloads / 40)),
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: dict.common.home,
        item: `${site.url}${href("/")}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: dict.common.books,
        item: `${site.url}${href("/books")}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: `${site.url}${href(`/books/${book.slug}`)}`,
      },
    ],
  };

  const facts = [
    { Icon: Building2, label: dict.book.publisher, value: book.publisher },
    {
      Icon: Calendar,
      label: dict.book.published,
      value: formatYearIn(book.year, lang),
    },
    {
      Icon: FileText,
      label: dict.book.pages,
      value: formatNumberIn(book.pages, lang),
    },
    {
      Icon: Languages,
      label: dict.book.language,
      value: book.language === "bn" ? dict.book.bengali : dict.book.english,
    },
    { Icon: Hash, label: dict.book.isbn, value: book.isbn },
    {
      Icon: Layers,
      label: dict.book.format,
      value: `${book.format.toUpperCase()} · ${formatNumberIn(book.fileSizeMb, lang)} MB`,
    },
    { Icon: MapPin, label: dict.book.shelf, value: book.shelf },
    { Icon: BookOpen, label: dict.book.accession, value: book.code },
  ];

  return (
    <>
      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-16">
        <nav
          aria-label={dict.common.breadcrumb}
          className={cn("text-sm text-ink-faint", textClass(lang))}
        >
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href={href("/")} className="hover:text-ink">
                {dict.common.home}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={href("/books")} className="hover:text-ink">
                {dict.common.books}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-ink-mute">{title}</li>
          </ol>
        </nav>

        <div className="mt-10 grid gap-14 lg:grid-cols-[minmax(0,320px)_1fr] lg:gap-20">
          {/* Cover */}
          <div className="mx-auto w-full max-w-[280px] lg:mx-0 lg:sticky lg:top-28 lg:self-start">
            {/* Paired with the grid tile's cover: the same object grows into
                place instead of the page cutting. */}
            <ViewTransition name={`cover-${book.id}`} share="morph" default="none">
              <Book3D
                book={book}
                lang={lang}
                size="lg"
                angle={-19}
                hoverAngle={-4}
                depthScale={1.1}
              />
            </ViewTransition>
            {/* The surface the volume is standing on. One hairline is enough to
                stop it floating, and it fades out before it reads as a divider. */}
            <div
              aria-hidden="true"
              className="mt-7 h-px bg-linear-to-r from-transparent via-line to-transparent"
            />

            <div className="mt-8 flex flex-col gap-3">
              <Button asChild size="lg" variant="primary">
                <Link href={href(`/read/${book.slug}`)}>
                  <BookOpen className="size-4" aria-hidden="true" />
                  {dict.common.readOnline}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href={book.fileUrl} download>
                  <Download className="size-4" aria-hidden="true" />
                  {fill(lang, dict.common.downloadFormat, { format: book.format.toUpperCase() })}
                </a>
              </Button>
              <p
                className={cn(
                  "mt-1 text-center text-xs text-ink-faint",
                  textClass(lang),
                )}
              >
                {fill(lang, dict.book.noAccountNeeded, { mb: book.fileSizeMb })}
              </p>
            </div>
          </div>

          {/* Detail */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={href(`/categories/${book.categoryName.toLowerCase()}`)}
                className={cn(
                  "rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent",
                  textClass(lang),
                )}
              >
                {book.categoryName}
              </Link>
              <StatusPill status={book.status} dict={dict} lang={lang} />
              {book.featured && (
                <span
                  className={cn(
                    "rounded-full bg-ink px-3 py-1 text-sm text-bg",
                    textClass(lang),
                  )}
                >
                  {dict.book.featured}
                </span>
              )}
            </div>

            <h1
              className={cn(
                "mt-6 text-[clamp(2.1rem,5vw,3.6rem)] font-bold tracking-tight text-ink",
                lang === "bn" ? "bn leading-[1.25]" : "leading-[1.1]",
              )}
            >
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-xl text-ink-mute">{subtitle}</p>
            )}

            <p className={cn("mt-4 text-lg text-ink-mute", textClass(lang))}>
              {dict.book.by}{" "}
              <Link
                href={href(author ? `/authors/${author.slug}` : "/authors")}
                className="font-medium text-ink underline decoration-accent decoration-2 underline-offset-4 hover:text-accent"
              >
                {bookAuthorName(book, lang)}
              </Link>
            </p>

            <div
              className={cn(
                "mt-6 flex flex-wrap items-center gap-6 text-sm text-ink-mute",
                textClass(lang),
              )}
            >
              <span className="inline-flex items-center gap-1.5">
                <Star
                  className="size-4 fill-accent text-accent"
                  aria-hidden="true"
                />
                <span className="font-semibold text-ink">
                  {formatNumberIn(book.rating, lang)}
                </span>
                {dict.book.ratingOutOf}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Download className="size-4" aria-hidden="true" />
                {fill(lang, dict.book.downloads, {
                  n: formatCompactIn(book.downloads, lang),
                })}
              </span>
              <span>{fill(lang, dict.book.added, { date: formatDateIn(book.addedAt, lang) })}</span>
            </div>

            <div className="reveal-3d mt-10 space-y-4">
              <h2
                className={cn("text-xl font-semibold text-ink", textClass(lang))}
              >
                {dict.book.aboutThisBook}
              </h2>
              <p
                className={cn(
                  "max-w-2xl text-[1.05rem] leading-relaxed text-ink-mute",
                  textClass(lang),
                )}
              >
                {bookDescription(book, lang)}
              </p>
            </div>

            <div className="reveal-3d mt-12">
              <h2
                className={cn("text-xl font-semibold text-ink", textClass(lang))}
              >
                {dict.book.details}
              </h2>
              <dl className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                {facts.map(({ Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <Icon
                      className="mt-0.5 size-4 shrink-0 text-ink-faint"
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <dt
                        className={cn(
                          "text-sm text-ink-faint",
                          textClass(lang),
                        )}
                      >
                        {label}
                      </dt>
                      <dd className="truncate font-medium text-ink">{value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </div>

            <div className="reveal-3d mt-10 rounded-2xl border border-line bg-surface p-6">
              <h2 className={cn("font-semibold text-ink", textClass(lang))}>
                {dict.book.physicalCopies}
              </h2>
              <p
                className={cn(
                  "mt-2 text-[0.95rem] text-ink-mute",
                  textClass(lang),
                )}
              >
                {fill(lang, dict.book.copiesLine, {
                  available: book.copiesAvailable,
                  total: book.copiesTotal,
                  shelf: book.shelf,
                })}
              </p>
              <div
                className="mt-4 h-2 overflow-hidden rounded-full bg-line"
                role="img"
                aria-label={fill(lang, dict.book.copiesLabel, {
                  available: book.copiesAvailable,
                  total: book.copiesTotal,
                })}
              >
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{
                    width: `${(book.copiesAvailable / book.copiesTotal) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="border-t border-line/60 bg-bg-deep">
          <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
            <h2
              className={cn(
                "reveal-3d text-[clamp(1.6rem,3.4vw,2.4rem)] font-bold tracking-tight text-ink",
                textClass(lang),
              )}
            >
              {dict.book.alsoOpened}
            </h2>
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {related.map((b, i) => (
                <BookCard
                  key={b.id}
                  book={b}
                  lang={lang}
                  dict={dict}
                  index={i}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bookJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  );
}
