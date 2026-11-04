import Link from "next/link";
import { formatCardDate, formatCategory, formatResult } from "@/components/latayanology/format";
import type { PublicBoutHistoryItem } from "@/lib/fight-records/public";

export function BoutHistoryList({ history }: { history: PublicBoutHistoryItem[] }) {
  if (history.length === 0) {
    return (
      <div className="glass-panel rounded-[1.5rem] px-5 py-10 text-center text-sm text-zinc-400">
        No bouts are linked to this fighter yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {history.map((bout) => (
        <article className="glass-panel rounded-[1.35rem] p-4 sm:p-5" key={bout.boutId}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-[#FF1010]">
                {formatResult(bout.result)}
                {bout.method ? ` · ${bout.method}` : ""}
              </p>
              <h3 className="mt-1 text-lg font-semibold text-white">
                <Link className="transition hover:text-red-200" href={`/latayanology/events/${bout.eventId}`}>
                  {bout.eventName || "Event card"}
                </Link>
              </h3>
              <p className="mt-1 text-sm text-zinc-400">
                {formatCardDate(bout.eventDate)}
                {bout.boutLabel ? ` · ${bout.boutLabel}` : ""}
              </p>
            </div>
            <p className="text-sm text-zinc-300">
              vs{" "}
              {bout.opponent ? (
                <Link
                  className="font-semibold text-white transition hover:text-red-200"
                  href={`/latayanology/fighters/${bout.opponent.slug}`}
                >
                  {bout.opponent.displayName}
                </Link>
              ) : (
                <span>Opponent</span>
              )}
            </p>
          </div>
          <p className="mt-3 text-xs uppercase tracking-[0.14em] text-zinc-500">
            {[formatCategory(bout.category), bout.division, bout.corner && `${bout.corner} corner`, bout.round && `Round ${bout.round}`, bout.timeRemaining]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </article>
      ))}
    </div>
  );
}
