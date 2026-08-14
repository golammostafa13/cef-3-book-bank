import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * The wordmark: the book mark in a gradient tile, then the name in two tones.
 *
 * One component for every place the name appears — header, footer, sign-in,
 * admin rail — because a mark that is re-typed at each call site drifts. The
 * gradients live in globals.css (`.brand-mark`, `.brand-grad`) so both halves
 * of the lockup pull from the same three tokens and stay in step through the
 * light/dark swap.
 */

/**
 * `md` — the header lockup — sets its name fluidly rather than at a fixed size.
 * The wordmark is `whitespace-nowrap` and sits in a bar that also has to hold
 * the language switch and three round controls; at a flat 1.2rem it is 177px
 * wide, which on a 360px phone pushed the menu button clean off the screen.
 * The clamp gives back ~27px there and is already at full size by ~440px, so
 * every viewport that has the room is unchanged.
 */
const sizes = {
  sm: { tile: "size-8 rounded-[9px]", text: "text-[1.05rem]" },
  md: {
    tile: "size-9 rounded-[10px]",
    text: "text-[clamp(1rem,4.4vw,1.2rem)]",
  },
  lg: { tile: "size-11 rounded-xl", text: "text-[1.5rem]" },
} as const;

/**
 * The mark itself, as geometry rather than as an image: an open book with three
 * page-leaves fanning up out of the gutter.
 *
 * The three leaves are the same three the old mark drew as flat bars — the "3"
 * of Cef 3 — but grown out of a book they now sit in, so the tile says
 * "library" at 16px instead of relying on the wordmark beside it to say it. The
 * staggered opacities are kept: identical leaves read as a fan blade, and the
 * ramp is what makes them read as separate pages caught mid-turn.
 *
 * Every path is white on the tile's own gradient, so this one drawing serves
 * light mode, dark mode, the favicon and the touch icon without a second copy.
 * The art is authored with its own padding inside a 48-unit box, which is why
 * it can be dropped in at any size without a wrapper doing the insetting.
 */
export function BrandArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <g transform="translate(24 24.4) scale(0.9) translate(-24 -25)">
        {/* The two page blocks. Both the top and the bottom edge fall from the
            outer corner into the gutter, which is the whole reason a filled
            shape reads as a board seen slightly from above rather than as a
            rectangle. The channel down the middle is left unpainted — the tile
            shows through it as the gutter. */}
        <path
          d="M22.7 26c-1.8-2.6-4.8-4.2-8.2-4.2H9C7.9 21.8 7 22.7 7 23.8v11.8c0 1.1.9 2 2 2h5.6c3.4 0 6.4 1.6 8.2 4.2z"
          fill="#fff"
          fillOpacity="0.96"
        />
        <path
          d="M25.3 26c1.8-2.6 4.8-4.2 8.2-4.2H39c1.1 0 2 .9 2 2v11.8c0 1.1-.9 2-2 2h-5.6c-3.4 0-6.4 1.6-8.2 4.2z"
          fill="#fff"
          fillOpacity="0.96"
        />

        {/* The sprig. The middle leaf runs down through the gutter and is the
            stem the other two hang off; they alternate up it rather than
            radiating from one point, which is what stops the three reading as
            a fan blade. Tips point up and out, so the silhouette still has
            three clear points once it is 16px of a browser tab. */}
        <g transform="translate(24 25.6)">
          <path
            d="M0 0c-1.5-5.5-5.5-9.5-10.5-11-.3 5.5 3.5 10.2 10.5 11z"
            transform="translate(0 -3.4)"
            fill="#fff"
            fillOpacity="0.92"
          />
          <path
            d="M0 0c-3.1-5.5-2.4-12.6 0-16.2 2.4 3.6 3.1 10.7 0 16.2z"
            fill="#fff"
          />
          <path
            d="M0 0c1.5-5.5 5.5-9.5 10.5-11 .3 5.5-3.5 10.2-10.5 11z"
            transform="translate(0 -5.2)"
            fill="#fff"
            fillOpacity="0.8"
          />
        </g>
      </g>
    </svg>
  );
}

export function BrandMark({
  size = "md",
  className,
}: {
  size?: keyof typeof sizes;
  className?: string;
}) {
  const s = sizes[size];
  return (
    <span
      className={cn(
        "brand-mark relative inline-flex shrink-0 items-center justify-center",
        s.tile,
        className,
      )}
    >
      {/* Full-bleed: the art carries its own margin inside the 48-unit box, so
          the tile needs no padding of its own to sit it correctly. */}
      <BrandArt className="size-full" />
    </span>
  );
}

/**
 * The full lockup. `as` lets a footer render it as a heading and a header
 * render it inside its own link without nesting interactive elements.
 */
export function Brand({
  size = "md",
  className,
  markOnly = false,
}: {
  size?: keyof typeof sizes;
  className?: string;
  /** For the admin rail, where there is only room for the tile. */
  markOnly?: boolean;
}) {
  const s = sizes[size];

  if (markOnly) return <BrandMark size={size} className={className} />;

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <BrandMark size={size} />
      {/* One gradient across the whole name, not just the first word: over
          three syllables it actually travels, which is the point of it.
          Latin-only — the mark is the name, and a name is not translated. */}
      <span
        className={cn(
          "brand-grad font-extrabold leading-none tracking-[-0.025em] whitespace-nowrap",
          s.text,
        )}
      >
        {site.name}
      </span>
    </span>
  );
}
