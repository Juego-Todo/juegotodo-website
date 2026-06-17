import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { NavNeighbors } from "@/lib/navigation/prev-next";

export function PrevNextNav({ neighbors }: { neighbors: NavNeighbors }) {
  if (!neighbors.previous && !neighbors.next) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 pb-14 pt-8 sm:px-6 sm:pb-20 lg:px-8">
      <div className="grid gap-4 md:grid-cols-2">
        {neighbors.previous ? (
          <NeighborCard direction="previous" neighbor={neighbors.previous} />
        ) : (
          <div aria-hidden className="hidden md:block" />
        )}
        {neighbors.next ? <NeighborCard direction="next" neighbor={neighbors.next} /> : null}
      </div>
    </section>
  );
}

function NeighborCard({
  neighbor,
  direction,
}: {
  neighbor: NonNullable<NavNeighbors["previous"]>;
  direction: "previous" | "next";
}) {
  const isNext = direction === "next";

  return (
    <Link
      className={`card-3d glass-panel group block overflow-hidden rounded-[1.5rem] border-white/[0.08] bg-[#0D0D0D]/75 transition hover:border-[#FF1010]/30 ${
        isNext ? "md:justify-self-end" : ""
      }`}
      href={neighbor.href}
    >
      <div className="grid grid-cols-[auto_1fr] items-center gap-4 p-4 sm:p-5">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-2xl border border-[#FF1010]/25 bg-gradient-to-br ${
            neighbor.tone ?? "from-red-900 via-zinc-950 to-black"
          } font-display text-2xl text-white`}
        >
          {neighbor.initials ?? "JT"}
        </div>
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[0.62rem] font-black uppercase tracking-[0.2em] text-zinc-500">
            {isNext ? (
              <>
                Next
                <ArrowRight className="transition group-hover:translate-x-0.5 group-hover:text-[#FF1010]" size={14} aria-hidden />
              </>
            ) : (
              <>
                <ArrowLeft className="transition group-hover:-translate-x-0.5 group-hover:text-[#FF1010]" size={14} aria-hidden />
                Previous
              </>
            )}
          </p>
          <h3 className="mt-1 truncate text-lg font-bold text-white sm:text-xl">{neighbor.label}</h3>
          {neighbor.subtitle ? (
            <p className="mt-1 truncate text-sm text-zinc-500">{neighbor.subtitle}</p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
