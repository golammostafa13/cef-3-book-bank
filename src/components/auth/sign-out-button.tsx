import { LogOut } from "lucide-react";
import { signOutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

/**
 * Sign out. A plain form posting to a Server Action — no client JS, and it
 * cannot be triggered by a GET, which is what stops a stray <img src> or a
 * prefetch from logging the librarian out.
 */
export function SignOutButton({
  label = "Sign out",
  className,
  icon = false,
}: {
  /** Empty renders an icon-only button; the accessible name is kept either way. */
  label?: string;
  className?: string;
  icon?: boolean;
}) {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        aria-label={label || "Sign out"}
        title={label || "Sign out"}
        className={cn(
          "inline-flex items-center gap-2 text-sm text-ink-mute transition-colors hover:text-ink",
          className,
        )}
      >
        {icon && <LogOut className="size-4" aria-hidden="true" />}
        {label}
      </button>
    </form>
  );
}
