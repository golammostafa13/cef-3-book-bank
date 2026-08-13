"use client";

import { useActionState } from "react";
import { AlertCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fieldClass } from "@/components/ui/field";
import { devSignInAction, type SignInState } from "@/lib/actions/auth";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { textClass } from "@/lib/i18n/content";
import { cn } from "@/lib/utils";

const empty: SignInState = { ok: false };

/**
 * Stands in for the Google button when no client id is configured, and only
 * outside production (see `isDevSignInAllowed`).
 *
 * It accepts any address, exactly as the Google path does — what it cannot do is
 * prove the address belongs to whoever typed it. Hence the label: nobody should
 * mistake this for the real thing, and it is compiled out of a production build.
 */
export function DevSignIn({
  lang,
  next = "",
  hasAdminEmails = false,
}: {
  lang: Locale;
  next?: string;
  hasAdminEmails?: boolean;
}) {
  const dict = getDictionary(lang);
  const [state, formAction, pending] = useActionState(devSignInAction, empty);
  const bn = textClass(lang);

  return (
    <form action={formAction}>
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="next" value={next} />

      <label
        htmlFor="email"
        className={cn("mb-2 block text-sm font-medium text-ink", bn)}
      >
        {dict.auth.devEmailLabel}
      </label>
      <div className="relative">
        <Mail
          className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-faint"
          aria-hidden="true"
        />
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          spellCheck={false}
          autoFocus
          placeholder="you@example.com"
          className={fieldClass(state.message, "pl-11")}
        />
      </div>

      {state.message && (
        <p
          role="alert"
          className={cn("mt-3 flex items-center gap-2 text-sm text-danger", bn)}
        >
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          {state.message}
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="mt-5 w-full"
        disabled={pending}
      >
        {pending ? dict.auth.signingIn : dict.auth.devContinue}
      </Button>
    </form>
  );
}
