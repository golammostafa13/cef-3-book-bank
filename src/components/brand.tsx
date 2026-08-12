import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * The wordmark: three leaves in a gradient tile, then the name in two tones.
 *
 * One component for every place the name appears — header, footer, sign-in,
 * admin rail — because a mark that is re-typed at each call site drifts. The
 * gradients live in globals.css (`.brand-mark`, `.brand-grad`) so both halves
 * of the lockup pull from the same three tokens and stay in step through the
 * light/dark swap.
 */

const sizes = {
  sm: { tile: "size-8 rounded-[9px]", text: "text-[1.05rem]", bar: "h-3.5" },
  md: { tile: "size-9 rounded-[10px]", text: "text-[1.2rem]", bar: "h-4" },
  lg: { tile: "size-11 rounded-xl", text: "text-[1.5rem]", bar: "h-5" },
} as const;

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
      aria-hidden="true"
      className={cn(
        "brand-mark relative inline-flex shrink-0 items-center justify-center",
        s.tile,
        className,
      )}
    >
      {/* Three leaves — the "3" in Cef 3, and a book seen end-on. Staggered
          heights and opacities so it reads as pages rather than as a barcode. */}
      <span
        className={cn(
          "absolute w-[3px] -translate-x-[6px] rounded-full bg-white/85",
          s.bar,
        )}
      />
      <span
        className={cn(
          "absolute w-[3px] rounded-full bg-white",
          size === "lg" ? "h-6" : size === "md" ? "h-5" : "h-[18px]",
        )}
      />
      <span
        className={cn(
          "absolute w-[3px] translate-x-[6px] rounded-full bg-white/65",
          size === "lg" ? "h-4" : "h-3",
        )}
      />
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
