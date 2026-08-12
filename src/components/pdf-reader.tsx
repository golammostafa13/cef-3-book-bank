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
  const [scale, setScale] = useState(1.35);
  const [sepia, setSepia] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTask = useRef<RenderTask | null>(null);
  const storageKey = `cef3:progress:${book.slug}`;

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

  // --- Render the current page ------------------------------------------
  const renderPage = useCallback(async () => {
    if (!doc || !canvasRef.current) return;

    // Cancel any in-flight render before starting another, or the two
    // fight over the same canvas.
    renderTask.current?.cancel();

    const pdfPage = await doc.getPage(page);
    const viewport = pdfPage.getViewport({ scale });
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
  }, [doc, page, scale]);

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
      {/* Toolbar */}
      <header className="sticky top-0 z-40 border-b border-line/60 bg-bg/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <Link
            href={localePath(lang, `/books/${book.slug}`)}
            className="inline-flex size-10 items-center justify-center rounded-full text-ink-mute hover:bg-ink/5 hover:text-ink"
            aria-label={dict.reader.backToBook}
          >
            <ArrowLeft className="size-[18px]" />
          </Link>

          <div className="min-w-0 flex-1">
            <p className={cn("truncate font-semibold text-ink", textClass(lang))}>
              {bookTitle(book, lang)}
            </p>
            <p className={cn("truncate text-xs text-ink-faint", textClass(lang))}>
              {bookAuthorName(book, lang)}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <ToolButton
              onClick={() => setScale((s) => Math.max(0.6, s - 0.2))}
              label={dict.reader.zoomOut}
            >
              <ZoomOut className="size-[18px]" />
            </ToolButton>
            <span className="w-12 text-center text-xs tabular-nums text-ink-mute">
              {formatNumberIn(Math.round(scale * 100), lang)}%
            </span>
            <ToolButton
              onClick={() => setScale((s) => Math.min(3, s + 0.2))}
              label={dict.reader.zoomIn}
            >
              <ZoomIn className="size-[18px]" />
            </ToolButton>
            <ToolButton onClick={() => setScale(1.35)} label={dict.reader.sepia}>
              <Maximize2 className="size-[18px]" />
            </ToolButton>
            <ToolButton
              onClick={() => setSepia((v) => !v)}
              label={dict.reader.sepia}
            >
              {sepia ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
            </ToolButton>
            <a
              href={book.fileUrl}
              download
              aria-label={fill(lang, dict.common.downloadFormat, {
                format: book.format.toUpperCase(),
              })}
              className="inline-flex size-10 items-center justify-center rounded-full text-ink-mute hover:bg-ink/5 hover:text-ink"
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

      {/* Page */}
      <div className="flex flex-1 items-start justify-center px-4 py-10">
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
              "overflow-hidden rounded-lg shadow-e4 transition-all",
              sepia && "sepia-[0.35] saturate-[0.9]",
            )}
          >
            <canvas ref={canvasRef} className="block bg-white" />
          </div>
        )}
      </div>

      {/* Pager */}
      <footer className="sticky bottom-0 border-t border-line/60 bg-bg/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-center gap-4 px-4">
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={page <= 1}
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line px-4 text-sm text-ink-mute transition-colors hover:border-ink/30 hover:text-ink disabled:opacity-40"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
            {dict.reader.previousPage}
          </button>

          <p className={cn("text-sm tabular-nums text-ink-mute", textClass(lang))}>
            {fill(lang, dict.reader.pageOf, { page, total })}
          </p>

          <button
            type="button"
            onClick={() => go(1)}
            disabled={page >= total}
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line px-4 text-sm text-ink-mute transition-colors hover:border-ink/30 hover:text-ink disabled:opacity-40"
          >
            {dict.reader.nextPage}
            <ChevronRight className="size-4" aria-hidden="true" />
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
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex size-10 items-center justify-center rounded-full text-ink-mute transition-colors hover:bg-ink/5 hover:text-ink"
    >
      {children}
    </button>
  );
}
