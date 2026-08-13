import type { Locale } from "@/lib/i18n/config";
import { bookTitle, textClass } from "@/lib/i18n/content";
import { cn } from "@/lib/utils";
import type { Book } from "@/types";

/**
 * ReadingScene — the illustration beside the sign-in card.
 *
 * A hand-drawn reader sitting on a pile of the library's own books, with a
 * pencil leaning on the stack, a tea going cold and a tree behind. It is line
 * art in the page's ink over flat colour, which is why it survives the dark
 * theme without a second drawing: every stroke, every paper fill and the two
 * background glows are tokens, and only the objects that would be coloured in
 * real life — book cloth, sweater, leaves, pencil — carry fixed hex.
 *
 * The spines carry real titles, taken from the same featured set the
 * catalogue shows. The door is then drawn from the building rather than from
 * stock art: sign in on a Tuesday and the pile has changed.
 *
 * Colour here runs wider than `cover-theme.ts` allows a *cover* to run — teal,
 * plum, terracotta, ochre. That is deliberate and contained: this is one
 * illustration on one page, not a generator. The four objects that echo the
 * brand — the spectacles, the ribbon marker, the bookmark, one book's cloth —
 * are the brand green itself, so the drawing reads as a corner of the library
 * rather than a sticker from another design. Everything else is coloured the
 * way the thing is coloured in life, which is why the light pooling behind the
 * reader stays warm: sunlight is warm even in a green scene.
 *
 * Motion is four CSS animations in globals.css (`.rscene__*`), all of them
 * transform/opacity only and all of them returning to the pose they start in —
 * so the reduced-motion kill-switch, which collapses every duration to nothing,
 * leaves the scene standing exactly as drawn.
 */

type BookLike = Pick<Book, "id" | "title" | "titleBn">;

/** Book cloth. `ink` is the title colour, chosen for contrast on `cover`. */
const cloth = [
  { cover: "#c2451a", edge: "#f6ead8", ink: "#fff1e6" }, // terracotta
  { cover: "#e3a52b", edge: "#fdf5e2", ink: "#3d2a06" }, // ochre
  { cover: "#2f8b86", edge: "#eef6f2", ink: "#e9faf6" }, // teal
  { cover: "#b93a72", edge: "#fbeef4", ink: "#fff0f6" }, // plum
  { cover: "#047857", edge: "#e0f1e9", ink: "#e6f5ee" }, // the accent itself
] as const;

/**
 * The pile. Bottom volume first and widest — a stack reads as stable only if
 * the biggest book is carrying the rest. Tilts are hand-set, never random, so
 * the server and the client draw the same pile.
 *
 * `face` is which side of the volume happens to be turned to us: a spine (long
 * band, title printed along it) or the fore-edge (the cream page block between
 * two boards). Mixing the two is what stops the pile looking machine-stacked.
 */
const shelf = [
  { x: 92, y: 370, w: 254, h: 34, tilt: -1.2, face: "spine" },
  { x: 102, y: 338, w: 236, h: 32, tilt: 1.4, face: "spine" },
  { x: 88, y: 306, w: 250, h: 32, tilt: -1.8, face: "spine" },
  { x: 110, y: 276, w: 216, h: 30, tilt: 1.1, face: "pages" },
  { x: 98, y: 248, w: 232, h: 28, tilt: -0.8, face: "pages" },
] as const;

/**
 * Titles sit on the three lower spines and are set from the left, the way a
 * spine is actually imprinted. Both facts are load-bearing: the reader and
 * their dangling feet occupy the top of the pile and its right-hand side, so
 * anything printed there would be read through a leg.
 *
 * ~7px per glyph at this size, over a little over half the board.
 */
function fit(text: string, width: number) {
  const max = Math.max(6, Math.floor((width * 0.56 - 20) / 7));
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

/** Four-pointed star, the one shape that says "this is a nice place to be". */
function Sparkle({
  x,
  y,
  scale = 1,
  fill,
  delay = 0,
}: {
  x: number;
  y: number;
  scale?: number;
  fill: string;
  delay?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path
        className="rscene__twinkle"
        style={{ animationDelay: `${delay}s` }}
        d="M0-10C1.6-3.4 3.4-1.6 10 0 3.4 1.6 1.6 3.4 0 10-1.6 3.4-3.4 1.6-10 0-3.4-1.6-1.6-3.4 0-10Z"
        fill={fill}
        stroke="none"
      />
    </g>
  );
}

export function ReadingScene({
  books,
  lang,
  label,
  className,
}: {
  books: BookLike[];
  lang: Locale;
  /** Localised description — the drawing carries meaning, so it is not decorative. */
  label: string;
  className?: string;
}) {
  const bn = textClass(lang);

  return (
    <svg
      viewBox="0 0 560 470"
      role="img"
      aria-label={label}
      className={cn("rscene w-full", className)}
    >
      <defs>
        {/* The two pools of colour the whole drawing sits in. Warm behind the
            reader, cool behind the tree, so the composition has a near side
            and a far side without anything being drawn twice. */}
        <radialGradient id="rs-warm" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff6b2c" stopOpacity="0.3" />
          <stop offset="60%" stopColor="#ff8a3d" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#ff8a3d" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="rs-cool" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2f8b86" stopOpacity="0.26" />
          <stop offset="100%" stopColor="#2f8b86" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="rs-rose" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e0347a" stopOpacity="0.13" />
          <stop offset="100%" stopColor="#e0347a" stopOpacity="0" />
        </radialGradient>
        {/* Ground shade. A gradient rather than a blur filter: same look, and
            no filter region to rasterise on every paint. */}
        <radialGradient id="rs-shade" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3d2d20" stopOpacity="0.34" />
          <stop offset="55%" stopColor="#3d2d20" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#3d2d20" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ---- Ground the scene stands in ---------------------------------- */}
      <ellipse cx="212" cy="228" rx="200" ry="186" fill="url(#rs-warm)" />
      <ellipse cx="452" cy="268" rx="132" ry="146" fill="url(#rs-cool)" />
      <ellipse cx="368" cy="126" rx="118" ry="104" fill="url(#rs-rose)" />

      <g className="rscene__ink" strokeLinecap="round" strokeLinejoin="round">
        {/* ---- Floor ---------------------------------------------------- */}
        <ellipse cx="222" cy="406" rx="158" ry="13" fill="url(#rs-shade)" />
        <path d="M28 404H532" strokeWidth="2.5" opacity="0.32" fill="none" />
        <path d="M58 415h46" strokeWidth="2.5" opacity="0.16" fill="none" />
        <path d="M424 417h62" strokeWidth="2.5" opacity="0.16" fill="none" />

        {/* Grass, so the ground line has something growing out of it. */}
        <g strokeWidth="2.5" fill="none" stroke="#5c9e4f">
          <path d="M40 404c1-9-2-14-6-18" />
          <path d="M48 404c0-12 3-18 8-22" />
          <path d="M56 404c2-8 6-11 11-12" />
        </g>

        {/* ---- The tree ------------------------------------------------- */}
        <g className="rscene__sway">
          <path
            d="M486 404c-3-56 2-104 4-152 3-40 0-72 4-100"
            strokeWidth="5.5"
            fill="none"
          />
          <g strokeWidth="3" fill="none">
            <path d="M488 332c-18-10-26-24-30-38" />
            <path d="M489 300c17-8 25-20 29-34" />
            <path d="M491 262c-15-8-21-20-23-34" />
            <path d="M493 226c13-8 19-18 21-32" />
            <path d="M494 176c-9-6-13-14-14-24" />
          </g>
          <g strokeWidth="0">
            <ellipse cx="456" cy="292" rx="9" ry="6" fill="#5c9e4f" transform="rotate(-32 456 292)" />
            <ellipse cx="470" cy="308" rx="8" ry="5.5" fill="#7fb96a" transform="rotate(-24 470 308)" />
            <ellipse cx="520" cy="264" rx="9" ry="6" fill="#2f8b86" transform="rotate(28 520 264)" />
            <ellipse cx="506" cy="280" rx="8" ry="5.5" fill="#5c9e4f" transform="rotate(22 506 280)" />
            <ellipse cx="466" cy="226" rx="8.5" ry="5.5" fill="#7fb96a" transform="rotate(-30 466 226)" />
            <ellipse cx="480" cy="242" rx="7.5" ry="5" fill="#5c9e4f" transform="rotate(-22 480 242)" />
            <ellipse cx="516" cy="192" rx="8.5" ry="5.5" fill="#2f8b86" transform="rotate(30 516 192)" />
            <ellipse cx="502" cy="208" rx="7.5" ry="5" fill="#7fb96a" transform="rotate(24 502 208)" />
            <ellipse cx="478" cy="150" rx="7" ry="4.5" fill="#5c9e4f" transform="rotate(-34 478 150)" />
            <ellipse cx="494" cy="128" rx="7" ry="4.5" fill="#7fb96a" transform="rotate(-8 494 128)" />
            <ellipse cx="508" cy="140" rx="6.5" ry="4.5" fill="#2f8b86" transform="rotate(26 508 140)" />
            {/* Two blossoms, because a library should look like spring. */}
            <circle cx="462" cy="270" r="4.5" fill="#e0347a" opacity="0.85" />
            <circle cx="512" cy="228" r="4" fill="#ff8a3d" opacity="0.9" />
          </g>
        </g>

        {/* ---- The pile -------------------------------------------------- */}
        {shelf.map((b, i) => {
          const c = cloth[i];
          const cx = b.x + b.w / 2;
          const cy = b.y + b.h / 2;
          const title = books[i] ? fit(bookTitle(books[i], lang), b.w) : "";

          return (
            <g key={books[i]?.id ?? i} transform={`rotate(${b.tilt} ${cx} ${cy})`}>
              <rect
                x={b.x}
                y={b.y}
                width={b.w}
                height={b.h}
                rx="4"
                fill={c.cover}
                strokeWidth="1.6"
              />

              {b.face === "spine" ? (
                <>
                  {/* Raised bands, as on a cased binding — the detail that
                      makes a coloured rectangle read as a bound volume. */}
                  <rect x={b.x + 13} y={b.y + 3} width="2.5" height={b.h - 6} fill="#000" opacity="0.18" />
                  <rect x={b.x + b.w - 16} y={b.y + 3} width="2.5" height={b.h - 6} fill="#000" opacity="0.18" />
                  <rect x={b.x + 3} y={b.y + 2} width={b.w - 6} height="2.5" rx="1.25" fill="#fff" opacity="0.24" />
                  {title ? (
                    <text
                      x={b.x + 22}
                      y={cy + 4.5}
                      fontSize="12.5"
                      fontWeight="700"
                      letterSpacing="0.01em"
                      fill={c.ink}
                      className={bn}
                    >
                      {title}
                    </text>
                  ) : null}
                  {/* The publisher's device at the tail of the spine — what
                      fills the space a title never reaches. */}
                  <circle cx={b.x + b.w - 30} cy={cy} r="3" fill={c.ink} opacity="0.55" />
                  <circle cx={b.x + b.w - 22} cy={cy} r="3" fill={c.ink} opacity="0.35" />
                </>
              ) : (
                <>
                  {/* Fore-edge: the page block between two boards. */}
                  <rect x={b.x + 4} y={b.y + 5} width={b.w - 8} height={b.h - 10} rx="1.5" fill={c.edge} />
                  <g stroke="#000" opacity="0.14" strokeWidth="1.2" fill="none">
                    <path d={`M${b.x + 10} ${b.y + 11}H${b.x + b.w - 10}`} />
                    <path d={`M${b.x + 10} ${b.y + 16}H${b.x + b.w - 10}`} />
                    <path d={`M${b.x + 10} ${b.y + 21}H${b.x + b.w - 10}`} />
                  </g>
                </>
              )}

              {/* The shade the volume above drops onto this one. */}
              <rect x={b.x + 2} y={b.y} width={b.w - 4} height="3.5" fill="#000" opacity="0.14" />
            </g>
          );
        })}

        {/* Ribbon marker — the brand green, draped over three volumes so the
            stack reads as one object rather than five. */}
        <path
          d="M298 306v78l-7-8-7 8v-78Z"
          fill="#047857"
          stroke="#000"
          strokeOpacity="0.12"
          strokeWidth="1"
        />

        {/* ---- Pencil, leaning on the pile -------------------------------- */}
        <g transform="translate(52 396) rotate(-67)">
          <g className="rscene__lean">
            <path d="M0 0 8-3.6V3.6Z" fill="#3b3b42" />
            <path d="M0 0 22-10v20Z" fill="#f0d3a8" strokeWidth="1.6" />
            <rect x="22" y="-10" width="90" height="20" fill="#f2b429" strokeWidth="1.6" />
            <rect x="22" y="3" width="90" height="7" fill="#000" opacity="0.12" />
            <rect x="22" y="-10" width="90" height="5" fill="#fff" opacity="0.22" />
            <rect x="112" y="-10" width="15" height="20" fill="#b9bcc4" strokeWidth="1.6" />
            <rect x="117" y="-10" width="1.5" height="20" fill="#000" opacity="0.18" />
            <rect x="122" y="-10" width="1.5" height="20" fill="#000" opacity="0.18" />
            <path d="M127-10h7a7 7 0 0 1 7 7v6a7 7 0 0 1-7 7h-7Z" fill="#ef7d9d" strokeWidth="1.6" />
          </g>
        </g>

        {/* ---- The reader ------------------------------------------------- */}
        <g className="rscene__breathe">
          {/* Seat contact — without it the figure floats above the boards. */}
          <ellipse cx="204" cy="250" rx="42" ry="6" fill="#000" opacity="0.13" />

          {/* Far leg, drawn first so the near one overlaps it. Each limb is
              one path stroked twice — ink underneath, cloth on top — which is
              how a tube gets an outline without authoring its silhouette. */}
          <path d="M192 244c30 0 50 8 52 22 2 16 4 30 4 44" strokeWidth="21" fill="none" />
          <path d="M192 244c30 0 50 8 52 22 2 16 4 30 4 44" strokeWidth="15" stroke="#4a3550" fill="none" />
          <ellipse cx="260" cy="313" rx="13" ry="7.5" fill="#e8551a" strokeWidth="2.5" transform="rotate(-8 260 313)" />

          {/* Neck, then the sweater. */}
          <path d="M206 188l4-20" strokeWidth="18" fill="none" />
          <path d="M206 188l4-20" strokeWidth="12.5" className="rscene__paper-s" fill="none" />
          <path
            d="M176 250c-8-24-4-50 10-60 10-7 28-8 36 0 10 10 14 36 8 60-20 8-36 8-54 0Z"
            fill="#2f8b86"
            strokeWidth="3"
          />
          {/* Collar and a sweater seam: two lines that turn a blob into a jumper. */}
          <path d="M192 190c8 7 20 7 28 0" strokeWidth="2.5" fill="none" opacity="0.7" />
          <path d="M182 236c14 5 30 5 42 0" strokeWidth="2.5" fill="none" opacity="0.45" />

          {/* Head: bun behind, face, then the hair laid over the crown.
              Every feature is kept a clear margin inside the circle — a mouth
              that touches the outline stops being a mouth and becomes a beak. */}
          <circle cx="186" cy="142" r="12" fill="currentColor" />
          <circle cx="214" cy="150" r="27" className="rscene__paper" strokeWidth="3" />
          <circle cx="234" cy="161" r="4" fill="#ff8a3d" opacity="0.35" />
          <circle cx="226" cy="151" r="2.8" fill="currentColor" />
          <circle cx="205" cy="152" r="2.6" fill="currentColor" />
          <path d="M212 166q5 4 10-2" strokeWidth="2.5" fill="none" />
          {/* Spectacles — the accent, worn. Two lenses, the far one smaller:
              the head is turned, and a single lens reads as a monocle. */}
          <circle cx="226" cy="151" r="8.5" fill="none" stroke="#047857" strokeWidth="2.4" />
          <circle cx="205" cy="152" r="7.5" fill="none" stroke="#047857" strokeWidth="2.4" />
          <path d="M217.5 150h-4.5" stroke="#047857" strokeWidth="2.4" fill="none" />
          <path d="M188 158c-4-30 16-42 38-36 13 4 17 17 15 28" strokeWidth="13" fill="none" />

          {/* Far arm, propped on the boards. One hand holds the book, the
              other carries the lean — a figure with both hands on the book
              reads as posed rather than as someone who sat down to read. */}
          <path d="M194 198c-9 16-9 32-6 44" strokeWidth="17" fill="none" />
          <path d="M194 198c-9 16-9 32-6 44" strokeWidth="11" stroke="#2f8b86" fill="none" />
          <circle cx="187" cy="246" r="7" className="rscene__paper" strokeWidth="2.5" />

          {/* Near arm, holding the book up. */}
          <path d="M220 196c10 16 14 28 18 36" strokeWidth="17" fill="none" />
          <path d="M220 196c10 16 14 28 18 36" strokeWidth="11" stroke="#2f8b86" fill="none" />

          {/* The open book. Drawn front-on inside a tilted frame: an open book
              seen truly edge-on is two lines, and reads as nothing at all. */}
          <g transform="translate(252 208) rotate(-12) scale(0.82)">
            <path d="M0 10c-14-10-30-12-46-8v28c16-4 32-2 46 8Z" fill="#c2451a" />
            <path d="M0 10c14-10 30-12 46-8v28c-16-4-32-2-46 8Z" fill="#b93a72" />
            <path d="M0 4c-14-10-30-12-44-8v26c14-4 30-2 44 8Z" className="rscene__paper" strokeWidth="2.5" />
            <path d="M0 4c14-10 30-12 44-8v26c-14-4-30-2-44 8Z" className="rscene__paper" strokeWidth="2.5" />
            <g strokeWidth="2" opacity="0.3" fill="none">
              <path d="M-34 2h20" />
              <path d="M-34 10h22" />
              <path d="M14 2h20" />
              <path d="M12 10h22" />
            </g>
          </g>
          <path d="M272 228v20l-4.5-5-4.5 5v-20Z" fill="#047857" />
          <circle cx="238" cy="234" r="7" className="rscene__paper" strokeWidth="2.5" />

          {/* Near leg. */}
          <path d="M204 247c32 0 54 10 56 26 2 18 4 32 4 46" strokeWidth="21" fill="none" />
          <path d="M204 247c32 0 54 10 56 26 2 18 4 32 4 46" strokeWidth="15" stroke="#5c4267" fill="none" />
          <ellipse cx="276" cy="321" rx="13" ry="7.5" fill="#ff6b2c" strokeWidth="2.5" transform="rotate(-8 276 321)" />
        </g>

        {/* ---- Tea, going cold -------------------------------------------- */}
        <g>
          <path d="M354 372h34l-4 30h-26Z" fill="#2f8b86" strokeWidth="2.5" />
          <path d="M356 379h30" strokeWidth="2" opacity="0.35" fill="none" />
          <path d="M388 378c11 0 11 14 0 14" strokeWidth="3" fill="none" />
          <g className="rscene__float rscene__float--slow" strokeWidth="2.5" opacity="0.4" fill="none">
            <path d="M362 364c4-6-4-9 0-15" />
            <path d="M375 362c4-6-4-9 0-15" />
          </g>
        </g>

        {/* A page that got away. */}
        <g transform="rotate(7 424 392)">
          <rect x="404" y="378" width="42" height="28" rx="2" className="rscene__paper" strokeWidth="2.5" />
          <g strokeWidth="1.8" opacity="0.3" fill="none">
            <path d="M410 386h30" />
            <path d="M410 392h30" />
            <path d="M410 398h20" />
          </g>
        </g>

        {/* ---- A book that took off ---------------------------------------- */}
        <g className="rscene__float">
          <g className="rscene__hoverlift">
            <g transform="translate(400 132) rotate(14) scale(0.62)">
              <path d="M0 10c-14-10-30-12-46-8v28c16-4 32-2 46 8Z" fill="#e3a52b" />
              <path d="M0 10c14-10 30-12 46-8v28c-16-4-32-2-46 8Z" fill="#ff6b2c" />
              <path d="M0 4c-14-10-30-12-44-8v26c14-4 30-2 44 8Z" className="rscene__paper" strokeWidth="3" />
              <path d="M0 4c14-10 30-12 44-8v26c-14-4-30-2-44 8Z" className="rscene__paper" strokeWidth="3" />
            </g>
            {/* Motion arcs: the object is going somewhere. */}
            <g strokeWidth="2.5" opacity="0.4" fill="none">
              <path d="M348 150c-8 6-12 14-12 22" />
              <path d="M338 140c-12 8-18 20-18 32" />
            </g>
          </g>
        </g>

        {/* ---- Sparkles ---------------------------------------------------- */}
        <Sparkle x={146} y={122} scale={1.15} fill="#ff6b2c" />
        <Sparkle x={326} y={88} scale={0.85} fill="#e0347a" delay={-1.4} />
        <Sparkle x={96} y={208} scale={0.7} fill="#2f8b86" delay={-2.6} />
        <Sparkle x={438} y={332} scale={0.8} fill="#e3a52b" delay={-0.8} />
        <Sparkle x={318} y={188} scale={0.55} fill="#ff8a3d" delay={-2} />
      </g>
    </svg>
  );
}
