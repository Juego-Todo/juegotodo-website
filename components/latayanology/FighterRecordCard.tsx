import Link from "next/link";
import { FighterPortrait } from "@/components/latayanology/FighterPortrait";
import { formatRecord } from "@/components/latayanology/format";
import type { PublicFighter } from "@/lib/fight-records/public";

export function FighterRecordCard({ fighter }: { fighter: PublicFighter }) {
  const record = formatRecord(fighter.wins, fighter.losses, fighter.draws);

  return (
    <article className="glass-panel flex h-full flex-col rounded-[1.5rem] p-4 transition hover:border-[#FF1010]/30 sm:p-5">
      <div className="flex items-start gap-4">
        <FighterPortrait name={fighter.displayName} photoUrl={fighter.photoUrl} />
        <div className="min-w-0 flex-1">
          <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-[#FF1010]">{record}</p>
          <h2 className="font-display mt-1 text-3xl uppercase leading-none text-white">
            <Link className="transition hover:text-red-200" href={`/latayanology/fighters/${fighter.slug}`}>
              {fighter.displayName}
            </Link>
          </h2>
          {fighter.nickname ? <p className="mt-1 text-sm text-zinc-400">&ldquo;{fighter.nickname}&rdquo;</p> : null}
        </div>
      </div>
      <dl className="mt-4 grid gap-2 text-sm text-zinc-300">
        <div className="flex justify-between gap-3">
          <dt className="text-zinc-500">Gym</dt>
          <dd className="text-right">{fighter.gym || "Independent"}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-zinc-500">Division</dt>
          <dd className="text-right">{fighter.weightClass || "Open"}</dd>
        </div>
        {fighter.hometown ? (
          <div className="flex justify-between gap-3">
            <dt className="text-zinc-500">Hometown</dt>
            <dd className="text-right">{fighter.hometown}</dd>
          </div>
        ) : null}
      </dl>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">
          {fighter.isMinor ? "Youth record" : fighter.claimStatus === "claimed" ? "Claimed profile" : "Unclaimed record"}
        </p>
        <Link
          className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-[#FF1010] transition hover:text-red-200"
          href={`/latayanology/fighters/${fighter.slug}`}
        >
          Bout history
        </Link>
      </div>
    </article>
  );
}
