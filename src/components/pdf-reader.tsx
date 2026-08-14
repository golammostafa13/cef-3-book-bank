"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Maximize2,
  Moon,
  Sun,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { getDictionary } from "@/lib/i18n";
import { localePath, type Locale } from "@/lib/i18n/config";
import {
  bookAuthorName,
  bookTitle,
  formatNumberIn,
  textClass,
} from "@/lib/i18n/content";
import { cn } from "@/lib/utils";
import { fill } from "@/lib/i18n/format";
import type { Book } from "@/types";

/**
 * In-browser PDF reader.
 *
 * Security posture — PDFs are untrusted input, so PDF.js is loaded with:
 *   isEvalSupported: false   — no eval of font/JS streams
 *   disableAutoFetch         — pages stream on demand via HTTP range requests
 * and the worker runs from our own origin (see `worker-src` in next.config).
 *
 * Rendering is one canvas per visible page, drawn on demand. Reading position
 * is remembered in localStorage per book.
 */

// Type-only import: erased at compile time, so pdfjs still loads lazily
// in the effect below and never lands in the initial bundle.
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";

export function PdfReader({
  book,
  lang,
}: {
  book: Book;
  lang: Locale;
}) {
  const dict = getDictionary(lang);
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [page, setPage] = useState(1);
  /**
   * `null` means "as wide as the column allows" and is the state the reader
   * opens in. A fixed default cannot be right for both a phone and a desktop:
   * 1.35 is a comfortable A4 on a laptop and about 800px wide, which on a
   * 360px screen meant well over half of every page was outside the frame with
   * no way to reach it. Resolved to a number in `fitScale` below, and replaced
   * by a real number the moment the reader zooms.
   */
  const [scale, setScale] = useState<number | null>(null);
  const [fitScale, setFitScale] = useState(1);
  const [sepia, setSepia] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const renderTask = useRef<RenderTask | null>(null);
  const storageKey = `cef3:progress:${book.slug}`;

  /** What the page is actually drawn at: the fit width until asked otherwise. */
  const effectiveScale = scale ?? fitScale;

  // --- Load the document -------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        // No `isEvalSupported` here: pdf.js 6 dropped its eval paths entirely,
        // so the option no longer exists — and the CSP has no 'unsafe-eval' in
        // production either way.
        const task = pdfjs.getDocument({
          url: book.fileUrl,
          disableAutoFetch: true,
          disableStream: false,
        });

        const loaded = await task.promise;
        if (cancelled) return;

        setDoc(loaded);
        const saved = Number(window.localStorage.getItem(storageKey) ?? 1);
        setPage(Math.min(Math.max(1, saved), loaded.numPages));
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(
            process.env.NODE_ENV === "development"
              ? `PDF load failed: ${err instanceof Error ? err.message : String(err)}`
              : dict.reader.failed,
          );
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [book.fileUrl, storageKey, dict.reader.failed]);

  /* --- Fit to width -----------------------------------------------------
     The scale at which the current page exactly fills the stage. Measured
     from the page's own unscaled width and the stage's client width, so it
     is right for a landscape plate in a portrait book as much as for a
     phone in a rotation, and recomputed whenever either could have changed:
     a new document, a new page, a resize, an orientation change. ---------- */
  useEffect(() => {
    if (!doc) return;
    let cancelled = false;

    const measure = async () => {
      const stage = stageRef.current;
      if (!stage) return;
      const pdfPage = await doc.getPage(page);
      if (cancelled) return;
      // scale: 1 gives the page's intrinsic CSS width in points.
      const natural = pdfPage.getViewport({ scale: 1 }).width;
      // `clientWidth` includes the stage's own padding, and a page fitted to
      // that is exactly the gutter too wide — enough to leave the stage
      // scrolling sideways by 12px at rest.
      const pad = getComputedStyle(stage);
      const room =
        stage.clientWidth -
        parseFloat(pad.paddingLeft) -
        parseFloat(pad.paddingRight);
      if (natural <= 0 || room <= 0) return;
      // Never blown up past a comfortable reading size on a wide screen: a
      // 1600px-wide page of body text is a worse read than a 1.6x one.
      setFitScale(Math.min(1.6, Math.max(0.2, room / natural)));
    };

    void measure();
    const ro = new ResizeObserver(() => void measure());
    if (stageRef.current) ro.observe(stageRef.current);
    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, [doc, page]);

  // --- Render the current page ------------------------------------------
  const renderPage = useCallback(async () => {
    if (!doc || !canvasRef.current) return;

    // Cancel any in-flight render before starting another, or the two
    // fight over the same canvas.
    renderTask.current?.cancel();

    const pdfPage = await doc.getPage(page);
    const viewport = pdfPage.getViewport({ scale: effectiveScale });
    const canvas = canvasRef.current;

    // Render at device resolution, lay out at CSS resolution, so the page
    // is sharp on HiDPI screens without doubling the layout size.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(viewport.width * dpr);
    canvas.height = Math.floor(viewport.height * dpr);
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;

    // pdf.js v6 wants the canvas itself; passing only `canvasContext` is a
    // legacy path that requires `canvas: null` and otherwise renders nothing.
    const task = pdfPage.render({
      canvas,
      viewport,
      transform: dpr === 1 ? undefined : [dpr, 0, 0, dpr, 0, 0],
    });
    renderTask.current = task;
    try {
      await task.promise;
    } catch {
      /* superseded by a newer render — expected */
    }
  }, [doc, page, effectiveScale]);

  useEffect(() => {
    void renderPage();
  }, [renderPage]);

  useEffect(() => {
    if (doc) window.localStorage.setItem(storageKey, String(page));
  }, [page, doc, storageKey]);

  // --- Keyboard navigation ----------------------------------------------
  const total = doc?.numPages ?? book.pages;
  const go = useCallback(
    (delta: number) => setPage((p) => Math.min(Math.max(1, p + delta), total)),
    [total],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown") go(1);
      if (e.key === "ArrowLeft" || e.key === "PageUp") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const progress = total ? (page / total) * 100 : 0;

  return (
    <div className="flex min-h-dvh flex-col bg-bg-deep">
      {/* Toolbar

          Two rows below `sm`, one from there up. Eight controls, a zoom
          readout and a two-line title do not fit across 360px — squeezed onto
          one row the title collapsed to nothing and the buttons overlapped —
          so on a phone the book's name gets the first row and the controls get
          the second, where they are still full-size tap targets. */}
      <header className="sticky top-0 z-40 border-b border-line/60 bg-bg/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-3 py-2 sm:h-16 sm:flex-row sm:items-center sm:gap-3 sm:px-4 sm:py-0">
          <div className="flex min-w-0 items-center gap-2 sm:flex-1 sm:gap-3">
            <Link
              href={localePath(lang, `/books/${book.slug}`)}
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-ink-mute hover:bg-accent-soft hover:text-accent"
              aria-label={dict.reader.backToBook}
            >
              <ArrowLeft className="size-[18px]" />
            </Link>

            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "truncate text-sm font-semibold text-ink sm:text-base",
                  textClass(lang),
                )}
              >
                {bookTitle(book, lang)}
              </p>
              <p
                className={cn("truncate text-xs text-ink-faint", textClass(lang))}
              >
                {bookAuthorName(book, lang)}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-end gap-0.5 sm:gap-1">
            <ToolButton
              onClick={() => setScale(Math.max(0.25, effectiveScale - 0.2))}
              label={dict.reader.zoomOut}
            >
              <ZoomOut className="size-[18px]" />
            </ToolButton>
            {/* The readout is a label, not a control, and it is the first
                thing to go when the row is short of room. */}
            <span className="hidden w-12 text-center text-xs tabular-nums text-ink-mute sm:inline">
              {formatNumberIn(Math.round(effectiveScale * 100), lang)}%
            </span>
            <ToolButton
              onClick={() => setScale(Math.min(4, effectiveScale + 0.2))}
              label={dict.reader.zoomIn}
            >
              <ZoomIn className="size-[18px]" />
            </ToolButton>
            {/* Back to fitting the column — the state the reader opened in, and
                the way out of a zoom that has left the page wider than the
                screen. It was previously labelled "Sepia", which is the button
                beside it. */}
            <ToolButton
              onClick={() => setScale(null)}
              label={dict.reader.fitWidth}
              pressed={scale === null}
            >
              <Maximize2 className="size-[18px]" />
            </ToolButton>
            <ToolButton
              onClick={() => setSepia((v) => !v)}
              label={dict.reader.sepia}
              pressed={sepia}
            >
              {sepia ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
            </ToolButton>
            <a
              href={`${book.fileUrl}?download=1`}
              download
              aria-label={fill(lang, dict.common.downloadFormat, {
                format: book.format.toUpperCase(),
              })}
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-ink-mute hover:bg-accent-soft hover:text-accent"
            >
              <Download className="size-[18px]" />
            </a>
          </div>
        </div>

        <div
          className="h-0.5 bg-accent transition-[width] duration-300"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={page}
          aria-valuemin={1}
          aria-valuemax={total}
          aria-label={fill(lang, dict.reader.pageOf, { page, total })}
        />
      </header>

      {/* Page

          The stage scrolls in both directions rather than clipping. A page
          zoomed past the fit width is wider than the frame by design, and
          `overflow-hidden` on the wrapper below meant the part outside was
          simply gone — which on a phone, where the old fixed 1.35 scale was
          already twice the screen's width, was most of every page.

          `overscroll-contain` so panning a zoomed page does not drag the
          document behind it, and `touch-pan-x touch-pan-y` so the pan is the
          browser's own — a compositor scroll, not a JS drag handler. */}
      <div
        ref={stageRef}
        className="flex flex-1 touch-pan-x touch-pan-y justify-center overflow-auto overscroll-contain px-3 py-5 sm:px-4 sm:py-10"
      >
        {loading && (
          <div className="flex flex-col items-center gap-3 py-32 text-ink-mute">
            <Loader2 className="size-7 animate-spin" aria-hidden="true" />
            <p className={textClass(lang)}>{dict.reader.loading}</p>
          </div>
        )}

        {error && (
          <div className="py-32 text-center">
            <p className="text-lg text-ink">{error}</p>
            <Link
              href={localePath(lang, `/books/${book.slug}`)}
              className={cn(
                "mt-4 inline-block text-accent underline underline-offset-4",
                textClass(lang),
              )}
            >
              {dict.reader.backToBook}
            </Link>
          </div>
        )}

        {!loading && !error && (
          <div
            className={cn(
              // `h-fit` so the page keeps its own height inside a stretching
              // flex row, and `m-auto` so a page narrower than the stage is
              // still centred in it.
              "m-auto h-fit shrink-0 overflow-hidden rounded-lg shadow-e4 transition-[filter]",
              sepia && "sepia-[0.35] saturate-[0.9]",
            )}
          >
            <canvas ref={canvasRef} className="block bg-white" />
          </div>
        )}
      </div>

      {/* Pager

          The labels are the icons' alone below `sm`. Spelled out, "Previous
          page" and "Next page" each wrapped to two lines inside their pill and
          squeezed the page count between them; the buttons stay 40px round
          targets either way, and their names are still on them as `aria-label`
          for anyone who cannot see the arrow. */}
      <footer className="sticky bottom-0 border-t border-line/60 bg-bg/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-center gap-3 px-3 sm:gap-4 sm:px-4">
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={page <= 1}
            aria-label={dict.reader.previousPage}
            className={cn(
              "inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-line text-sm text-ink-mute transition-colors hover:border-ink/30 hover:text-ink disabled:opacity-40 sm:size-auto sm:h-10 sm:gap-1.5 sm:px-4",
              textClass(lang),
            )}
          >
            <ChevronLeft className="size-4 shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">{dict.reader.previousPage}</span>
          </button>

          <p
            className={cn(
              "text-center text-sm tabular-nums text-ink-mute",
              textClass(lang),
            )}
          >
            {fill(lang, dict.reader.pageOf, { page, total })}
          </p>

          <button
            type="button"
            onClick={() => go(1)}
            disabled={page >= total}
            aria-label={dict.reader.nextPage}
            className={cn(
              "inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-line text-sm text-ink-mute transition-colors hover:border-ink/30 hover:text-ink disabled:opacity-40 sm:size-auto sm:h-10 sm:gap-1.5 sm:px-4",
              textClass(lang),
            )}
          >
            <span className="hidden sm:inline">{dict.reader.nextPage}</span>
            <ChevronRight className="size-4 shrink-0" aria-hidden="true" />
          </button>
        </div>
      </footer>
    </div>
  );
}

function ToolButton({
  onClick,
  label,
  children,
  pressed,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
  /** For the two toggles, so their state is visible and announced. */
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      className={cn(
        "inline-flex size-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-accent-soft hover:text-accent",
        pressed ? "bg-accent-soft text-accent" : "text-ink-mute",
      )}
    >
      {children}
    </button>
  );
}
