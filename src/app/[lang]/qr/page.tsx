import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { signupCode, unlockCode } from "@/lib/auth/config";
import { hasLocale, localePath } from "@/lib/i18n";

/**
 * A proof sheet for the two printed codes — the artwork that goes in the book,
 * on screen, so it can be scanned with a real phone before anything is sent to
 * a printer.
 *
 * **Development only.** This page shows both codes in plain text beside
 * scannable versions of them; anyone who reaches it is inside. It answers 404
 * in a production build, and the check is a hard `notFound()` rather than a
 * condition on what gets rendered, because a page that leaks the keys to the
 * library is not one to protect with a well-meaning `if`.
 *
 * Not a substitute for the real print artwork. It exists to test the flow.
 */

export const metadata: Metadata = {
  title: "QR proof sheet",
  robots: { index: false, follow: false },
};

/** The host is read per request; nothing here may be prerendered. */
export const dynamic = "force-dynamic";

/**
 * The origin to encode.
 *
 * Taken from the request rather than from `site.url`, because the whole point
 * is to scan these from a phone — and a phone on the same wifi needs
 * `http://192.168.x.x:3000`, which is exactly the host the laptop typed to
 * reach this page. Encoding `localhost` would produce two codes that scan
 * perfectly and go nowhere.
 */
async function origin(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

async function svg(text: string): Promise<string> {
  return QRCode.toString(text, {
    type: "svg",
    // A printed code gets creased, thumbed and photographed at an angle. `M`
    // survives about 15% of the image being unreadable, which is the usual
    // trade for something that lives in a book rather than on a screen.
    errorCorrectionLevel: "M",
    margin: 2,
    // Fixed black on fixed white, and not the page's ink and ground. A camera
    // needs the contrast the standard assumes, and a dark theme would
    // otherwise hand it light modules on a dark tile — which reads as no code
    // at all on most phones.
    color: { dark: "#000000", light: "#ffffff" },
  });
}

export default async function QrProofPage(props: PageProps<"/[lang]/qr">) {
  // if (process.env.NODE_ENV === "production") notFound();

  const { lang } = await props.params;
  if (!hasLocale(lang)) notFound();

  const base = await origin();
  const first = `${base}/signup`;
  const second = `${base}/api/unlock?k=${encodeURIComponent(unlockCode)}`;

  const codes = [
    {
      step: "Step 1",
      title: "Set up your account",
      caption:
        "Inside the front cover. Scanning opens the form; the code below is typed into it.",
      url: first,
      secret: signupCode,
      secretLabel: "Print this beside the code:",
      art: await svg(first),
    },
    {
      step: "Step 2",
      title: "Open the library",
      caption:
        "On the following page. Scanning finishes the account and lands the reader on the home page — nothing to type.",
      url: second,
      secret: unlockCode,
      secretLabel: "Carried inside the code itself:",
      art: await svg(second),
    },
  ];

  return (
    <div className="paper-grain min-h-dvh px-5 py-16">
      <div className="mx-auto max-w-4xl">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-danger">
          Not in a production build
        </p>
        <h1 className="mt-3 text-[2rem] font-bold tracking-tight text-ink">
          The two codes, as they go in the book
        </h1>
        <p className="mt-3 max-w-2xl text-[0.95rem] text-ink-mute">
          Scan these with a phone on the same network as this machine.
        </p>

        {!unlockCode && (
          <p
            role="alert"
            className="mt-6 rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger"
          >
            <code>UNLOCK_CODE</code> is not set in <code>.env.local</code>, so
            the second code below is empty and the gate cannot be passed. Set it
            and restart the dev server.
          </p>
        )}

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {codes.map((c) => (
            <section
              key={c.step}
              className="rounded-3xl border border-line bg-surface p-7 shadow-e2"
            >
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-accent">
                {c.step}
              </p>
              <h2 className="mt-2 text-xl font-bold tracking-tight text-ink">
                {c.title}
              </h2>
              <p className="mt-2 text-sm text-ink-mute">{c.caption}</p>

              <div
                className="mx-auto mt-6 w-full max-w-[15rem] overflow-hidden rounded-2xl border border-line bg-white [&>svg]:block [&>svg]:h-auto [&>svg]:w-full"
                // The encoder returns a complete SVG document. Inlined rather
                // than loaded as an <img src="data:…"> so it scales crisply
                // and needs no exception in the img-src CSP.
                dangerouslySetInnerHTML={{ __html: c.art }}
              />

              <p className="mt-4 break-all font-mono text-[0.72rem] leading-relaxed text-ink-faint">
                {c.url}
              </p>
            </section>
          ))}
        </div>

        <p className="mt-10 text-sm text-ink-mute">
          Scanning the first code twice will not get anyone in: the account it
          creates can see nothing but the page asking for the second.{" "}
          <a
            href={localePath(lang, "/signin")}
            className="font-medium text-accent underline underline-offset-4"
          >
            Sign-in page
          </a>
        </p>
      </div>
    </div>
  );
}
