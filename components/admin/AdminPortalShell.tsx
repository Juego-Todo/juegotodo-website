"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { isAdminProfile } from "@/lib/commerce/storage";

export function AdminPortalShell({
  backHref = "/profile",
  backLabel = "Back to Profile",
  children,
  loadingLabel = "Loading...",
  loginNext,
}: {
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
  loadingLabel?: string;
  loginNext?: string;
}) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const isAdmin = user ? isAdminProfile(user) : false;
  const nextPath = loginNext ?? backHref;

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
    }
  }, [loading, user, isAdmin, router, nextPath]);

  if (loading || !user || !isAdmin) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4 pt-24">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-zinc-400">{loadingLabel}</p>
      </main>
    );
  }

  return (
    <main className="overflow-hidden px-4 pt-20 sm:px-6 sm:pt-24 lg:px-8 lg:pt-24">
      <section className="relative mx-auto max-w-[90rem] py-6 sm:py-8">
        <div className="cinematic-grid absolute inset-0 opacity-30" aria-hidden />
        <div className="relative">
          <Link
            className="inline-flex items-center gap-2 text-[0.7rem] font-black uppercase tracking-[0.18em] text-zinc-500 transition hover:text-[#FF1010]"
            href={backHref}
          >
            <ChevronLeft size={14} aria-hidden />
            {backLabel}
          </Link>
          <div className="mt-4">{children}</div>
        </div>
      </section>
    </main>
  );
}

export function AdminPortalHeader({
  tag,
  title,
  description,
}: {
  tag: string;
  title: string;
  description: string;
}) {
  return (
    <div className="glass-panel rounded-[1.75rem] p-5 sm:p-8">
      <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-[#FF1010]">{tag}</p>
      <h1 className="font-display mt-2 text-4xl uppercase text-white sm:text-5xl">{title}</h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">{description}</p>
    </div>
  );
}

export function AdminPortalPlaceholder({ message }: { message: string }) {
  return (
    <div className="glass-panel mt-6 rounded-[1.75rem] p-8 text-center text-sm leading-7 text-zinc-400">
      {message}
    </div>
  );
}
