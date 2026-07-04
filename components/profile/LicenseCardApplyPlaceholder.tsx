"use client";

import Link from "next/link";
import { IdCard } from "lucide-react";

export function LicenseCardApplyPlaceholder() {
  return (
    <div className="w-full max-w-[28rem]">
      <p className="mb-3 text-center text-[0.56rem] font-black uppercase tracking-[0.22em] text-zinc-500 lg:text-left">
        JTGC Member Card
      </p>

      <Link
        className="group relative mx-auto block w-full max-w-[28rem] touch-manipulation"
        href="/register-for-license"
      >
        <div className="flex aspect-[1.58/1] w-full flex-col items-center justify-center gap-4 rounded-[0.85rem] border border-dashed border-white/15 bg-black/25 px-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition duration-300 group-hover:border-[#FF1010]/40 group-hover:bg-black/40">
          <span className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#FF1010] px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-white shadow-[0_12px_40px_rgba(255,16,16,0.45)] transition group-hover:scale-[1.02] group-hover:bg-[#ff2828]">
            <IdCard size={15} aria-hidden />
            Apply For A License
          </span>
        </div>
      </Link>

      <p className="mt-4 text-center text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500 lg:text-left">
        Official card unlocks after admin approval
      </p>
    </div>
  );
}
