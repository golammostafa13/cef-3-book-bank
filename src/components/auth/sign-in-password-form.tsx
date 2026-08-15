"use client";

import { useActionState } from "react";
import { AlertCircle, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fieldClass } from "@/components/ui/field";
import { signInWithPasswordAction, type SignInState } from "@/lib/actions/auth";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { textClass } from "@/lib/i18n/content";
import { cn } from "@/lib/utils";

const empty: SignInState = { ok: false };

export function SignInPasswordForm({
  lang,
  next = "",
}: {
  lang: Locale;
  next?: string;
}) {
  const dict = getDictionary(lang);
  const [state, formAction, pending] = useActionState(
    signInWithPasswordAction,
    empty,
  );
  const bn = textClass(lang);

  const attempt = state.attempt ?? 0;

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="next" value={next} />

      <div>
        <label
          htmlFor="email"
          className={cn("mb-2 block text-sm font-medium text-ink", bn)}
        >
          {dict.auth.emailLabel}
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
            autoFocus={attempt === 0}
            placeholder="you@example.com"
            className={fieldClass(undefined, "pl-11")}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="password"
          className={cn("mb-2 block text-sm font-medium text-ink", bn)}
        >
          {dict.auth.passwordLabel}
        </label>
        <div className="relative">
          <Lock
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-faint"
            aria-hidden="true"
          />
          <input
            key={`password-${attempt}`}
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder={dict.auth.passwordPlaceholder}
            className={fieldClass(state.message, "pl-11")}
          />
        </div>
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
        className="mt-5 w-full"
        disabled={pending}
      >
        {pending ? dict.auth.signingIn : dict.auth.passwordSignIn}
      </Button>
    </form>
  );
}
