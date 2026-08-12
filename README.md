# Cef 3 Book Bank — a free public digital library

A bilingual (বাংলা / English) book catalogue that anyone can read from or
download, plus a private admin for the one librarian who maintains it.

Built to the design in [`docs/choosen.webp`](docs/choosen.webp) and the
architecture in [`docs/Library_Platform_Brief.pdf`](docs/Library_Platform_Brief.pdf):
warm stone ground, near-black ink, a single hot orange, and books rendered as
physical objects rather than as cards with pictures on them.

```bash
npm install
cp .env.example .env.local   # then fill it in — see "Sign-in" below
npm run dev                  # http://localhost:3000 → /en/signin or /bn/signin
```

The bare domain opens the door rather than the library: `/` lands on sign-in,
which offers **Browse without signing in** — straight through to the shelves, no
account, nothing withheld.

## Languages

Both languages are first-class, and the language is part of the URL:

| | |
|---|---|
| `/en/books` | English catalogue |
| `/bn/books` | the same catalogue in Bengali |
| `/` | redirects to whichever the browser asks for (`Accept-Language`) |

Everything switches: interface strings, book and author names, category
descriptions, dates, and numerals (`40 books` → `৪০টি বই`, `194k downloads` →
`১.৯ লাখ ডাউনলোড`). The switch in the header is a plain link to the same page in
the other language, so it works without JavaScript and can be shared.

- **Interface strings** live in [`src/lib/i18n/dictionaries/`](src/lib/i18n/dictionaries/).
  English is the source of truth; `Dictionary` is derived from it, so a key that
  is missing from Bengali fails `tsc` rather than shipping an English sentence
  into a Bengali page. The files contain no code — interpolation is
  [`fill()`](src/lib/i18n/format.ts).
- **Catalogue content** picks its language in [`src/lib/i18n/content.ts`](src/lib/i18n/content.ts).
  The two sides are not symmetrical: every book has an English title, only
  Bengali books have a Bengali one, so a Bengali page naming a book *Cosmos* is
  correct rather than a gap.
- **Adding a third language** means: add it to `locales`, add a dictionary file,
  and fill in the Bengali-equivalent fields on the data. No page changes.

## Sign-in

Two separate questions, deliberately:

**Signing in** is open. Anyone with a Google account can, in one step: Google
returns an ID token, it is verified server-side against Google's published keys
([`src/lib/auth/google.ts`](src/lib/auth/google.ts)), and the verified address
becomes the session. No allowlist, no second factor, nothing to be approved for.
Nobody has to sign in at all — reading and downloading never ask.

**Administering** is a short list of addresses. `ADMIN_EMAILS` — one or more,
comma-separated — is compared against the signed-in address every time it
matters ([`isAdminEmail`](src/lib/auth/config.ts)) — that is the whole
authorisation model. No users table, no roles to assign, no invitations to
revoke; editing the variable moves the admin, and it takes effect on the next
request rather than when an eight-hour cookie expires. That is also why there is no `role` in
the token: a claim stamped into a session outlives the decision that granted it.

The admin account shows as `cef-3-book-bank` wherever it appears — a constant in
[`src/lib/auth/username.ts`](src/lib/auth/username.ts), not a setting. Everyone
else shows the name they signed in with.

Set up in [`.env.example`](.env.example): a Google **Web application** client id
(no secret and no redirect URI needed — this uses Google Identity Services),
`ADMIN_EMAILS`, and an `AUTH_SECRET` for signing the session cookie.

Without a client id, and only outside production, `/[lang]/signin` accepts an
address directly so a fresh clone can sign in. What it cannot do is *prove* the
address belongs to whoever typed it, which is why the branch is compiled out of
a production build.

The guard is layered: [`src/proxy.ts`](src/proxy.ts) keeps everyone who is not
the administrator off admin screens, and every Server Action calls
`requireAdmin()` itself, because a POST never passes through a page. A signed-in
reader who asks for `/admin` is sent to the catalogue rather than to a sign-in
form they have already used.

## How it is put together

| | |
|---|---|
| [`src/lib/data/books.ts`](src/lib/data/books.ts) | the only seam between pages and the catalogue store. Swapping the fixtures for Postgres changes this file and nothing else. |
| [`src/lib/actions/`](src/lib/actions/) | Server Actions — the only writes. Zod-validated, session-checked, narrowly revalidated. |
| [`src/components/book-3d.tsx`](src/components/book-3d.tsx) | a book as five faces of a bound volume: board, spine, fore-edge, head, tail. Pure CSS transforms, no WebGL, no library. |
| [`src/components/shelf-3d.tsx`](src/components/shelf-3d.tsx) | a collection as a row of spines on a plank — spine width tracks page count. |
| [`src/components/book-stack-3d.tsx`](src/components/book-stack-3d.tsx) | the hero: a pile of volumes on a table, seen from above. |
| [`src/lib/cover-theme.ts`](src/lib/cover-theme.ts) | eight hand-mixed cover schemes. Covers are drawn, never uploaded, and can never land outside the palette. |
| [`src/app/globals.css`](src/app/globals.css) | design tokens, the 3D geometry, and one kill-switch that disables every transform under `prefers-reduced-motion`. |

Almost every page is prerendered — 229 static documents across both languages —
which is what lets the whole catalogue be served from cache. The exceptions are
the filtered catalogue, the search page and everything under `/admin`, which are
dynamic by design.

## Scripts

```bash
npm run dev     # dev server
npm run build   # production build; also typechecks
npm run lint    # eslint
node probe.mjs <url> [screenshot.png] [waitMs]   # headless-Chrome smoke test
```

## Not done yet

- Books are held in memory ([`src/lib/fixtures/catalogue.ts`](src/lib/fixtures/catalogue.ts)),
  so admin edits last until the server restarts. The brief's plan is Postgres for
  metadata and R2 for files, with uploads presigned straight to R2.
- The contact form validates but posts nowhere.
- The CSP in [`next.config.ts`](next.config.ts) still needs `'unsafe-inline'` for
  scripts; the note there explains how to remove it at the edge.
