import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Atom,
  Baby,
  BookOpen,
  Download,
  Feather,
  Globe,
  Landmark,
  Library,
  Sparkles,
  Zap,
} from "lucide-react";
import { Book3D } from "@/components/book-3d";
import { BookCard } from "@/components/book-card";
import { BookCarousel3D } from "@/components/book-carousel-3d";
import { BookStack3D } from "@/components/book-stack-3d";
import { Hero3D, type HeroBook } from "@/components/hero-3d";
import { Shelf3D } from "@/components/shelf-3d";
import { Button } from "@/components/ui/button";
import {
  getCategoryShelves,
  getFeatured,
  getPopular,
  getRecent,
  getStats,
} from "@/lib/data/books";
import { getDictionary, hasLocale, localePath } from "@/lib/i18n";
import {
  categoryDescription,
  categoryName,
  formatCompactIn,
  textClass,
} from "@/lib/i18n/content";
import { site } from "@/lib/site";
import { fill, titlesCount } from "@/lib/i18n/format";
import { cn } from "@/lib/utils";

export default async function HomePage(props: PageProps<"/[lang]">) {
  const { lang } = await props.params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const href = (path: string) => localePath(lang, path);

  const [featured, popular, recent, categories, stats] = await Promise.all([
    getFeatured(6),
    getPopular(6),
    getRecent(8),
    getCategoryShelves(9),
    getStats(),
  ]);

  // The pile carries the featured titles; the standing volume next to it is
  // the most-downloaded book, so the hero always shows something worth opening.
  const pileBooks = featured.slice(0, 5);

  /**
   * What the hero scene is built from: the first volume is the one that opens,
   * the rest are the collection that arrives behind it. Deduplicated, because
   * the same title turning up twice in a fifteen-cover shelf is the one thing
   * that gives away that it is a shelf of samples.
   *
   * Only the seven fields the scene actually draws with cross to the client —
   * a `Book` carries a description and a file URL that no cover needs, and all
   * fifteen of them would be in the page's RSC payload.
   */
  const sceneBooks: HeroBook[] = [...featured, ...popular, ...recent]
    .filter(
      (book, i, all) => all.findIndex((other) => other.id === book.id) === i,
    )
    .slice(0, 16)
    .map((book) => ({
      id: book.id,
      title: book.title,
      titleBn: book.titleBn,
      authorName: book.authorName,
      authorNameBn: book.authorNameBn,
      coverHue: book.coverHue,
      pages: book.pages,
    }));

  const propIcons = [BookOpen, Download, Globe];

  return (
    <>
      {/* ---------------------------------------------------------------
          Hero

          A scroll-scrubbed WebGL scene: a bound volume opens, and the
          collection arrives out of it and settles into a shelf. The copy
          over it is ordinary server-rendered DOM — see hero-3d.tsx — so
          the page's headline is still text, and the static pile below is
          what a reader gets before three.js lands or if they have asked
          for less motion.
      ---------------------------------------------------------------- */}
      <Hero3D
        books={sceneBooks}
        lang={lang}
        brand={lang === "bn" ? site.nameBn : site.name}
        hrefs={{ books: href("/books"), categories: href("/categories") }}
        copy={{
          titleStart: dict.home.titleStart,
          titleMiddle: dict.home.titleMiddle,
          titleOpens: dict.home.titleOpens,
          titleEnd: dict.home.titleEnd,
          lead: dict.home.lead,
          getStarted: dict.home.getStarted,
          browseCategories: dict.home.browseCategories,
          statBooks: dict.home.statBooks,
          statAuthors: dict.home.statAuthors,
          statDownloads: dict.home.statDownloads,
          ...dict.home.scene,
        }}
        stats={{
          books: formatCompactIn(stats.totalBooks, lang),
          authors: formatCompactIn(stats.totalAuthors, lang),
          downloads: formatCompactIn(stats.totalDownloads, lang),
        }}
        fallback={
          <BookStack3D
            books={pileBooks}
            lang={lang}
            className="absolute inset-0"
          />
        }
      />

      {/* ---------------------------------------------------------------
          Value props
      ---------------------------------------------------------------- */}
      <section className="border-y border-line/60 bg-surface/50">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-3 lg:px-8">
          {dict.home.props.map((prop, i) => {
            const Icon = propIcons[i];
            return (
              <div
                key={prop.title}
                className="reveal-3d flex gap-4"
                style={{ "--lag": i * 5 } as React.CSSProperties}
              >
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className={cn("font-semibold text-ink", textClass(lang))}>
                    {prop.title}
                  </h2>
                  <p
                    className={cn(
                      "mt-1.5 text-[0.95rem] leading-relaxed text-ink-mute",
                      textClass(lang),
                    )}
                  >
                    {prop.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------------------------------------------------------------
          Featured shelf
      ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <div className="reveal-3d flex flex-wrap items-end justify-between gap-4">
          <div>
            <p
              className={cn(
                "text-sm font-semibold uppercase tracking-[0.2em] text-accent",
                textClass(lang),
              )}
            >
              {dict.home.featuredEyebrow}
            </p>
            <h2
              className={cn(
                "mt-2 text-[clamp(1.9rem,4vw,2.9rem)] font-bold tracking-tight text-ink",
                textClass(lang),
              )}
            >
              {dict.home.featuredTitle}
            </h2>
            <p
              className={cn("mt-3 max-w-xl text-ink-mute", textClass(lang))}
            >
              {dict.home.featuredLead}
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={href("/books")}>
              {dict.common.viewAll}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        {/* A showcase, not a grid: the featured titles turn past the reader as
            a ring of covers, the front one face-on. The catalogue itself stays
            a grid — a ring you have to wait on is no way to browse forty books
            or to be indexed. */}
        <BookCarousel3D
          books={featured}
          lang={lang}
          dict={dict}
          className="mt-14"
        />
      </section>

      {/* ---------------------------------------------------------------
          Categories
      ---------------------------------------------------------------- */}
      <section className="border-y border-line/60 bg-bg-deep">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
          <div className="reveal-3d">
            <h2
              className={cn(
                "text-[clamp(1.9rem,4vw,2.9rem)] font-bold tracking-tight text-ink",
                textClass(lang),
              )}
            >
              {dict.home.categoriesTitle}
            </h2>
            <p className={cn("mt-3 max-w-xl text-ink-mute", textClass(lang))}>
              {dict.home.categoriesLead}
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat, i) => {
              const Icon =
                { BookOpen, Feather, Landmark, Atom, Baby, Library }[
                  cat.icon
                ] ?? BookOpen;
              return (
                /* The reveal sits on a wrapper, not on the tile: a filled
                   scroll animation holds `transform` forever, which would
                   cancel the tile's own press-in on hover. */
                <div
                  key={cat.id}
                  className="reveal-3d h-full"
                  style={{ "--lag": (i % 3) * 5 } as React.CSSProperties}
                >
                  <Link
                    href={href(`/categories/${cat.slug}`)}
                    className="tile3d group flex h-full flex-col rounded-2xl border border-line bg-surface p-6 hover:border-accent/40"
                  >
                    <div className="flex items-start justify-between">
                      <span className="inline-flex size-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <span className="text-sm text-ink-faint">
                        {titlesCount(dict, lang, cat.bookCount)}
                      </span>
                    </div>
                    <h3
                      className={cn(
                        "mt-5 text-xl font-semibold text-ink transition-colors group-hover:text-accent",
                        textClass(lang),
                      )}
                    >
                      {categoryName(cat, lang)}
                    </h3>
                    <p
                      className={cn(
                        "mt-2 text-[0.95rem] leading-relaxed text-ink-mute",
                        textClass(lang),
                      )}
                    >
                      {categoryDescription(cat, lang)}
                    </p>

                    {/* The shelf is not decoration: these are the category's
                        most-downloaded volumes, in thickness order as they'd
                        actually stand. Spines don't link here — the whole card
                        is already one link. */}
                    <div className="mt-auto pt-7">
                      <Shelf3D
                        books={cat.shelf}
                        lang={lang}
                        height={52}
                        linked={false}
                      />
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------
          Recently added
      ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <div className="reveal-3d flex flex-wrap items-end justify-between gap-4">
          <h2
            className={cn(
              "text-[clamp(1.9rem,4vw,2.9rem)] font-bold tracking-tight text-ink",
              textClass(lang),
            )}
          >
            {dict.home.recentTitle}
          </h2>
          <Button asChild variant="ghost" size="sm">
            <Link href={href("/books?sort=recent")}>
              {dict.common.seeEverything}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {recent.slice(0, 8).map((book, i) => (
            <BookCard
              key={book.id}
              book={book}
              lang={lang}
              dict={dict}
              index={i}
            />
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------
          Closing CTA
      ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-5 pb-8 lg:px-8">
        <div className="reveal-3d relative overflow-hidden rounded-3xl bg-ink px-8 py-16 text-center shadow-e4 lg:px-16 lg:py-24">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-24 -top-24 size-96 rounded-full opacity-30 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
            }}
          />
          <Zap className="mx-auto size-8 text-accent" aria-hidden="true" />
          <h2
            className={cn(
              "mx-auto mt-6 max-w-2xl text-[clamp(1.8rem,4vw,3rem)] font-bold leading-tight tracking-tight text-bg",
              lang === "bn" && "bn leading-[1.35]",
            )}
          >
            {dict.home.ctaTitle}
          </h2>
          <p
            className={cn(
              "mx-auto mt-4 max-w-lg text-lg text-bg/70",
              textClass(lang),
            )}
          >
            {dict.home.ctaLead}
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button asChild variant="primary" size="lg">
              <Link href={href("/books")}>
                {dict.home.ctaButton}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
