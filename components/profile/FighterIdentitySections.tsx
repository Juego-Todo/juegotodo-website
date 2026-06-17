"use client";

import Link from "next/link";
import type { AthleteCredentialProfile } from "@/data/profile-credentials";
import type { ProfileIdentity } from "@/lib/profile/identity";
import { getPrimaryStatLabel } from "@/lib/profile/identity";

function StatBlock({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500">{label}</p>
      <p className={`font-display mt-2 text-3xl uppercase ${accent ? "text-[#FF1010]" : "text-white"}`}>{value}</p>
    </div>
  );
}

function AnalyticsBar({
  label,
  value,
  leagueAvg,
}: {
  label: string;
  value: number;
  leagueAvg?: number;
}) {
  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="font-display text-2xl text-white">{value}%</p>
      </div>
      <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-[#FF1010]" style={{ width: `${value}%` }} />
        {leagueAvg ? (
          <div
            className="absolute top-0 h-full w-0.5 bg-zinc-400"
            style={{ left: `${leagueAvg}%` }}
            title={`League avg ${leagueAvg}%`}
          />
        ) : null}
      </div>
      {leagueAvg ? (
        <p className="mt-1 text-[0.58rem] uppercase tracking-[0.14em] text-zinc-600">League Avg {leagueAvg}%</p>
      ) : null}
    </div>
  );
}

export function FighterCardHero({
  athlete,
  identity,
  orderCount,
}: {
  athlete: AthleteCredentialProfile;
  identity: ProfileIdentity;
  orderCount: number;
}) {
  const primaryStat = getPrimaryStatLabel(identity, orderCount);

  return (
    <div className="glass-panel rounded-[1.5rem] p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-[#FF1010]">Fighter Card</p>
          <h2 className="font-display mt-1 text-3xl uppercase text-white sm:text-4xl">
            {athlete.rank} {athlete.division}
          </h2>
        </div>
        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-emerald-300">
          {athlete.status}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <StatBlock accent label="Current Rank" value={athlete.rank} />
        <StatBlock label="Record" value={athlete.record} />
        <StatBlock label="Division" value={athlete.division} />
        <StatBlock label="Team" value={athlete.team} />
        <StatBlock label="Win Rate" value={`${athlete.winRate}%`} />
        <StatBlock label={primaryStat.label} value={primaryStat.value} />
      </div>

      <div className="mt-5 grid gap-3 border-t border-white/10 pt-5 sm:grid-cols-3 lg:grid-cols-6">
        <MiniStat label="KO Wins" sub={`${Math.round((athlete.koWins / Math.max(athlete.wins, 1)) * 100)}%`} value={`${athlete.koWins}`} />
        <MiniStat label="Sub Wins" sub={`${Math.round((athlete.submissionWins / Math.max(athlete.wins, 1)) * 100)}%`} value={`${athlete.submissionWins}`} />
        <MiniStat label="Dec Wins" sub={`${Math.round((athlete.decisionWins / Math.max(athlete.wins, 1)) * 100)}%`} value={`${athlete.decisionWins}`} />
        <MiniStat label="Finish Rate" value={`${athlete.finishRate}%`} />
        <MiniStat label="Matches" value={`${athlete.matchCount}`} />
        <MiniStat label="Win Streak" value={`${athlete.winStreak ?? 0}`} />
      </div>
    </div>
  );
}

function MiniStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2">
      <p className="text-[0.58rem] font-black uppercase tracking-[0.14em] text-zinc-500">{label}</p>
      <p className="font-display text-xl text-white">
        {value}
        {sub ? <span className="ml-1 text-sm text-zinc-500">/ {sub}</span> : null}
      </p>
    </div>
  );
}

export function PhysicalAttributesCard({ athlete }: { athlete: AthleteCredentialProfile }) {
  const rows = [
    ["Height", athlete.physical.height],
    ["Weight", athlete.physical.weight],
    ["Reach", athlete.physical.reach],
    ["Stance", athlete.physical.stance],
    ["Weapon Specialty", athlete.physical.weaponSpecialty],
    ["Fight Style", athlete.physical.fightStyle],
    ["Team", athlete.team],
    ["Gym", athlete.gym],
    ["Country", athlete.country],
  ] as const;

  return (
    <div className="glass-panel rounded-[1.5rem] p-5 sm:p-6">
      <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-[#FF1010]">Physical Attributes</p>
      <h3 className="font-display mt-1 text-2xl uppercase text-white">Fighting Profile</h3>
      <dl className="mt-5 divide-y divide-white/10">
        {rows.map(([label, value]) => (
          <div className="flex items-center justify-between gap-4 py-3" key={label}>
            <dt className="text-sm text-zinc-500">{label}</dt>
            <dd className="text-right text-sm font-semibold text-white">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function FightHistorySection({ athlete }: { athlete: AthleteCredentialProfile }) {
  return (
    <div className="glass-panel rounded-[1.5rem] p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-[#FF1010]">Fight History</p>
          <h3 className="font-display mt-1 text-2xl uppercase text-white">Official Bout Record</h3>
        </div>
        {athlete.slug ? (
          <Link className="text-xs font-black uppercase tracking-[0.16em] text-red-200" href={`/fighters/${athlete.slug}`}>
            Public Profile →
          </Link>
        ) : null}
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500">
              <th className="pb-3 pr-4">Result</th>
              <th className="pb-3 pr-4">Opponent</th>
              <th className="pb-3 pr-4">Method</th>
              <th className="pb-3 pr-4">Event</th>
              <th className="pb-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {athlete.fightHistory.map((fight) => (
              <tr className="border-b border-white/5" key={`${fight.opponent}-${fight.date}`}>
                <td className="py-3 pr-4">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[0.62rem] font-black uppercase tracking-[0.14em] ${
                      fight.result === "Win"
                        ? "bg-emerald-500/15 text-emerald-300"
                        : fight.result === "Loss"
                          ? "bg-red-500/15 text-red-300"
                          : "bg-zinc-500/15 text-zinc-300"
                    }`}
                  >
                    {fight.result}
                  </span>
                </td>
                <td className="py-3 pr-4 font-semibold text-white">{fight.opponent}</td>
                <td className="py-3 pr-4 text-zinc-400">{fight.method}</td>
                <td className="py-3 pr-4 text-zinc-400">{fight.event}</td>
                <td className="py-3 text-zinc-500">{fight.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function FighterAnalyticsSection({ athlete }: { athlete: AthleteCredentialProfile }) {
  const { analytics, statistics } = athlete;

  return (
    <div className="glass-panel rounded-[1.5rem] p-5 sm:p-6">
      <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-[#FF1010]">Career Statistics</p>
      <h3 className="font-display mt-1 text-2xl uppercase text-white">Fighter Analytics</h3>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">Striking</p>
          <AnalyticsBar label="Accuracy" leagueAvg={analytics.leagueAvgStriking} value={analytics.strikingAccuracy} />
          <AnalyticsBar label="Defensive Rate" leagueAvg={analytics.leagueAvgDefensive} value={analytics.defensiveRate} />
          <AnalyticsBar label="Takedown Defense" leagueAvg={analytics.leagueAvgTakedown} value={analytics.takedownDefense} />
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-sm font-semibold text-white">Average Points / Fight</p>
            <p className="font-display mt-2 text-3xl text-white">{analytics.averagePoints}</p>
            {analytics.leagueAvgPoints ? (
              <p className="mt-1 text-[0.58rem] uppercase tracking-[0.14em] text-zinc-600">
                League Avg {analytics.leagueAvgPoints}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            ["Knockouts", statistics.knockouts],
            ["Submissions", statistics.submissions],
            ["Decisions", statistics.decisions],
            ["Avg Fight Time", statistics.avgFightTime],
            ["Weapon Round Wins", statistics.weaponRoundWins],
            ["Avg Points", analytics.averagePoints],
          ].map(([label, value]) => (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4" key={label}>
              <p className="text-[0.58rem] font-black uppercase tracking-[0.14em] text-zinc-500">{label}</p>
              <p className="font-display mt-2 text-2xl text-white">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AchievementsSection({ athlete }: { athlete: AthleteCredentialProfile }) {
  return (
    <div className="glass-panel rounded-[1.5rem] p-5 sm:p-6">
      <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-[#FF1010]">Achievements</p>
      <h3 className="font-display mt-1 text-2xl uppercase text-white">Career Honors</h3>
      <ul className="mt-5 space-y-3">
        {athlete.achievements.map((achievement) => (
          <li className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3" key={achievement}>
            <span className="text-lg" aria-hidden>
              🏆
            </span>
            <span className="font-semibold text-white">{achievement}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FighterIdentityDashboard({
  identity,
  orderCount,
}: {
  identity: ProfileIdentity;
  orderCount: number;
}) {
  if (!identity.athlete) {
    return null;
  }

  const athlete = identity.athlete;

  return (
    <div className="space-y-6">
      <FighterCardHero athlete={athlete} identity={identity} orderCount={orderCount} />
      <div className="grid gap-6 xl:grid-cols-2">
        <PhysicalAttributesCard athlete={athlete} />
        <AchievementsSection athlete={athlete} />
      </div>
      <FightHistorySection athlete={athlete} />
      <FighterAnalyticsSection athlete={athlete} />
    </div>
  );
}
