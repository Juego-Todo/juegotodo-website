import Link from "next/link";
import { formatCategory, formatResult } from "@/components/latayanology/format";
import type { PublicEventBout } from "@/lib/fight-records/public";

export function EventBoutList({ bouts }: { bouts: PublicEventBout[] }) {
  if (bouts.length === 0) {
    return (
      <div className="glass-panel rounded-[1.5rem] px-5 py-10 text-center text-sm text-zinc-400">
        This event card has no bouts yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bouts.map((bout) => (
        <article className="glass-panel rounded-[1.5rem] p-4 sm:p-5" key={bout.id}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-[#FF1010]">
              {bout.boutLabel || `Bout ${bout.boutOrder}`}
            </p>
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">
              {[formatCategory(bout.category), bout.division || bout.weightClass, bout.format].filter(Boolean).join(" · ")}
            </p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {bout.participants.map((participant) => (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4" key={`${bout.id}-${participant.corner}`}>
                <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">
                  {participant.corner || "Corner"} · {formatResult(participant.result)}
                </p>
                {participant.fighter ? (
                  <Link
                    className="mt-2 block font-display text-3xl uppercase leading-none text-white transition hover:text-red-200"
                    href={`/latayanology/fighters/${participant.fighter.slug}`}
                  >
                    {participant.fighter.displayName}
                  </Link>
                ) : (
                  <p className="mt-2 font-display text-3xl uppercase text-white">TBA</p>
                )}
                {participant.fighter?.nickname ? (
                  <p className="mt-1 text-sm text-zinc-400">&ldquo;{participant.fighter.nickname}&rdquo;</p>
                ) : null}
                {participant.fighter?.gym ? <p className="mt-2 text-sm text-zinc-500">{participant.fighter.gym}</p> : null}
              </div>
            ))}
          </div>
          {bout.method || bout.round || bout.timeRemaining ? (
            <p className="mt-3 text-sm text-zinc-400">
              {[bout.method, bout.round && `Round ${bout.round}`, bout.timeRemaining].filter(Boolean).join(" · ")}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
