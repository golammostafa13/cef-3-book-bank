import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AlertCircle, QrCode } from "lucide-react";
import { AuthAside, AuthCard, AuthLayoutGrid } from "@/components/auth/auth-aside";
import { UnlockForm } from "@/components/auth/unlock-form";
import { getSession } from "@/lib/auth/current";
import { getDictionary, hasLocale, localePath } from "@/lib/i18n";
import { textClass } from "@/lib/i18n/content";
import { cn } from "@/lib/utils";

export async function generateMetadata(
  props: PageProps<"/[lang]/unlock">,
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!hasLocale(lang)) return {};
  return {
    title: getDictionary(lang).auth.metaUnlock,
    robots: { index: false, follow: false },
  };
}

/** Session state is per-request; nothing here may be prerendered. */
export const dynamic = "force-dynamic";

/**
 * Step two of two: the second printed code.
 *
 * Reached three ways — after signing up, by a scan whose code did not match
 * (`/api/unlock` sends the reader here with `?bad=1` rather than swallowing
 * it), and by anyone who comes back later with a half-finished registration.
 */
export default async function UnlockPage(props: PageProps<"/[lang]/unlock">) {
  const { lang } = await props.params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);

  const sp = await props.searchParams;
  const next = typeof sp.next === "string" ? sp.next : "";
  const scanFailed = sp.bad === "1";

  const session = await getSession();
  // Nothing to finish. Without a session there is no account to attach the
  // second code to, so the first one is where this has to start.
  if (!session) redirect(localePath(lang, "/signup"));
  if (session.gate !== "registered") {
    redirect(next.startsWith("/") ? next : localePath(lang));
  }

  const bn = textClass(lang);

  return (
    <AuthLayoutGrid>
      <AuthAside lang={lang} lead={dict.auth.sideLeadUnlock} />

      <AuthCard
        lang={lang}
        step={dict.auth.stepTwo}
        title={dict.auth.unlockTitle}
        lead={dict.auth.unlockLead}
      >
        {/* Scanning is the path this page expects; the form below it is the
            fallback. Saying so in the card keeps a reader from typing out a
            code their camera would have read in a second. */}
        <p
          className={cn(
            "flex items-start gap-3 rounded-xl border border-line bg-bg px-4 py-3 text-sm text-ink-mute",
            bn,
          )}
        >
          <QrCode
            className="mt-0.5 size-5 shrink-0 text-accent"
            aria-hidden="true"
          />
          {dict.auth.unlockScanHint}
        </p>

        {scanFailed && (
          <p
            role="alert"
            className={cn(
              "mt-4 flex items-start gap-2 text-sm text-danger",
              bn,
            )}
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {dict.auth.errorScanFailed}
          </p>
        )}

        <div className="mt-6 border-t border-line pt-6">
          <UnlockForm lang={lang} next={next} />
        </div>
      </AuthCard>
    </AuthLayoutGrid>
  );
}
