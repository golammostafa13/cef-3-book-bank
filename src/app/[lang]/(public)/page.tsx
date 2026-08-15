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
  Zap,
} from "lucide-react";
import { Book3D } from "@/components/book-3d";
import { BookCarousel3D } from "@/components/book-carousel-3d";
import { BookStack3D } from "@/components/book-stack-3d";
import { Hero3D, type HeroBook } from "@/components/hero-3d";
import { HeroRecent, type HeroListBook } from "@/components/hero-recent";
import { Shelf3D } from "@/components/shelf-3d";
import { Button } from "@/components/ui/button";
import {
  getCategoryShelves,
  getFeatured,
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
import { titlesCount } from "@/lib/i18n/format";
import { cn } from "@/lib/utils";

export default async function HomePage(props: PageProps<"/[lang]">) {
  const { lang } = await props.params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const href = (path: string) => localePath(lang, path);

  const [featured, recent, categories, stats] = await Promise.all([
    getFeatured(6),
    getRecent(16),
    getCategoryShelves(9),
    getStats(),
  ]);

  // The pile carries the featured titles; the standing volume next to it is
  // the most-downloaded book, so the hero always shows something worth opening.
  const pileBooks = featured.slice(0, 5);

  /**
   * What the hero scene is built from: the newest arrivals, most recent first.
   * The first volume is the one that opens, the rest are the collection that
   * arrives behind it and settles into the shelf — and the list at the end of
   * the scroll is those same books in that same order, so what the reader
   * watches being shelved is exactly what they can then click.
   *
   * Only the seven fields the scene actually draws with cross to the client —
   * a `Book` carries a description and inventory columns no cover needs, and
   * all sixteen of them would be in the page's RSC payload.
   */
  const sceneBooks: HeroBook[] = recent.map((book) => ({
    id: book.id,
    slug: book.slug,
    title: book.title,
    titleBn: book.titleBn,
    authorName: book.authorName,
    authorNameBn: book.authorNameBn,
    coverHue: book.coverHue,
    pages: book.pages,
  }));

  /**
   * The same arrivals as records. Six, not sixteen: this is a list a reader
   * scans at the end of a scroll, and the catalogue is one click away for the
   * rest of them. Trimmed for the same payload reason as the scene, with the
   * fields a row actually shows.
   */
  const recentList: HeroListBook[] = recent.slice(0, 6).map((book) => ({
    id: book.id,
    slug: book.slug,
    title: book.title,
    titleBn: book.titleBn,
    authorName: book.authorName,
    authorNameBn: book.authorNameBn,
    coverHue: book.coverHue,
    year: book.year,
    format: book.format,
    fileSizeMb: book.fileSizeMb,
    fileUrl: book.fileUrl,
  }));

  const propIcons = [BookOpen, Download, Globe];

  /**
   * The volumes drifting behind the closing call to action.
   *
   * Hand-placed, never generated: this is a composition, and the two things
   * it has to get right — that no volume lands under the heading or the one
   * button, and that the four of them read as being at different distances
   * rather than as a row — are both judgements about *this* layout that no
   * loop can make. Percentages rather than pixels so the arrangement holds
   * from 1024px up.
   *
   * The far pair are wider, dimmer, and slightly out of focus; the near pair
   * are smaller, sharper, and tilted harder. That inversion is deliberate —
   * dimming alone reads as a faded book, not a distant one. Every duration is
   * a different prime-ish number of seconds so the four never fall into step,
   * which is the tell that turns a drift into a carousel.
   */
  const ctaFloaters = [
    { book: featured[0], x: "-2%", y: "12%", w: "184px", tilt: "-9deg", angle: -30, dur: "15s", delay: "0s", dim: "0.5", soft: "1.1px" },
    { book: featured[1], x: "9%", y: "58%", w: "126px", tilt: "7deg", angle: -16, dur: "11s", delay: "-3.5s", dim: "0.9", soft: "0px" },
    { book: featured[2], x: "80%", y: "8%", w: "170px", tilt: "11deg", angle: 26, dur: "17s", delay: "-7s", dim: "0.46", soft: "1.3px" },
    { book: featured[3], x: "87%", y: "62%", w: "122px", tilt: "-6deg", angle: 18, dur: "13s", delay: "-1.5s", dim: "0.9", soft: "0px" },
  ].filter((f) => f.book);

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
        hrefs={{
          books: href("/books"),
          categories: href("/categories"),
        }}
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
          featuredTitle: dict.home.featuredTitle,
        }}
        stats={{
          books: formatCompactIn(stats.totalBooks, lang),
          authors: formatCompactIn(stats.totalAuthors, lang),
          downloads: formatCompactIn(stats.totalDownloads, lang),
        }}
        fallback={
          // <BookStack3D
          //   books={pileBooks}
          //   lang={lang}
          //   className="absolute inset-0"
          // />
          <></>
        }
      />
      

      {/* ---------------------------------------------------------------
          Recently added — a plain section below the hero, no overlay
      ---------------------------------------------------------------- */}
      <section className="border-b border-line/60 bg-surface/50">
        <div className="mx-auto max-w-3xl px-5 py-14 lg:px-8">
          <HeroRecent
            books={recentList}
            lang={lang}
            copy={{
              title: dict.home.recentTitle,
              lead: dict.home.recentLead,
              seeEverything: dict.common.seeEverything,
              details: dict.book.details,
              downloadOf: dict.common.downloadOf,
            }}
            href={href("/books?sort=recent")}
          />
        </div>
      </section>

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
          Closing CTA

          The recently-added shelf used to stand here. It is now the last
          beat of the hero — the scene assembles those exact books, and the
          list the scroll resolves to is them, clickable.
      ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:pb-8">
        <div className="ctafloat reveal-3d rounded-3xl px-8 py-16 text-center shadow-e3 lg:px-16 lg:py-28">
          {/* The drifting volumes. Hidden below `lg`, where the copy already
              fills the panel edge to edge and a book behind it would be
              reading material laid over reading material. */}
          <div aria-hidden="true" className="hidden lg:block">
            {ctaFloaters.map((f) => (
              <div
                key={f.book.id}
                className="ctafloat__drift"
                style={
                  {
                    "--x": f.x,
                    "--y": f.y,
                    "--w": f.w,
                    "--tilt": f.tilt,
                    "--dur": f.dur,
                    "--delay": f.delay,
                    "--dim": f.dim,
                    "--soft": f.soft,
                  } as React.CSSProperties
                }
              >
                <Book3D
                  book={f.book}
                  lang={lang}
                  size="sm"
                  angle={f.angle}
                  hoverAngle={f.angle}
                />
              </div>
            ))}
          </div>

          <div className="ctafloat__body">
            <Zap className="mx-auto size-8 text-accent" aria-hidden="true" />
            <h2
              className={cn(
                "mx-auto mt-6 max-w-2xl text-[clamp(1.8rem,4vw,3rem)] font-bold leading-tight tracking-tight text-ink",
                lang === "bn" && "bn leading-[1.35]",
              )}
            >
              {dict.home.ctaTitle}
            </h2>
            <p
              className={cn(
                "mx-auto mt-4 max-w-lg text-lg text-ink-mute",
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
        </div>
      </section>
    </>
  );
}
