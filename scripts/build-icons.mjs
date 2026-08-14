/**
 * Builds the raster app icons from the same mark `components/brand.tsx` draws.
 *
 *   node scripts/build-icons.mjs
 *
 * Writes `src/app/favicon.ico` (16/32/48) and `src/app/apple-icon.png` (180).
 * `src/app/icon.svg` is authored by hand and is what modern browsers actually
 * use; these two exist for the slots that cannot take an SVG — the legacy
 * favicon request and the iOS home screen.
 *
 * A one-off tool, not part of the build: it leans on the `sharp` that Next
 * already installs rather than adding a dependency for three files that change
 * about as often as the company name. Run it after editing the mark.
 */
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const sharp = require("sharp");
const appDir = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "app");

/** The tile, as in globals.css `.brand-mark` — light-mode brand tokens. */
const tile = (inner, rx) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <defs><linearGradient id="t" x1="4" y1="0" x2="44" y2="48" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#65a30d"/><stop offset="0.55" stop-color="#059669"/><stop offset="1" stop-color="#0e7490"/>
  </linearGradient></defs>
  <rect width="48" height="48" rx="${rx}" fill="url(#t)"/>${inner}</svg>`;

/** The drawing, as in `icon.svg`. */
const mark = (scale, cy) => `<g transform="translate(24 ${cy}) scale(${scale}) translate(-24 -25)">
  <path d="M22.7 26c-1.8-2.6-4.8-4.2-8.2-4.2H9C7.9 21.8 7 22.7 7 23.8v11.8c0 1.1.9 2 2 2h5.6c3.4 0 6.4 1.6 8.2 4.2z" fill="#fff" fill-opacity="0.96"/>
  <path d="M25.3 26c1.8-2.6 4.8-4.2 8.2-4.2H39c1.1 0 2 .9 2 2v11.8c0 1.1-.9 2-2 2h-5.6c-3.4 0-6.4 1.6-8.2 4.2z" fill="#fff" fill-opacity="0.96"/>
  <g transform="translate(24 25.6)">
    <path d="M0 0c-1.5-5.5-5.5-9.5-10.5-11-.3 5.5 3.5 10.2 10.5 11z" transform="translate(0 -3.4)" fill="#fff" fill-opacity="0.92"/>
    <path d="M0 0c-3.1-5.5-2.4-12.6 0-16.2 2.4 3.6 3.1 10.7 0 16.2z" fill="#fff"/>
    <path d="M0 0c1.5-5.5 5.5-9.5 10.5-11 .3 5.5-3.5 10.2-10.5 11z" transform="translate(0 -5.2)" fill="#fff" fill-opacity="0.8"/>
  </g></g>`;

/**
 * The same mark redrawn for the tab: heavier boards, a wider gutter, opaque
 * leaves, and no margin worth the pixel it would cost. Downscaling the drawing
 * above to 16px silts the gutter up and drops the two outer leaves below a
 * pixel — this cut is what keeps a book legible in the slot the mark is seen
 * in most.
 */
const markSmall = `<g transform="translate(24 24.6) scale(1.02) translate(-24 -25)">
  <path d="M22 26.5c-2-2.8-5-4.4-8.6-4.4H8.4C7.1 22.1 6 23.2 6 24.5v11c0 1.3 1.1 2.4 2.4 2.4h5c3.6 0 6.6 1.6 8.6 4.4z" fill="#fff"/>
  <path d="M26 26.5c2-2.8 5-4.4 8.6-4.4h5c1.3 0 2.4 1.1 2.4 2.4v11c0 1.3-1.1 2.4-2.4 2.4h-5c-3.6 0-6.6 1.6-8.6 4.4z" fill="#fff"/>
  <g transform="translate(24 26)">
    <path d="M0 0c-1.8-5.2-5.6-8.4-10.4-9.4-.4 5.2 3.4 9.4 10.4 9.4z" transform="translate(0 -3.6)" fill="#fff"/>
    <path d="M0 0c-3.4-5.4-2.6-12.4 0-16 2.6 3.6 3.4 10.6 0 16z" fill="#fff"/>
    <path d="M0 0c1.8-5.2 5.6-8.4 10.4-9.4.4 5.2-3.4 9.4-10.4 9.4z" transform="translate(0 -5.4)" fill="#fff"/>
  </g></g>`;

const png = (svg, size) =>
  // A high render density first, then a downscale: rasterising a 48-unit box
  // straight to 16px hands the curves to the SVG renderer's own aliasing,
  // which is worse than sharp's.
  sharp(Buffer.from(svg), { density: 1200 }).resize(size, size).png().toBuffer();

/**
 * A PNG-framed .ico. Every browser and every Windows since Vista reads this;
 * the alternative is a BMP frame with a hand-built AND mask, for the sake of
 * IE 6.
 */
function ico(frames) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(frames.length, 4);

  let offset = 6 + frames.length * 16;
  const dir = frames.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2); // palette
    e.writeUInt8(0, 3); // reserved
    e.writeUInt16LE(1, 4); // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });

  return Buffer.concat([header, ...dir, ...frames.map((f) => f.data)]);
}

const sizes = [16, 32, 48];
const frames = await Promise.all(
  sizes.map(async (size) => ({
    size,
    // The tile's corner radius is a proportion of the tile, so it scales with it.
    data: await png(tile(markSmall, 9), size),
  })),
);
writeFileSync(join(appDir, "favicon.ico"), ico(frames));

// Full bleed and a wider margin: iOS masks its own corners off the artwork,
// and anything near the edge is what it cuts.
writeFileSync(
  join(appDir, "apple-icon.png"),
  await png(tile(mark(0.82, 24.4), 0), 180),
);

console.log(`favicon.ico (${sizes.join(", ")}) + apple-icon.png (180) written`);
