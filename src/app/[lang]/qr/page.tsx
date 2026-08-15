import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { hasLocale, localePath } from "@/lib/i18n";

/**
 * A proof sheet for QR codes used during development.
 *
 * **Development only.** This page answers 404 in a production build.
 */

export const metadata: Metadata = {
  title: "QR proof sheet",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

async function origin(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

async function svg(text: string): Promise<string> {
  return QRCode.toString(text, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 2,
    color: { dark: "#000000", light: "#ffffff" },
  });
}

async function png(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    type: "image/png",
    errorCorrectionLevel: "M",
    margin: 2,
    width: 800,
    color: { dark: "#000000", light: "#ffffff" },
  });
}

async function jpg(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    type: "image/jpeg",
    errorCorrectionLevel: "M",
    margin: 2,
    width: 800,
    color: { dark: "#000000", light: "#ffffff" },
  });
}

export default async function QrProofPage(props: PageProps<"/[lang]/qr">) {
  const { lang } = await props.params;
  if (!hasLocale(lang)) notFound();

  const base = await origin();
  const signinUrl = `${base}${localePath(lang, "/signin")}`;

  const codes = [
    {
      step: "Sign in",
      title: "Sign in page",
      caption: "Scanning opens the sign-in page.",
      url: signinUrl,
      art: await svg(signinUrl),
      png: await png(signinUrl),
      jpg: await jpg(signinUrl),
    },
  ];

  return (
    <div className="paper-grain min-h-dvh px-5 py-16">
      <div className="mx-auto max-w-4xl">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-danger">
          Not in a production build
        </p>
        <p className="mt-3 max-w-2xl text-[0.95rem] text-ink-mute">
          QR proof sheet for development.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-1">
          {codes.map((c) => (
            <section
              key={c.step}
              className="rounded-3xl border border-line bg-surface p-7 shadow-e2"
            >
              <h2 className="mt-2 text-xl font-bold tracking-tight text-ink">
                {c.title}
              </h2>
              <p className="mt-2 text-sm text-ink-mute">{c.caption}</p>

              <div
                className="mx-auto mt-6 w-full max-w-[15rem] overflow-hidden rounded-2xl border border-line bg-white [&>svg]:block [&>svg]:h-auto [&>svg]:w-full"
                dangerouslySetInnerHTML={{ __html: c.art }}
              />

              <p className="mt-4 break-all font-mono text-[0.72rem] leading-relaxed text-ink-faint">
                {c.url}
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href={c.png}
                  download="qr-signin.png"
                  className="rounded-full border border-line bg-surface px-4 py-1.5 text-xs font-semibold text-ink transition hover:bg-ink hover:text-surface"
                >
                  Download PNG
                </a>
                <a
                  href={c.jpg}
                  download="qr-signin.jpg"
                  className="rounded-full border border-line bg-surface px-4 py-1.5 text-xs font-semibold text-ink transition hover:bg-ink hover:text-surface"
                >
                  Download JPG
                </a>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
