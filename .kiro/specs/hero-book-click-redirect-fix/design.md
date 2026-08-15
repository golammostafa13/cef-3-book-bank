# Hero Book Click Redirect Bugfix Design

## Overview

Clicking a 3D book displayed in the hero section fails to navigate to that
book's detail page. Two independent defects combine to produce this failure:

1. **Canvas pointer-event occlusion** — the WebGL `<canvas>` element is
   absolutely positioned over the entire pinned panel (`inset: 0; z-index: 1`)
   and absorbs all pointer events. The CSS floater `<Link>` elements sit
   underneath at `z-index: 0` (when `data-live="true"`) and are therefore
   unreachable by mouse or touch. The canvas must keep its own pointer events
   for raycasting (hover and click detection of shelf-phase field books), so
   the fix must route floater clicks _through_ the canvas rather than strip
   the canvas's pointer events entirely.

2. **Wrong URL slug** — when a WebGL field-book is clicked the
   `onBookClick` callback in `hero-3d.tsx` builds the destination URL from
   `book.id` (a numeric database key) instead of `book.slug` (the
   human-readable identifier). The `HeroBook` type already carries a `slug`
   field that flows from the server, so no data-fetching change is required.

The fix is minimal and targeted: a CSS `pointer-events` correction for the
floaters and a one-line slug substitution for the callback.

---

## Glossary

- **Bug_Condition (C)**: The joint condition that causes navigation to fail —
  either (a) a pointer-event click on a CSS floater `<Link>` is blocked by the
  overlying canvas, or (b) a WebGL raycaster click fires with the wrong URL.
- **Property (P)**: The desired outcome — clicking any displayed 3D book in the
  hero navigates the browser to `/{lang}/books/{book.slug}`.
- **Preservation**: All existing hero behaviours — scroll animation, WebGL
  raycasting hover/click on shelf-phase books, reduced-motion fallback,
  beat-0/1/2 copy transitions, theme refresh — that must be unchanged by the
  fix.
- **`Hero3D`**: The React component in
  `src/components/hero-3d.tsx` that renders the pinned hero panel.
- **`hero3d__canvas`**: The `<canvas>` element positioned `inset: 0` at
  `z-index: 1`; the WebGL surface.
- **`hero3d__floaters`**: The absolutely-positioned container holding the CSS
  animated `<Link>/<Book3D>` elements; dropped to `z-index: 0` once
  `data-live="true"`.
- **`hero3d__floater`**: An individual floating book `<Link>` with
  `pointer-events: auto` on the element itself but occluded by the canvas above.
- **`createHeroScene`**: The factory in `src/lib/hero-scene.ts` that sets up the
  WebGL renderer, raycaster, and the `onPointerDown` handler that fires
  `onBookClick`.
- **`onBookClick`**: The callback passed to `createHeroScene`; currently
  navigates to `/{lang}/books/${book.id}` — should use `book.slug`.
- **`SceneBook`**: The type consumed by `hero-scene.ts`; has `id` and other
  fields but no `slug`.
- **`HeroBook`**: `SceneBook & { slug: string }` — the enriched type used by
  `Hero3D`; the `slug` is available on every book passed to the component.

---

## Bug Details

### Bug Condition

The bug manifests when a user clicks on any of the 3D book visuals in the
hero section. There are two distinct click paths, each broken independently:

**Path A — CSS floaters (beat-0, before/during WebGL load)**
The `hero3d__floaters` container is at `z-index: 0` once the canvas is live
(`data-live="true"`). The canvas sits at `z-index: 1` with `pointer-events`
active over the full panel. A click on a floater hits the canvas instead and
is either absorbed by WebGL raycasting or silently dropped.

**Path B — WebGL field books (beat-2 / shelf phase, progress ≥ 0.86)**
The WebGL raycaster correctly identifies the clicked book and fires
`onBookClick(item.book)`. The callback then calls
`window.location.href = /${lang}/books/${book.id}`, producing a URL like
`/en/books/42` which does not correspond to any routed page.

**Formal Specification:**

```
FUNCTION isBugCondition(input)
  INPUT: input of type ClickEvent | PointerDownEvent
  OUTPUT: boolean

  IF input.target IS hero3d__canvas
     AND input.underlyingElement IS hero3d__floater Link
  THEN
    // Path A: canvas ate the click meant for a floater Link
    RETURN true
  END IF

  IF input.target IS hero3d__canvas
     AND raycasterHit(input) IS SceneBook
     AND navigatesTo(input) MATCHES "/{lang}/books/{book.id}"
  THEN
    // Path B: click reaches handler but URL is wrong
    RETURN true
  END IF

  RETURN false
END FUNCTION
```

### Examples

- **Path A — desktop, beat-0**: User clicks the top-right floating book at
  `x: 62%, y: 12%`. Expected: navigate to `/{lang}/books/the-great-gatsby`.
  Actual: canvas absorbs the event; no navigation occurs.

- **Path A — all four floaters**: Any of the four CSS floater links
  (`books[0..3]`) is unreachable while the canvas is live.

- **Path B — shelf phase**: User scrolls to progress ≥ 0.86, hovers a WebGL
  field book (cursor becomes pointer), clicks it. Expected: navigate to
  `/{lang}/books/the-great-gatsby`. Actual: navigates to `/en/books/42`,
  resulting in a 404 or wrong-page response.

- **Edge case — reduced motion**: CSS floaters are hidden (`display: none`) and
  the WebGL scene is never loaded. No click path exists; this case is unaffected
  by either fix.

- **Edge case — WebGL unavailable / timeout**: Scene never initialises, canvas
  stays `opacity: 0`, floaters retain their initial `z-index`. Path A does not
  apply (canvas not live). Path B does not apply (no raycaster). No regression.

---

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**

- The WebGL canvas MUST retain `pointer-events: auto` so raycasting continues to
  work for hover glow, cursor changes, and `onPointerDown` on shelf-phase books.
- Mouse hover over WebGL field books MUST continue to trigger the glow, lift, and
  tilt animations.
- Scroll-driven progress animation (beats 0 → 1 → 2) MUST be unaffected.
- The reduced-motion fallback (no canvas, no floaters, static composition) MUST
  be unaffected.
- The `data-live` / `data-static` / `data-beat` state machine MUST continue to
  control opacity transitions and pointer-event grants as before.
- Theme refresh (`refreshTheme`) MUST continue to work on light/dark toggle.
- The `dispose()` cleanup path MUST continue to remove all canvas event listeners.
- All non-hero interactive elements (nav, buttons, stat links) MUST be unaffected.

**Scope:**

All interactions that do NOT involve clicking a 3D book in the hero should be
completely unaffected. This includes:

- Clicking the "Get Started" or "Browse Categories" buttons in the hero copy.
- Scrolling through the hero to advance the animation.
- Hovering over WebGL field books (no navigation, just visual feedback).
- Any interaction outside the hero section entirely.

> **Note:** The desired click behavior itself is defined in Correctness
> Properties below (Property 1 and Property 3). This section documents
> only what must not change.

---

## Hypothesized Root Cause

### Root Cause A — CSS Stacking Order Blocks Floater Clicks

In `src/app/globals.css`:

```css
.hero3d__canvas {
  position: absolute;
  inset: 0;
  z-index: 1;          /* covers the full panel */
  /* pointer-events is NOT set to none here */
}

.hero3d[data-live="true"] .hero3d__floaters {
  z-index: 0;          /* dropped below the canvas when live */
}

.hero3d__floater {
  pointer-events: auto; /* set, but the canvas is on top */
}
```

Because `.hero3d__canvas` has no `pointer-events: none` rule and sits above
`.hero3d__floaters` in the stacking order, every click in the right half of
the panel lands on the canvas surface. The floater `<Link>` elements at
`z-index: 0` are never reached by the event.

The canvas **cannot** be given `pointer-events: none` globally because it
needs pointer events for WebGL raycasting. The correct fix is to let pointer
events fall through the canvas to the floaters while still being caught by the
canvas for raycasting purposes.

Two viable approaches:

1. **CSS-only**: Raise the floaters above the canvas in z-index — but this
   would make the floaters block WebGL raycasting in their bounding boxes.

2. **Targeted pass-through**: Keep the canvas on top; add a forwarding
   mechanism so clicks on the canvas that hit a floater region are
   re-dispatched to the correct `<Link>`. This is complex and fragile.

3. **Correct approach**: The floaters are _beat-0_ only. Once the scene is
   live the canvas takes over completely. The `<Link>` elements should be
   raised above the canvas (`z-index: 2`) while the floaters are visible, and
   the floater container should be marked `pointer-events: none` so that the
   canvas can still catch pointer events in the areas between books.
   Individual `.hero3d__floater` elements already have `pointer-events: auto`,
   which correctly re-enables clicks only on the book shapes themselves.

### Root Cause B — `book.id` Used Instead of `book.slug`

In `src/components/hero-3d.tsx`, the `onBookClick` callback:

```typescript
onBookClick: (book) => {
  window.location.href = `/${lang}/books/${book.id}`;
  //                                             ^^^^
  //                                       should be book.slug
},
```

`createHeroScene` receives `field: SceneBook[]`. `SceneBook` is `CoverBook & {
pages: number }` — it does not carry `slug`. However, `Hero3D` works with
`HeroBook[]` which is `SceneBook & { slug: string }`. The `books.slice(1)`
passed as `field` are `HeroBook` objects at runtime, but the TypeScript type
seen by `hero-scene.ts` is `SceneBook`, so `slug` is not accessible there.

The fix must either:
- Change `onBookClick`'s callback parameter type to include `slug`, or
- Keep `SceneBook` as-is in the scene and widen the `onBookClick` signature to
  accept the full `HeroBook` type that the caller already has.

The cleanest approach: change `onBookClick`'s parameter type in
`HeroSceneOptions` from `SceneBook` to `SceneBook & { slug?: string }` (or a
generic), and in the callback body use `book.slug ?? String(book.id)` as a
safe fallback. Alternatively, since `Hero3D` controls the closure, the
callback can close over the books array and look up the slug by `book.id`.

---

## Correctness Properties

Property 1: Bug Condition A — CSS Floater Links Are Clickable

_For any_ pointer-down event whose coordinates land within a
`.hero3d__floater` bounding box while `data-live="true"`, the browser SHALL
follow the `<Link href>` for that floater, navigating to
`/{lang}/books/{book.slug}`, regardless of the canvas being positioned above
the floaters in the stacking context.

**Validates: Requirements 2.1, 2.2**

Property 2: Bug Condition B — WebGL Click Uses Slug

_For any_ `pointerdown` event on the WebGL canvas that the raycaster resolves
to a field book while `progress ∈ [0.86, 1.001]`, the `onBookClick` callback
SHALL navigate to `/{lang}/books/{book.slug}`, not `/{lang}/books/{book.id}`.

**Validates: Requirements 2.3, 2.4**

Property 3: Preservation — Non-Floater Canvas Pointer Events Are Unchanged

_For any_ pointer event on the canvas that does NOT land within a
`.hero3d__floater` bounding box, the WebGL scene SHALL handle it identically
to the original code: hover glow activates, cursor changes to pointer, and
`onBookClick` fires on `pointerdown` over a raycaster hit.

**Validates: Requirements 3.1, 3.2, 3.3**

Property 4: Preservation — No Regression in Scroll Animation or Other Behaviors

_For any_ user interaction that is not a click on a 3D book (scrolling,
hovering, theme toggle, resize, reduced-motion), the hero SHALL behave
identically to the original code.

**Validates: Requirements 3.4, 3.5, 3.6**

---

## Fix Implementation

### Changes Required

#### File 1: `src/app/globals.css`

**Change**: Raise `.hero3d__floaters` above the canvas in z-index while it is
visible, so its `<Link>` elements receive clicks directly.

**Specific Changes**:

1. **Inside the `@media (min-width: 1024px)` block** — change `z-index` from
   `1` to `2` on `.hero3d__floaters`:
   ```css
   /* before */
   .hero3d__floaters {
     z-index: 1;
     pointer-events: none;
     …
   }
   /* after */
   .hero3d__floaters {
     z-index: 2;          /* above the canvas */
     pointer-events: none;
     …
   }
   ```
   The container keeps `pointer-events: none`; each `.hero3d__floater` already
   has `pointer-events: auto`, so only the book shapes — not the empty space
   between them — intercept clicks. WebGL raycasting is unaffected in those
   empty regions.

2. **`.hero3d[data-live="true"] .hero3d__floaters`** — remove (or raise) the
   `z-index: 0` override so the floaters stay above the canvas when live:
   ```css
   /* before */
   .hero3d[data-live="true"] .hero3d__floaters {
     z-index: 0;
   }
   /* after — drop this rule entirely, or keep for opacity transition only */
   ```
   The visual "behind the canvas" effect was achieved by dropping z-index; the
   same depth read can be preserved by reducing floater opacity instead (the
   existing `opacity` transition on the container already handles fade-out).

#### File 2: `src/components/hero-3d.tsx`

**Change**: Replace `book.id` with `book.slug` in the `onBookClick` callback.

**Specific Changes**:

1. **`onBookClick` closure in the `useEffect`** — change the navigation target:
   ```typescript
   // before
   onBookClick: (book) => {
     window.location.href = `/${lang}/books/${book.id}`;
   },

   // after
   onBookClick: (book) => {
     const slug = (book as HeroBook).slug ?? String(book.id);
     window.location.href = `/${lang}/books/${slug}`;
   },
   ```
   The cast to `HeroBook` is safe because `Hero3D` passes `books.slice(1)` as
   `field`, and each element is a `HeroBook` with a `slug`. The `?? book.id`
   fallback guards the unlikely case that `slug` is absent at runtime.

2. **Optional — widen `HeroSceneOptions.onBookClick` type** in
   `src/lib/hero-scene.ts` from `(book: SceneBook) => void` to
   `(book: SceneBook & { slug?: string }) => void` to make the cast above
   unnecessary and explicit at the call-site type level.

---

## Testing Strategy

### Validation Approach

Testing follows two phases:

1. **Exploratory** — write tests that exercise the broken paths on _unfixed_
   code and observe the failures. This confirms the root cause analysis.
2. **Fix + Preservation** — after applying the fix, verify that broken paths
   now pass and that all preserved behaviors remain unchanged.

---

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples demonstrating both bugs on unfixed code.
Confirm or refute the root cause analysis.

**Test Plan**: Mount `<Hero3D>` in a JSDOM/happy-dom test environment (or a
Playwright browser test), set `data-live="true"` on the section element to
simulate the post-WebGL state, and simulate clicks on floater link positions.
Separately, spy on `window.location.href` assignments triggered by simulated
`pointerdown` events on the canvas raycaster path.

**Test Cases**:

1. **Floater link unreachable (Path A)** — set `data-live="true"`, simulate a
   `pointerdown` at the coordinates of `books[0]`'s floater, assert the `<Link
   href>` is followed. Will fail on unfixed code (canvas intercepts event).

2. **Wrong URL from WebGL click (Path B)** — call `onBookClick` directly with a
   `SceneBook`-shaped object that has `id: 42` and `slug: "the-great-gatsby"`,
   assert `window.location.href` ends with `/books/the-great-gatsby`. Will fail
   on unfixed code (ends with `/books/42`).

3. **All four floaters unreachable** — repeat test 1 for `books[1..3]`. All
   will fail on unfixed code.

4. **Raycaster click at progress < 0.86** — simulate a `pointerdown` on the
   canvas when `progress = 0.5`; assert no navigation fires. Should pass on
   both unfixed and fixed code (guard condition).

**Expected Counterexamples**:

- `<Link>` `href` navigation is not triggered when the floater region is
  clicked — the canvas absorbs the event.
- `window.location.href` is set to `/{lang}/books/42` instead of
  `/{lang}/books/the-great-gatsby` when a WebGL book is clicked.

---

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed
code produces the correct navigation URL.

**Pseudocode:**

```
FOR ALL input WHERE isBugCondition(input) DO
  result := handleClick_fixed(input)
  ASSERT result.navigatedUrl ENDS WITH "/books/" + input.book.slug
END FOR
```

**Test Cases**:

1. **Floater click after fix** — set `data-live="true"`, click each of the four
   floater positions; assert each `<Link>` href resolves to the correct slug.
2. **WebGL click after fix** — call the fixed `onBookClick` with various
   `{ id, slug }` pairs; assert `href` always uses `slug`.

---

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the
fixed code behaves identically to the original.

**Pseudocode:**

```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT original_behavior(input) = fixed_behavior(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation
checking because:

- It automatically exercises many scroll-progress values, pointer positions,
  and screen sizes.
- It guards against subtle regressions (e.g., a z-index change accidentally
  blocking a different part of the UI).
- It provides stronger guarantees than a handful of hand-written example tests.

**Test Plan**: Capture current behavior for non-click interactions on unfixed
code, then write property tests asserting the same outcomes hold after the fix.

**Test Cases**:

1. **WebGL hover preservation** — generate random pointer positions over the
   canvas (outside floater bounding boxes) at `progress ∈ [0.86, 1]`; assert
   `canvas.style.cursor` toggles to `"pointer"` on raycaster hit and back to
   `"default"` on miss — same as before.
2. **Scroll animation preservation** — property test over `progress ∈ [0, 1]`;
   call `scene.setProgress(p)` and assert `bookGroup.visible`, `fieldGroup.visible`,
   and camera position match the values produced by the original code.
3. **Empty-region click preservation** — simulate `pointerdown` at canvas
   coordinates that are between floater books; assert the canvas receives and
   processes the event (raycaster runs, no navigation fires if no book is hit).
4. **Theme refresh preservation** — call `scene.refreshTheme()` before and
   after the fix; assert `moteMaterial.color` and `rim.color` are updated from
   CSS tokens.
5. **Reduced-motion preservation** — when `prefers-reduced-motion: reduce` is
   active, assert the canvas is hidden and no scene is created; the floater
   `<Link>` elements are also hidden. Fix must not change this.

---

### Unit Tests

- Test that `onBookClick` callback with a `HeroBook` argument produces a URL
  using `slug`, not `id`.
- Test that `onBookClick` falls back to `String(id)` when `slug` is absent.
- Test that `.hero3d__floater` links receive `click` events when the canvas is
  at `z-index: 1` and floaters are at `z-index: 2`.
- Test that pointer events on the canvas in the regions between floaters still
  reach the canvas (no unintended blocking).
- Test the guard condition: `onPointerDown` does nothing when
  `progress < 0.86`.

### Property-Based Tests

- **Property 1 (Fix Checking)**: For any `{ id: number, slug: string }` pair
  where `slug` is a non-empty string, the fixed `onBookClick` SHALL produce a
  URL containing `slug`, never `id`.
- **Property 2 (Preservation — hover)**: For any `(pointerX, pointerY)` ∈
  `[−1, 1]²` and `progress ∈ [0.86, 1.001]`, the hover state and cursor
  reported by the fixed scene MATCH those reported by the original scene.
- **Property 3 (Preservation — scroll)**: For any `progress ∈ [0, 1]`, the
  visibility flags and approximate positions of `bookGroup` and `fieldGroup`
  computed by the fixed scene MATCH those of the original scene.

### Integration Tests

- Full browser (Playwright) test: load the hero page, scroll to beat-0, click
  a floating book, assert navigation to `/{lang}/books/{slug}`.
- Full browser test: scroll to shelf phase (progress ≥ 0.86), click a WebGL
  field book via simulated `pointerdown`, assert navigation to
  `/{lang}/books/{slug}`.
- Full browser test: verify that hovering WebGL books shows a pointer cursor
  after the fix is applied.
- Full browser test: verify that the scroll animation plays correctly (beats
  0 → 1 → 2) without visual regression after the z-index change.
