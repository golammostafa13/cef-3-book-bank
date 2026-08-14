/**
 * Builds the book cover WebP images for the public catalogue.
 *
 *   node scripts/build-covers.mjs
 *
 * Sources:
 *   - Books 1–20 (except 04, 08, 13): docs/book_images/Pediatric Book Image/{N}.*
 *   - Books 04, 08, 13: page-1 render from the PDF (pdftoppm), because the
 *     supplied image is from a different edition than the actual PDF.
 *
 * Output: public/covers/<slug>.webp — 640px wide, white background, q82.
 * Committed to the repo so the build never depends on docs/.
 *
 * Requires poppler-utils (pdftoppm) for books 04/08/13:
 *   sudo apt install poppler-utils
 */
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const imgDir = join(root, "docs", "book_images", "Pediatric Book Image");
const pdfDir = join(root, "docs", "books_files");
const outDir = join(root, "public", "covers");

mkdirSync(outDir, { recursive: true });

/**
 * Each entry: [bookNumber, slug, pdfFilename].
 * Books 04, 08, 13 get their cover rendered from the PDF instead of the
 * supplied image (wrong edition on those three).
 */
const books = [
  [1,  "nelson-textbook-of-pediatrics",                         null],
  [2,  "the-harriet-lane-handbook",                             null],
  [3,  "gomellas-neonatology",                                  null],
  [4,  "current-diagnosis-treatment-pediatrics",                "04. CURRENT Diagnosis and Treatment of Pediatric.pdf"],
  [5,  "cloherty-and-starks-manual-of-neonatal-care",           null],
  [6,  "davidsons-principles-and-practice-of-medicine",         null],
  [7,  "prep-2026-self-assessment",                             null],
  [8,  "nelsons-pediatric-antimicrobial-therapy",               "08. Nelson Pediatric Antimicrobial Therapy 29th Edition.pdf"],
  [9,  "nelson-essentials-of-pediatrics",                       null],
  [10, "clinical-pediatric-nephrology",                         null],
  [11, "zitelli-and-davis-atlas-of-pediatric-physical-diagnosis", null],
  [12, "weinbergs-color-atlas-of-pediatric-dermatology",        null],
  [13, "pediatric-ophthalmology-and-strabismus",                "13. Pediatric Ophthalmology.pdf"],
  [14, "pediatric-critical-care-review",                        null],
  [15, "100-cases-in-paediatrics",                              null],
  [16, "neonatal-formulary",                                    null],
  [17, "feigin-and-cherrys-textbook-of-pediatric-infectious-diseases", null],
  [18, "pediatric-neurology-a-color-handbook",                  null],
  [19, "algorithms-in-pediatric-neurology",                     null],
  [20, "harrisons-principles-of-internal-medicine",             null],
];

/** Find the image file for a given book number (handles N..ext and N.ext). */
function findImageFile(n) {
  const files = readdirSync(imgDir);
  // Match "N.ext" or "N..ext" (the double-dot naming in this dir)
  const prefix = `${n}.`;
  const match = files.find((f) => f.startsWith(prefix));
  return match ? join(imgDir, match) : null;
}

/** Render page 1 of a PDF to a JPEG via pdftoppm, return the path. */
function renderPdfCover(pdfName) {
  const pdfPath = join(pdfDir, pdfName);
  const tmp = join(tmpdir(), `cover-${Date.now()}`);
  try {
    execSync(`pdftoppm -f 1 -l 1 -r 150 -jpeg -singlefile "${pdfPath}" "${tmp}"`, {
      stdio: "pipe",
    });
    const outFile = `${tmp}.jpg`;
    return existsSync(outFile) ? outFile : null;
  } catch (e) {
    console.warn(`  ⚠  pdftoppm failed for ${pdfName}: ${e.message}`);
    return null;
  }
}

let ok = 0;
let failed = 0;

for (const [n, slug, pdfFile] of books) {
  const outPath = join(outDir, `${slug}.webp`);
  let sourcePath = null;

  if (pdfFile) {
    // Preferred: render from PDF for wrong-edition cover images
    console.log(`  [${n.toString().padStart(2)}] Rendering page 1 of PDF for ${slug}…`);
    sourcePath = renderPdfCover(pdfFile);
    if (!sourcePath) {
      // Fallback: use the supplied image anyway (better than nothing)
      console.warn(`       Falling back to supplied image for ${slug}`);
      sourcePath = findImageFile(n);
    }
  } else {
    sourcePath = findImageFile(n);
  }

  if (!sourcePath || !existsSync(sourcePath)) {
    console.error(`  [${n.toString().padStart(2)}] ✗ No source image found for ${slug}`);
    failed++;
    continue;
  }

  try {
    await sharp(sourcePath)
      .resize(640, 900, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .webp({ quality: 82 })
      .toFile(outPath);
    console.log(`  [${n.toString().padStart(2)}] ✓ ${slug}.webp`);
    ok++;
  } catch (e) {
    console.error(`  [${n.toString().padStart(2)}] ✗ sharp failed for ${slug}: ${e.message}`);
    failed++;
  }
}

console.log(`\nDone: ${ok} covers written to public/covers/, ${failed} failed.`);
