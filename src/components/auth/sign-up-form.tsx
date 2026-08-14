"use client";

import { useActionState } from "react";
import { AlertCircle, KeyRound, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fieldClass } from "@/components/ui/field";
import { signUpAction, type SignInState } from "@/lib/actions/auth";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { textClass } from "@/lib/i18n/content";
import { cn } from "@/lib/utils";

const empty: SignInState = { ok: false };

/**
 * The first of the two printed codes.
 *
 * Name, address, and the code from the book. Nothing here is verified — the
 * address is never mailed to, and the name is whatever was typed — because
 * none of it is what is being checked at this door. The code is.
 */
export function SignUpForm({ lang, next = "" }: { lang: Locale; next?: string }) {
  const dict = getDictionary(lang);
  const [state, formAction, pending] = useActionState(signUpAction, empty);
  const bn = textClass(lang);

  // React empties the form once the action returns. Remounting the two fields
  // whose values survived a rejection is what puts them back — a plain
  // `defaultValue` would not, because the element it belongs to is the same
  // element that was just cleared.
  const attempt = state.attempt ?? 0;

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="next" value={next} />

      <div>
        <label
          htmlFor="name"
          className={cn("mb-2 block text-sm font-medium text-ink", bn)}
        >
          {dict.auth.nameLabel}
        </label>
        <div className="relative">
          <User
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-faint"
            aria-hidden="true"
          />
          <input
            key={`name-${attempt}`}
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            autoFocus={attempt === 0}
            defaultValue={state.values?.name ?? ""}
            placeholder={dict.auth.namePlaceholder}
            className={fieldClass(undefined, "pl-11")}
          />
        </div>
      </div>

      <div>
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
            key={`email-${attempt}`}
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            spellCheck={false}
            defaultValue={state.values?.email ?? ""}
            placeholder="you@example.com"
            className={fieldClass(undefined, "pl-11")}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="code"
          className={cn("mb-2 block text-sm font-medium text-ink", bn)}
        >
          {dict.auth.codeLabel}
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
            // A printed code is not a password: hiding it behind dots only
            // stops the reader checking their own typing against the page.
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            // Focused after a rejection, because it is the field most likely
            // to have caused one and the only one now empty.
            autoFocus={attempt > 0}
            placeholder={dict.auth.codePlaceholder}
            className={fieldClass(state.message, "pl-11 font-mono tracking-wide")}
          />
        </div>
        <p className={cn("mt-1.5 text-sm text-ink-faint", bn)}>
          {dict.auth.codeHint}
        </p>
      </div>

      {state.message && (
        <p
          role="alert"
          className={cn("flex items-center gap-2 text-sm text-danger", bn)}
        >
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          {state.message}
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="mt-6! w-full"
        disabled={pending}
      >
        {pending ? dict.auth.signingUp : dict.auth.signUpContinue}
      </Button>
    </form>
  );
}
