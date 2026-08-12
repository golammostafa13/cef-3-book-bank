import puppeteer from "puppeteer-core";

const url = process.argv[2] ?? "http://localhost:3111/en";
const tag = process.argv[3] ?? "en";
const dark = process.argv[4] === "dark";
const out = "/tmp/claude-1000/-home-spectrum-Documents-library-Apu-Roy/ba75adf1-4414-42b7-a91a-9ca5788000f1/scratchpad";

const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: "new",
  args: [
    "--no-sandbox",
    "--hide-scrollbars",
    "--enable-unsafe-swiftshader",
    "--use-gl=swiftshader",
    "--enable-webgl",
  ],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
page.on("console", (m) => {
  if (m.type() === "error" || m.type() === "warning")
    console.log(`[${m.type()}] ${m.text()}`);
});
page.on("pageerror", (e) => console.log(`[pageerror] ${e.message}`));

await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });
if (dark) {
  await page.evaluate(() => localStorage.setItem("theme", "dark"));
  await page.reload({ waitUntil: "networkidle2" });
}
await new Promise((r) => setTimeout(r, 4000));

const info = await page.evaluate(() => {
  const track = document.querySelector(".hero3d");
  const canvas = document.querySelector(".hero3d__canvas");
  return {
    live: track?.getAttribute("data-live"),
    isStatic: track?.getAttribute("data-static"),
    trackHeight: track?.getBoundingClientRect().height,
    canvasSize: canvas ? [canvas.width, canvas.height] : null,
    docHeight: document.body.scrollHeight,
    h1: document.querySelector("h1")?.textContent?.slice(0, 70),
  };
});
console.log(tag, JSON.stringify(info));

const track = await page.evaluate(() => {
  const el = document.querySelector(".hero3d");
  const r = el.getBoundingClientRect();
  return { top: r.top + window.scrollY, height: r.height };
});

for (const p of [0, 0.18, 0.36, 0.5, 0.65, 0.8, 1]) {
  const y = track.top + (track.height - window.innerHeight ?? 900) * p;
  await page.evaluate(
    (yy) => window.scrollTo(0, yy),
    track.top + (track.height - 900) * p,
  );
  await new Promise((r) => setTimeout(r, 900));
  await page.screenshot({ path: `${out}/hero-${tag}-${p}.png` });
}

await browser.close();
console.log("shots written");
