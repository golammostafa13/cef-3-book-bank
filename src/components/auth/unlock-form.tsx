"use client";

import { useActionState } from "react";
import { AlertCircle, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fieldClass } from "@/components/ui/field";
import { unlockAction, type SignInState } from "@/lib/actions/auth";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { textClass } from "@/lib/i18n/content";
import { cn } from "@/lib/utils";

const empty: SignInState = { ok: false };

/**
 * The second printed code, typed by hand.
 *
 * Scanning is the intended path — the QR goes straight to `/api/unlock` and
 * this page is never seen. This form is what is left when the camera will not
 * focus, and it is the whole reason the code is short enough to read aloud.
 */
export function UnlockForm({ lang, next = "" }: { lang: Locale; next?: string }) {
  const dict = getDictionary(lang);
  const [state, formAction, pending] = useActionState(unlockAction, empty);
  const bn = textClass(lang);

  return (
    <form action={formAction}>
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="next" value={next} />

      <label
        htmlFor="code"
        className={cn("mb-2 block text-sm font-medium text-ink", bn)}
      >
        {dict.auth.unlockCodeLabel}
      </label>
      <div className="relative">
        <KeyRound
          className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-faint"
          aria-hidden="true"
        />
        <input
          id="code"
          name="code"
          type="text"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          autoFocus
          className={fieldClass(state.message, "pl-11 font-mono tracking-wide")}
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
        {pending ? dict.auth.unlocking : dict.auth.unlockContinue}
      </Button>
    </form>
  );
}
