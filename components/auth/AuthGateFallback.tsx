import Link from "next/link";
import type { UserProfile } from "@/lib/auth/types";

export function AuthGateFallback({
  loading,
  user,
  loadingLabel = "Loading...",
  redirectHref,
  redirectLabel = "Redirecting to sign in...",
  signInLabel = "Sign In",
}: {
  loading: boolean;
  user: UserProfile | null;
  loadingLabel?: string;
  redirectHref?: string;
  redirectLabel?: string;
  signInLabel?: string;
}) {
  if (user) {
    return null;
  }

  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4 pt-24">
      <div className="text-center">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-zinc-400">
          {loading ? loadingLabel : redirectLabel}
        </p>
        {!loading && redirectHref ? (
          <Link
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-[#FF1010] px-5 py-2.5 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#ff2828]"
            href={redirectHref}
          >
            {signInLabel}
          </Link>
        ) : null}
      </div>
    </main>
  );
}
