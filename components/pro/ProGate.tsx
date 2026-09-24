"use client";

import Link from "next/link";
import { PRO_PAGE_PATH } from "@/data/pro-membership";
import { ProBadge } from "@/components/pro/ProBadge";

export function ProGate({
  entitled,
  loading = false,
  children,
  title = "JuegoTodo Pro required",
  description = "An active Pro membership unlocks the License Center and role credential applications.",
}: {
  entitled: boolean;
  loading?: boolean;
  children: React.ReactNode;
  title?: string;
  description?: string;
}) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-10 text-center text-sm text-zinc-400">
        Checking Pro membership…
      </div>
    );
  }

  if (entitled) {
    return <>{children}</>;
  }

  return (
    <div className="rounded-2xl border border-[#FFCF6A]/25 bg-gradient-to-br from-[#FFCF6A]/10 via-transparent to-transparent px-5 py-8 sm:px-8">
      <div className="flex flex-wrap items-center gap-2">
        <ProBadge label="PRO REQUIRED" variant="locked" />
      </div>
      <h2 className="font-display mt-4 text-2xl uppercase text-white sm:text-3xl">{title}</h2>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400">{description}</p>
      <Link
        href={PRO_PAGE_PATH}
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[#FF1010] px-6 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#ff2a2a]"
      >
        Become a Pro Member
      </Link>
    </div>
  );
}
