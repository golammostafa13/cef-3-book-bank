# Implementation Plan

- [ ] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Hero 3D Book Click Does Not Navigate
  - **CRITICAL**: This test MUST FAIL on unfixed code — failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior — it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate clicking a 3D book fails to reach the correct detail page
  - **Scoped PBT Approach**: For deterministic bugs, scope the property to the concrete failing cases:
    - CSS bug: when `data-live="true"` is set on `.hero3d`, `.hero3d__floaters` drops to `z-index: 0`, placing it behind the canvas (`z-index: 1`), so all pointer events on floater `<Link>` elements are intercepted by the canvas
    - JavaScript bug: `onBookClick` navigates to `/${lang}/books/${book.id}` instead of `/${lang}/books/${book.slug}`, producing a broken URL for any book where `id !== slug`
  - Bug Condition 1 (CSS — floater z-index): `isBugCondition(state)` where `state` = hero is live (`data-live="true"`) AND user clicks on a floating book `<Link>` — the canvas overlay blocks the click
  - Bug Condition 2 (JS — wrong identifier): `isBugCondition(book)` where `book.slug !== String(book.id)` AND the WebGL raycasting `onBookClick` fires — navigation uses `book.id` and lands on a 404 or wrong page
  - Write a test that:
    1. Renders `<Hero3D>` in a live state (or mocks `data-live="true"`) and simulates a click on a `.hero3d__floater` link — assert the event is not blocked by the canvas
    2. Calls the `onBookClick` handler with a mock book where `slug !== String(id)` (e.g., `{ id: 42, slug: "the-great-gatsby" }`) and asserts `window.location.href` ends in `/books/the-great-gatsby`, not `/books/42`
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct — it proves both bugs exist)
  - Document counterexamples found (e.g., "click on floater link is swallowed by canvas; onBookClick navigates to /books/42 instead of /books/the-great-gatsby")
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2_

- [ ] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Non-Buggy Hero Interactions Remain Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs:
    - Observe: WebGL raycasting for books where `book.slug === String(book.id)` still resolves correctly — `onBookClick` happens to produce the right URL
    - Observe: Floater links below `lg` breakpoint are hidden by CSS (`display: none`) — no click-blocking issue to preserve
    - Observe: `prefers-reduced-motion` path hides floaters entirely — no regression surface there
    - Observe: The static (non-live) hero state has floaters at `z-index: 1` with a `display: none` canvas — clicks already work; raising floaters to `z-index: 2` must not break this
    - Observe: All other hero copy, buttons, stats, and beat panels remain pointer-interactive and receive focus correctly
  - Write property-based tests capturing these preservation invariants:
    1. For all books where `book.slug === String(book.id)`, `onBookClick` produces the same URL before and after the fix
    2. Floater links remain hidden on mobile (`< 1024px`), unaffected by z-index change
    3. `.hero3d__stage` (z-index: 2) and all interactive copy blocks retain pointer events and receive keyboard focus after the fix
    4. WebGL raycasting canvas pointer events are not disrupted — `pointer-events: none` on `.hero3d__floaters` is preserved; only `.hero3d__floater` elements have `pointer-events: auto`
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 3. Fix hero 3D book click navigation

  - [ ] 3.1 Raise `.hero3d__floaters` z-index above the canvas in `globals.css`
    - In `src/app/globals.css`, change the `@media (min-width: 1024px)` block for `.hero3d__floaters`:
      - Change `z-index: 1` to `z-index: 2`
    - Remove or override the rule `.hero3d[data-live="true"] .hero3d__floaters { z-index: 0; }` so the floater container is never pushed behind the canvas once the scene is live
    - The canvas stays at `z-index: 1`; the floater container moves to `z-index: 2`
    - `.hero3d__floaters` already has `pointer-events: none`, so the container itself does not block WebGL raycasting
    - Individual `.hero3d__floater` elements keep `pointer-events: auto`, so only the book shapes capture clicks
    - _Bug_Condition: isBugCondition(state) where data-live="true" AND floaters z-index ≤ canvas z-index_
    - _Expected_Behavior: floater links are clickable on desktop regardless of whether the scene is live_
    - _Preservation: canvas raycasting unaffected because floater container remains pointer-events: none_
    - _Requirements: 1.1, 2.1, 2.3_

  - [ ] 3.2 Fix `onBookClick` to navigate by slug in `hero-3d.tsx`
    - In `src/components/hero-3d.tsx`, locate the `onBookClick` callback inside the `useEffect`:
      ```ts
      onBookClick: (book) => {
        window.location.href = `/${lang}/books/${book.id}`;
      },
      ```
    - Replace with:
      ```ts
      onBookClick: (book) => {
        const slug = (book as HeroBook).slug ?? String(book.id);
        window.location.href = `/${lang}/books/${slug}`;
      },
      ```
    - The `HeroBook` type (already defined in this file) extends `SceneBook` with `slug: string`, so the cast is safe
    - The `?? String(book.id)` fallback preserves behavior for any book that somehow lacks a slug
    - _Bug_Condition: isBugCondition(book) where book.slug !== String(book.id)_
    - _Expected_Behavior: navigation goes to /${lang}/books/${book.slug}_
    - _Preservation: books where slug === String(id) still navigate correctly; fallback String(book.id) preserves old behavior for edge cases_
    - _Requirements: 1.2, 2.2_

  - [ ] 3.3 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Hero 3D Book Click Does Not Navigate
    - **IMPORTANT**: Re-run the SAME test from task 1 — do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms:
      1. Floater `<Link>` clicks are no longer blocked by the canvas in live mode
      2. `onBookClick` navigates to the slug-based URL for books where `slug !== String(id)`
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms both bugs are fixed)
    - _Requirements: 1.1, 1.2_

  - [ ] 3.4 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-Buggy Hero Interactions Remain Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all preserved invariants hold: correct slug fallback, mobile floater hiding intact, canvas raycasting unaffected, copy/beat panel interactions unchanged

- [ ] 4. Checkpoint — Ensure all tests pass
  - Run the full test suite and confirm all tests pass
  - Visually verify on a desktop viewport (`≥ 1024px`) that clicking a floating 3D book in the live hero navigates to the correct detail page URL (`/${lang}/books/${slug}`)
  - Confirm no pointer-events regression: WebGL raycasting still responds in the areas between floaters
  - Ask the user if questions arise
