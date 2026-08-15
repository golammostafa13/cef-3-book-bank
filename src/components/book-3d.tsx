import { CoverArt } from "@/components/cover-art";
import { coverTheme } from "@/lib/cover-theme";
import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { bookTitle } from "@/lib/i18n/content";
import { cn } from "@/lib/utils";
import type { Book } from "@/types";

/**
 * A book rendered as a physical object: front board, spine, fore-edge page
 * block, head and tail, assembled with CSS 3D transforms (see `.book3d` in
 * globals.css for the geometry).
 *
 * Deliberately zero-JS and library-free. A WebGL equivalent would look
 * marginally richer but costs ~600KB and would blow the INP/LCP budget the
 * SEO goal depends on. All the transform work here is GPU-composited and
 * fully disabled under `prefers-reduced-motion`.
 */

type BookLike = Pick<
  Book,
  | "id"
  | "title"
  | "titleBn"
  | "authorName"
  | "authorNameBn"
  | "coverHue"
  | "coverImage"
  | "pages"
>;

interface Book3DProps {
  book: BookLike;
  /** Which language the cover and spine are set in. */
  lang?: Locale;
  className?: string;
  size?: "sm" | "md" | "lg";
  /** Resting rotation, degrees. Less rotation reads as more "on-shelf". */
  angle?: number;
  /** Rotation on hover/focus — the book turns to face the reader. */
  hoverAngle?: number;
  /** Scales the physical thickness. Small thumbs need a chunkier ratio to read. */
  depthScale?: number;
}

export function Book3D({
  book,
  lang = defaultLocale,
  className,
  size = "md",
  angle = -22,
  hoverAngle = -6,
  depthScale = 1,
}: Book3DProps) {
  // Thicker books get a visibly thicker spine — a small touch that makes a
  // shelf of them read as real objects rather than repeated cards.
  const depth =
    Math.min(46, Math.max(14, Math.round(book.pages / 16))) * depthScale;
  const theme = coverTheme(book);

  return (
    <div
      className={cn("book3d", className)}
      style={
        {
          "--depth": `${depth}px`,
          "--ry": `${angle}deg`,
          "--ry-hover": `${hoverAngle}deg`,
          "--spine-color": theme.spine,
        } as React.CSSProperties
      }
    >
      <div className="book3d__inner">
        <div className="book3d__head" />
        <div className="book3d__tail" />

        <div className="book3d__spine">
          {/* Vertical spine type, like the real thing. Titles longer than the
              spine are clipped rather than shrunk — same as a real binding. */}
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ writingMode: "vertical-rl" }}
          >
            <span
              className="truncate px-1 text-[8px] font-semibold uppercase tracking-widest"
              style={{ maxHeight: "82%", color: theme.spineInk, opacity: 0.9 }}
            >
              {bookTitle(book, lang)}
            </span>
          </div>
        </div>

        <div className="book3d__pages" />

        <div className="book3d__face">
          <CoverArt book={book} lang={lang} size={size} />
          <div className="book3d__glare" />
          <div className="book3d__hinge" />
          <div className="book3d__lip" />
        </div>

        <div className="book3d__shadow" />
      </div>
    </div>
  );
}
