/**
 * Cover colour system.
 *
 * The reference design (docs/choosen.webp) is a three-colour world: warm
 * stone ground, near-black ink, one hot orange. A cover generator that reads
 * `coverHue` straight out of the data produces full-spectrum candy covers —
 * mint, magenta, violet — which is the fastest way to break that world.
 *
 * So `coverHue` stops being a hue and becomes a *seed*: it selects one of a
 * small set of hand-mixed schemes, every one of them sampled from the
 * reference's own palette. The data layer is untouched, the catalogue still
 * looks varied, and no cover can ever land outside the design.
 *
 * Schemes are picked deterministically — no Math.random anywhere — so server
 * and client renders always agree.
 */

export interface CoverTheme {
  /** Shown in the admin's cover picker. */
  name: string;
  /** Cover stock. The dominant area of the face. */
  paper: string;
  /** Type colour on `paper`. Always ≥ 7:1 against it. */
  ink: string;
  /** Mid tone for bands, discs and rules. */
  mid: string;
  /** Deepest tone — panels, borders, the darker half of a split cover. */
  deep: string;
  /** Spine stock. Reads as the same bound object as the face. */
  spine: string;
  /** Type colour on `spine` / on `deep` fields. */
  spineInk: string;
  /** True when the scheme is dark-on-light; drives type inversion. */
  light: boolean;
}

/**
 * Eight schemes. Two are the reference itself (bone + ink, bone + orange);
 * the rest are warm neighbours — clay, ochre, olive, oxblood — plus one
 * desaturated slate so a shelf of them has some cool relief.
 */
const themes: readonly CoverTheme[] = [
  // Bone stock, ink type, orange rule. The reference, verbatim.
  {
    name: "Bone & ink",
    paper: "#efe9e0",
    ink: "#16130f",
    mid: "#ff6b2c",
    deep: "#1c1815",
    spine: "#1c1815",
    spineInk: "#f2ede4",
    light: true,
  },
  // Charcoal cover, bone type. The inverse — anchors a grid visually.
  {
    name: "Charcoal",
    paper: "#1e1a16",
    ink: "#f3ece1",
    mid: "#ff6b2c",
    deep: "#0f0d0b",
    spine: "#0f0d0b",
    spineInk: "#f3ece1",
    light: false,
  },
  // Terracotta — the accent used as a field rather than a detail.
  {
    name: "Terracotta",
    paper: "#e8d9cc",
    ink: "#43210f",
    mid: "#c2481a",
    deep: "#7a2f10",
    spine: "#7a2f10",
    spineInk: "#f6e6da",
    light: true,
  },
  // Clay / warm brown, the bound-cloth look.
  {
    name: "Clay",
    paper: "#e3d6c4",
    ink: "#2f2415",
    mid: "#a97b45",
    deep: "#5c421f",
    spine: "#5c421f",
    spineInk: "#f0e4d1",
    light: true,
  },
  // Ochre — the brightest stock in the set.
  {
    name: "Ochre",
    paper: "#eadfc3",
    ink: "#33290f",
    mid: "#c79a33",
    deep: "#6d5312",
    spine: "#6d5312",
    spineInk: "#f4ecd6",
    light: true,
  },
  // Olive, heavily desaturated so it stays in the warm family.
  {
    name: "Olive",
    paper: "#dfdfcf",
    ink: "#22261a",
    mid: "#7c8560",
    deep: "#3d4530",
    spine: "#3d4530",
    spineInk: "#eceedd",
    light: true,
  },
  // Oxblood — deep, near-ink, for the heavier titles.
  {
    name: "Oxblood",
    paper: "#e6d4d0",
    ink: "#3a1614",
    mid: "#9c3b34",
    deep: "#5c1d18",
    spine: "#5c1d18",
    spineInk: "#f4e2de",
    light: true,
  },
  // Warm slate. The one cool scheme; kept low-chroma.
  {
    name: "Slate",
    paper: "#d8dade",
    ink: "#1b2027",
    mid: "#5f7183",
    deep: "#2f3a45",
    spine: "#2f3a45",
    spineInk: "#e7eaee",
    light: true,
  },
];

/** Stable 32-bit hash. Same string in, same layout out, forever. */
function hashOf(seed: string): number {
  let h = 2166136261;
  for (const char of seed) {
    h ^= char.codePointAt(0) ?? 0;
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** All eight schemes, in picker order. */
export const coverSchemes = themes;

const BUCKET = 360 / themes.length;

/**
 * Hue → scheme, in even buckets around the wheel.
 *
 * Deriving the scheme from the hue alone (rather than mixing in the book id)
 * is what makes it *choosable*: the admin's cover picker writes back a hue and
 * gets exactly the scheme it showed. Seed data spread across the wheel still
 * lands on a varied set of schemes.
 */
export function schemeIndexOf(coverHue: number): number {
  const hue = ((coverHue % 360) + 360) % 360;
  return Math.min(themes.length - 1, Math.floor(hue / BUCKET));
}

/** The hue to store for a chosen scheme — the centre of its bucket. */
export function hueForScheme(index: number): number {
  const i = ((index % themes.length) + themes.length) % themes.length;
  return Math.round(i * BUCKET + BUCKET / 2);
}

export function coverTheme(book: { coverHue: number }): CoverTheme {
  return themes[schemeIndexOf(book.coverHue)];
}

/** Cover layout variant, 0–4. Kept separate so art and colour vary apart. */
export function coverVariant(book: { id: string }): number {
  return (hashOf(`${book.id}:layout`) >>> 3) % 5;
}

/**
 * Warm two-tone pair for non-book chrome: author avatars, category glyphs,
 * admin table markers. Same restricted world as the covers, so an avatar
 * grid can never turn into a pastel rainbow.
 */
const marks: readonly { bg: string; fg: string }[] = [
  { bg: "#e4d9cb", fg: "#5c421f" },
  { bg: "#e8d5c9", fg: "#7a2f10" },
  { bg: "#e6dfc7", fg: "#6d5312" },
  { bg: "#dee0d0", fg: "#3d4530" },
  { bg: "#e7d6d2", fg: "#5c1d18" },
  { bg: "#dadde1", fg: "#2f3a45" },
  { bg: "#e2ddd6", fg: "#26211c" },
];

export function markTheme(seed: string): { bg: string; fg: string } {
  return marks[hashOf(seed) % marks.length];
}
