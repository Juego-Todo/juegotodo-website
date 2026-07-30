"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthGateFallback } from "@/components/auth/AuthGateFallback";
import { MotionSection } from "@/components/MotionSection";
import { PageNavigation } from "@/components/PageNavigation";
import { welcomePaths, type WelcomePath } from "@/data/welcome-paths";
import { useAuth } from "@/lib/auth/context";
import { clearPendingWelcomeChooser } from "@/lib/auth/welcome";

export function WelcomePathPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { user, loading, updateProfile } = useAuth();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?mode=login&next=/welcome");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      clearPendingWelcomeChooser();
    }
  }, [user]);

  if (!user) {
    return (
      <AuthGateFallback
        loading={loading}
        loadingLabel="Preparing your account..."
        redirectHref="/login?mode=login&next=/welcome"
        user={user}
      />
    );
  }

  async function handlePath(path: WelcomePath) {
    if (!user) {
      return;
    }

    const currentUser = user;
    setBusyId(path.id);
    setError("");

    try {
      if (path.accountType && currentUser.accountType !== path.accountType) {
        await updateProfile({
          fullName: currentUser.fullName,
          accountType: path.accountType,
          gym: currentUser.gym,
          city: currentUser.city,
          bio: currentUser.bio,
        });
      }
      router.push(path.href);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to continue. Try again.");
      setBusyId(null);
    }
  }

  return (
    <main className="overflow-hidden px-4 pb-16 pt-24 sm:px-6 sm:pb-20 sm:pt-28 lg:px-8 lg:pt-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,16,16,0.12),transparent_55%)]" aria-hidden />
      <div className="cinematic-grid pointer-events-none absolute inset-0 opacity-25" aria-hidden />

      <MotionSection className="relative mx-auto max-w-5xl">
        <PageNavigation />
        <p className="mt-4 text-[0.68rem] font-black uppercase tracking-[0.22em] text-[#FF1010]">
          Welcome{user.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}
        </p>
        <h1 className="font-display mt-3 max-w-3xl text-[clamp(2.4rem,9vw,4.75rem)] uppercase leading-[0.9] text-white">
          What do you want to do?
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg sm:leading-8">
          Pick a starting path. You can always open your member portal later — license applications stay behind your
          signed-in account.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {welcomePaths.map((path, index) => {
            const Icon = path.icon;
            const busy = busyId === path.id;
            return (
              <motion.button
                className={`group relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/40 p-6 text-left transition hover:border-[#FF1010]/50 hover:bg-black/55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF1010] disabled:opacity-60`}
                disabled={Boolean(busyId)}
                initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                key={path.id}
                onClick={() => void handlePath(path)}
                transition={{ delay: reduceMotion ? 0 : 0.08 * index, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                type="button"
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${path.accent}`} aria-hidden />
                <div className="relative flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white">
                    <Icon aria-hidden className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-2xl uppercase tracking-wide text-white">{path.title}</p>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">{path.description}</p>
                    <span className="mt-4 inline-flex items-center gap-2 text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#FF1010]">
                      {busy ? "Opening…" : "Continue"}
                      <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}

        <p className="mt-8 text-sm text-zinc-500">
          Looking for referee, judge, or staff pathways?{" "}
          <Link className="font-semibold text-zinc-300 underline-offset-4 hover:text-white hover:underline" href="/profile">
            Open your portal
          </Link>{" "}
          or ask an admin after you join.
        </p>
      </MotionSection>
    </main>
  );
}
