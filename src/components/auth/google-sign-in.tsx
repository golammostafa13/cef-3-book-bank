"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import Script from "next/script";
import { AlertCircle } from "lucide-react";
import { signInWithGoogleAction, type SignInState } from "@/lib/actions/auth";
import type { Locale } from "@/lib/i18n/config";
import { textClass } from "@/lib/i18n/content";
import { cn } from "@/lib/utils";

/**
 * The Google button.
 *
 * Rendered by Google Identity Services rather than hand-built, because a
 * look-alike button is exactly the pattern users are taught to distrust — and
 * GIS handles the One Tap, popup and FedCM paths for us.
 *
 * The credential GIS hands back is posted to a Server Action, which is where
 * the token is actually verified. Nothing in this component is trusted.
 */

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }): void;
          renderButton(
            parent: HTMLElement,
            options: Record<string, string | number>,
          ): void;
        };
      };
    };
  }
}

const empty: SignInState = { ok: false };

export function GoogleSignIn({
  clientId,
  lang,
  next = "",
}: {
  clientId: string;
  /** Posted with the credential so the action's errors come back translated. */
  lang: Locale;
  /** Where to land afterwards. Validated in the action, never here. */
  next?: string;
}) {
  const [state, formAction] = useActionState(signInWithGoogleAction, empty);
  const buttonHost = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const credentialRef = useRef<HTMLInputElement>(null);
  const hostId = useId();

  useEffect(() => {
    let cancelled = false;

    // GIS loads asynchronously; poll briefly rather than racing the script tag.
    const timer = window.setInterval(() => {
      if (cancelled || !window.google || !buttonHost.current) return;
      window.clearInterval(timer);

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: ({ credential }) => {
          if (!credential || !credentialRef.current || !formRef.current) return;
          credentialRef.current.value = credential;
          formRef.current.requestSubmit();
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.renderButton(buttonHost.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "signin_with",
        logo_alignment: "center",
        width: 280,
      });
    }, 120);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [clientId]);

  return (
    <div className="flex flex-col items-center gap-4">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
      />

      <div
        id={hostId}
        ref={buttonHost}
        className="flex min-h-11 items-center justify-center"
      />

      <form action={formAction} ref={formRef} className="hidden">
        <input type="hidden" name="credential" ref={credentialRef} />
        {/* The action answers in the reader's language. */}
        <input type="hidden" name="lang" value={lang} />
        <input type="hidden" name="next" value={next} />
      </form>

      {state.message && (
        <p
          role="alert"
          className={cn(
            "flex items-center gap-2 rounded-xl border border-danger/30 bg-danger-soft px-4 py-2.5 text-sm text-danger",
            textClass(lang),
          )}
        >
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          {state.message}
        </p>
      )}
    </div>
  );
}
