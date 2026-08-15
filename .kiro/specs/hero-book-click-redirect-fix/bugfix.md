# Bugfix Requirements Document

## Introduction

Clicking on books displayed in the hero section does not navigate the user to the book's detail page. There are two independent failure modes with a shared symptom.

First, the CSS floating books (`hero3d__floaters`) are `<Link>` components that should be clickable, but the WebGL `<canvas>` is absolutely positioned on top of the entire pin area without `pointer-events: none`. Because the canvas sits higher in the stacking context, it intercepts all pointer events before they can reach the `<Link>` elements underneath — so the floater links never fire.

Second, the WebGL field books (three.js shelf items) do handle `onPointerDown` correctly and fire `options.onBookClick?.(item.book)`. However, the callback in `hero-3d.tsx` navigates using `book.id` (`window.location.href = \`/${lang}/books/${book.id}\``), while every other navigation in the same file uses `book.slug`. If `id` and `slug` differ — which is typical (e.g. id `42` vs slug `the-great-gatsby`) — the WebGL click routes to a non-existent or wrong URL.

Both defects must be fixed, and all existing hero behaviour (scroll animation, hover effects, accessibility attributes, reduced-motion fallback) must be preserved.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user clicks a CSS floating book (`hero3d__floaters` `<Link>`) THEN the system does not navigate to the book detail page because the `<canvas>` element intercepts the pointer event first.

1.2 WHEN a user clicks a WebGL field book (settled shelf item after scroll progress ≥ 0.86) THEN the system navigates to `/{lang}/books/{book.id}` which resolves to a non-existent or wrong route when `book.id` differs from `book.slug`.

### Expected Behavior (Correct)

2.1 WHEN a user clicks a CSS floating book (`hero3d__floaters` `<Link>`) THEN the system SHALL navigate to `/{lang}/books/{book.slug}` using the Next.js router, unobstructed by the canvas.

2.2 WHEN a user clicks a WebGL field book (settled shelf item after scroll progress ≥ 0.86) THEN the system SHALL navigate to `/{lang}/books/{book.slug}` using the correct slug-based route.

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the WebGL canvas renders THEN the system SHALL CONTINUE TO intercept pointer events for its own hover and click raycasting interactions (the canvas must retain pointer events for WebGL books; only the CSS floater area beneath it needs to receive events through it).

3.2 WHEN the hero scroll animation plays THEN the system SHALL CONTINUE TO animate books, camera, copy blocks, and all other visual elements exactly as before.

3.3 WHEN a user hovers over a settled WebGL field book THEN the system SHALL CONTINUE TO show the pointer cursor, apply the hover lift/tilt effect, and illuminate the hover light.

3.4 WHEN `prefers-reduced-motion` is active THEN the system SHALL CONTINUE TO collapse the hero track and show the static fallback composition without loading the WebGL scene.

3.5 WHEN the WebGL scene is unavailable or takes longer than 8 seconds to load THEN the system SHALL CONTINUE TO display the static hero fallback.

3.6 WHEN a user navigates via the "Get Started" or "Browse Categories" CTA buttons in the hero THEN the system SHALL CONTINUE TO route to the correct hrefs unchanged.

3.7 WHEN a book has no `slug` property defined THEN the system SHALL CONTINUE TO handle the missing value gracefully (the floater filter already guards `f.book` existence; the WebGL callback should not throw).
