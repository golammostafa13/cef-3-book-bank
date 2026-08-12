/**
 * Signs in through the development sign-in form and captures the admin
 * screens, reporting console errors along the way.
 */
import fs from "node:fs";
import puppeteer from "puppeteer-core";

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const BASE = "http://localhost:3001";
const OUT = process.argv[2] || ".";

const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu", "--hide-scrollbars"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1000 });

const problems = [];
page.on("console", (m) => {
  if (m.type() === "error") problems.push(`[console] ${m.text()}`);
});
page.on("pageerror", (e) => problems.push(`[pageerror] ${e.message}`));
page.on("response", (r) => {
  if (r.status() >= 400) problems.push(`[http ${r.status()}] ${r.url()}`);
});

await page.goto(`${BASE}/en/signin`, { waitUntil: "networkidle2" });
await page.screenshot({ path: `${OUT}/signin.png` });

const emailInput = await page.$('input[type="email"], input[name="email"]');
if (!emailInput) {
  console.log("!! no email field on /en/signin");
} else {
  const firstAdmin = (env.ADMIN_EMAILS ?? env.ADMIN_EMAIL ?? "").split(",")[0].trim();
  await emailInput.type(firstAdmin);
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle2" }).catch(() => {}),
    page.click('button[type="submit"]'),
  ]);
  await new Promise((r) => setTimeout(r, 1500));
  console.log("after sign-in ->", page.url());
}

// Second factor: the phone number on file.
if (page.url().includes("/signin/verify")) {
  await page.screenshot({ path: `${OUT}/signin-verify.png` });
  const phone = await page.$('input[name="phone"], input[type="tel"]');
  if (!phone) {
    console.log("!! no phone field on verify step");
  } else {
    await phone.type(env.ADMIN_PHONE ?? "");
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2" }).catch(() => {}),
      page.click('button[type="submit"]'),
    ]);
    await new Promise((r) => setTimeout(r, 1500));
    console.log("after verify ->", page.url());
  }
}

for (const [name, path, height] of [
  ["admin-dashboard", "/en/admin", 1600],
  ["admin-books", "/en/admin/books", 1700],
  ["admin-book-new", "/en/admin/books/new", 1500],
  ["admin-authors", "/en/admin/authors", 1300],
  ["admin-categories", "/en/admin/categories", 1300],
]) {
  await page.setViewport({ width: 1440, height });
  const res = await page.goto(`${BASE}${path}`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 700));
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log(`${res?.status()}  ${path}  -> ${page.url()}`);
}

console.log(problems.length ? "\nPROBLEMS:" : "\nno console/page errors");
for (const p of [...new Set(problems)]) console.log("  " + p);

await browser.close();
