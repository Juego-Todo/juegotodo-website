import type { ReactNode } from "react";
import Link from "next/link";
import { SaveEntityButton } from "@/components/commerce/SaveEntityButton";
import type { EnrichedFighterProfile } from "@/lib/fighters/profile";

export function FighterProfileView({ fighter }: { fighter: EnrichedFighterProfile }) {
  const teamName = fighter.team ?? fighter.gym;
  const recentResults = fighter.recentResults ?? [];
  const statistics = fighter.statistics;
  const fightHistory = fighter.fightHistory ?? [];

  return (
    <>
      <section className="mx-auto grid max-w-7xl gap-8 pb-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="glass-panel min-h-[24rem] rounded-[1.5rem] bg-[radial-gradient(circle_at_25%_10%,rgba(255,16,16,0.42),transparent_32%),linear-gradient(145deg,#151518,#050506)] p-5 sm:min-h-[34rem] sm:rounded-[2rem] sm:p-7">
          <span className="rounded-full bg-[#FF1010] px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-white">
            {fighter.rank} {fighter.division}
          </span>
          <div className="mt-36 sm:mt-56">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-red-200">{fighter.nickname}</p>
            <h1 className="font-display mt-3 text-6xl uppercase leading-none text-white sm:text-8xl">{fighter.name}</h1>
          </div>
        </div>

        <div>
          <p className="text-sm font-black uppercase tracking-[0.34em] text-[#FF1010]">Fighter Profile</p>
          <h2 className="font-display mt-4 text-5xl uppercase leading-none text-white sm:text-7xl">{fighter.style}</h2>
          <p className="mt-5 text-lg leading-8 text-zinc-300 sm:mt-6 sm:text-xl sm:leading-9">{fighter.highlight}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Record", fighter.record],
              ["Team", teamName],
              ["Country", fighter.country ?? "Philippines"],
              ["Style", fighter.style],
              ["Division", fighter.division],
              ["Region", fighter.region ?? "Philippines"],
            ].map(([label, value]) => (
              <div className="glass-panel rounded-3xl p-5" key={label}>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#FF1010]">{label}</p>
                {label === "Team" && fighter.teamSlug ? (
                  <Link
                    className="mt-3 block text-lg font-bold text-white transition hover:text-[#FF1010]"
                    href={`/teams/${fighter.teamSlug}`}
                  >
                    {value}
                  </Link>
                ) : (
                  <p className="mt-3 text-lg font-bold text-white">{value}</p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              className="min-h-12 rounded-full bg-[#FF1010] px-6 py-4 text-center text-sm font-black uppercase tracking-[0.22em] text-white transition hover:bg-[#ff2828]"
              href="/media"
            >
              Watch Highlights
            </Link>
            <Link
              className="min-h-12 rounded-full border border-white/15 px-6 py-4 text-center text-sm font-black uppercase tracking-[0.22em] text-white transition hover:bg-white/10"
              href="/rankings"
            >
              View Rankings
            </Link>
            <SaveEntityButton slug={fighter.slug} type="fighter" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl pb-8">
        <div className="grid gap-5 lg:grid-cols-2">
          <ProfilePanel title="Recent Results">
            {recentResults.length > 0 ? (
              <div className="divide-y divide-white/10">
                {recentResults.map((result) => (
                  <div className="grid gap-1 py-4 first:pt-0 last:pb-0" key={`${result.event}-${result.date}`}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-bold text-white">vs {result.opponent}</p>
                      <span
                        className={`text-xs font-black uppercase tracking-[0.16em] ${
                          result.result === "Win" ? "text-green-400" : result.result === "Loss" ? "text-red-400" : "text-zinc-400"
                        }`}
                      >
                        {result.result}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400">
                      {result.method} · {result.event}
                    </p>
                    <p className="text-xs uppercase tracking-[0.14em] text-zinc-600">{result.date}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">Recent bout results will appear here.</p>
            )}
          </ProfilePanel>

          <ProfilePanel title="Statistics">
            {statistics ? (
              <div className="grid grid-cols-2 gap-4">
                {[
                  ["Knockouts", statistics.knockouts],
                  ["Submissions", statistics.submissions],
                  ["Decisions", statistics.decisions],
                  ["Avg Fight Time", statistics.avgFightTime],
                  ["Weapon Round Wins", statistics.weaponRoundWins],
                  ["Win Streak", fighter.winStreak ?? 0],
                ].map(([label, value]) => (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4" key={label}>
                    <p className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500">{label}</p>
                    <p className="font-display mt-2 text-3xl text-white">{value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">Performance statistics will appear here.</p>
            )}
          </ProfilePanel>
        </div>
      </section>

      <section className="mx-auto max-w-7xl pb-10">
        <ProfilePanel title="Fight History">
          {fightHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-[0.65rem] font-black uppercase tracking-[0.16em] text-zinc-500">
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3 pr-4">Opponent</th>
                    <th className="pb-3 pr-4">Result</th>
                    <th className="pb-3 pr-4">Method</th>
                    <th className="pb-3">Event</th>
                  </tr>
                </thead>
                <tbody>
                  {fightHistory.map((bout) => (
                    <tr className="border-b border-white/[0.06]" key={`${bout.event}-${bout.date}-${bout.opponent}`}>
                      <td className="py-3 pr-4 text-zinc-400">{bout.date}</td>
                      <td className="py-3 pr-4 font-semibold text-white">{bout.opponent}</td>
                      <td className="py-3 pr-4">{bout.result}</td>
                      <td className="py-3 pr-4 text-zinc-300">{bout.method}</td>
                      <td className="py-3 text-zinc-400">{bout.event}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-zinc-500">Full fight history will appear here.</p>
          )}
        </ProfilePanel>
      </section>
    </>
  );
}

function ProfilePanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-panel rounded-[1.5rem] p-5 sm:rounded-[2rem] sm:p-6">
      <h2 className="text-sm font-black uppercase tracking-[0.24em] text-[#FF1010]">{title}</h2>
      <div className="mt-5">{children}</div>
    </div>
  );
}
