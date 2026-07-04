"use client";

import Image from "next/image";
import Link from "next/link";
import type { FighterProfileView } from "@/lib/profile/fighter-profile-view";

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-[0.62rem] font-black uppercase tracking-[0.28em] text-red-200">{eyebrow}</p>
      <h2 className="font-display mt-2 text-3xl uppercase text-white sm:text-4xl">{title}</h2>
    </div>
  );
}

function StatTile({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="border-r border-white/10 px-4 py-4 last:border-r-0">
      <p className={`font-display text-3xl leading-none sm:text-4xl ${accent ? "text-[#FF1010]" : "text-white"}`}>{value}</p>
      <p className="mt-2 text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">{label}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/5 py-3 last:border-b-0">
      <dt className="text-sm text-zinc-500">{label}</dt>
      <dd className="text-right text-sm font-semibold text-white">{value}</dd>
    </div>
  );
}

export function ProfileFighterPublicProfile({ view }: { view: FighterProfileView }) {
  const { athlete } = view;
  const record = athlete.record.replace(/-0$/, "");
  const streak = athlete.winStreak ?? 0;

  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <SectionHeader eyebrow="Latayology" title="Fighter Overview" />
        <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.02]">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4">
            <StatTile accent label="Professional Record" value={record} />
            <StatTile label="Weight Class" value={athlete.division} />
            <StatTile label="National Ranking" value={view.rankings.national} />
            <StatTile label="Gym" value={athlete.gym} />
            <StatTile label="Coach" value={view.coach} />
            <StatTile label="Nationality" value={view.countryLabel} />
            <StatTile label="Stance" value={athlete.physical.stance} />
            <StatTile label="Age" value={`${view.age}`} />
            <StatTile label="Height" value={athlete.physical.height} />
            <StatTile label="Reach" value={athlete.physical.reach} />
            <StatTile label="License" value={view.licenseCode} />
            <StatTile label="Status" value={view.fighterInformation.licenseStatus} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.02] p-4">
            <p className="text-[0.58rem] font-black uppercase tracking-[0.14em] text-zinc-500">Current Ranking</p>
            <p className="mt-2 text-sm text-zinc-400">National</p>
            <p className="font-display text-3xl text-white">{view.rankings.national}</p>
            <p className="mt-3 text-sm text-zinc-400">Regional</p>
            <p className="font-display text-2xl text-white">{view.rankings.regional}</p>
            <p className="mt-3 text-sm text-zinc-400">International</p>
            <p className="font-display text-2xl text-white">{view.rankings.international}</p>
          </div>
          {streak > 0 ? (
            <div className="rounded-[1.25rem] border border-orange-500/20 bg-orange-500/5 p-4 sm:col-span-1">
              <p className="text-[0.58rem] font-black uppercase tracking-[0.14em] text-orange-200">Current Streak</p>
              <p className="font-display mt-3 text-4xl uppercase text-white">{streak} Wins</p>
            </div>
          ) : null}
        </div>
      </section>

      <section className="space-y-5">
        <SectionHeader eyebrow="About" title="Biography" />
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.02] p-6 sm:p-8">
          <p className="text-base leading-8 text-zinc-300">{view.biography}</p>
        </div>
      </section>

      <section className="space-y-5">
        <SectionHeader eyebrow="Physical Profile" title="Tale of the Tape" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {view.taleOfTheTape.map((entry) => (
            <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.02] px-4 py-5 text-center" key={entry.label}>
              <p className="font-display text-3xl uppercase text-white">{entry.value}</p>
              <p className="mt-2 text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">{entry.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <SectionHeader eyebrow="Style" title="Signature Techniques" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Primary Style", view.signatureStyle.primaryStyle],
            ["Secondary Style", view.signatureStyle.secondaryStyle],
            ["Favorite Weapon", view.signatureStyle.favoriteWeapon],
            ["Stance", view.signatureStyle.stance],
            ["Finish Preference", view.signatureStyle.finishPreference],
          ].map(([label, value]) => (
            <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.02] px-4 py-5" key={label}>
              <p className="text-[0.58rem] font-black uppercase tracking-[0.14em] text-zinc-500">{label}</p>
              <p className="mt-2 text-sm font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <SectionHeader eyebrow="Career" title="Statistics" />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="overflow-hidden rounded-[1.5rem] border border-white/10">
            <div className="grid grid-cols-2 sm:grid-cols-3">
              {view.careerSnapshot.map((stat) => (
                <StatTile key={stat.label} label={stat.label} value={stat.value} />
              ))}
            </div>
          </div>
          <div className="overflow-hidden rounded-[1.5rem] border border-white/10">
            {[
              ["Professional Record", record],
              ["KO Rate", `${view.koRate}%`],
              ["Average Fight Time", view.avgFightTime],
              ["Win Rate", `${view.winRate}%`],
              ["Finish Rate", `${view.finishRate}%`],
            ].map(([label, value], index, rows) => (
              <div className={`px-5 py-5 ${index < rows.length - 1 ? "border-b border-white/10" : ""}`} key={label}>
                <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">{label}</p>
                <p className="font-display mt-2 text-4xl uppercase leading-none text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <SectionHeader eyebrow="Fighter Information" title="Affiliation" />
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.02] px-5 py-2 sm:px-6">
          <dl>
            {Object.entries(view.fighterInformation).map(([key, value]) => (
              <InfoRow
                key={key}
                label={key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase())}
                value={value}
              />
            ))}
          </dl>
        </div>
      </section>

      <section className="space-y-5">
        <SectionHeader eyebrow="Career Honors" title="Titles & Awards" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {view.careerHonors.map((honor) => (
            <div
              className="rounded-[1.25rem] border border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 to-black px-5 py-4"
              key={honor.label}
            >
              <p className="text-lg font-black uppercase tracking-[0.06em] text-white">{honor.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <SectionHeader eyebrow="Official Record" title="Fight Record" />
        <div className="space-y-3">
          {view.fightTimeline.map((fight) => (
            <article
              className="grid gap-0 overflow-hidden rounded-[1.25rem] border border-white/10 bg-white/[0.02] lg:grid-cols-[7rem_1fr_auto]"
              key={`${fight.event}-${fight.date}-${fight.opponent}`}
            >
              <div className={`relative min-h-[8rem] bg-gradient-to-br ${fight.posterTone} lg:min-h-full`}>
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative flex h-full flex-col justify-end p-3">
                  <p className="font-display text-sm uppercase leading-tight text-white">{fight.event}</p>
                </div>
              </div>
              <div className="px-4 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[0.56rem] font-black uppercase tracking-[0.12em] ${
                      fight.result === "Win"
                        ? "bg-emerald-500/15 text-emerald-300"
                        : fight.result === "Loss"
                          ? "bg-red-500/15 text-red-300"
                          : "bg-zinc-500/15 text-zinc-300"
                    }`}
                  >
                    {fight.result}
                  </span>
                  <span className="text-sm font-semibold text-white">{fight.opponent}</span>
                </div>
                <p className="mt-2 text-sm text-zinc-400">
                  {fight.finishType ?? fight.method}
                  {fight.round ? ` · ${fight.round}` : ""}
                </p>
                <p className="mt-1 text-sm uppercase tracking-[0.12em] text-zinc-500">{fight.date}</p>
              </div>
              <div className="flex items-center border-t border-white/10 px-4 py-3 lg:border-l lg:border-t-0">
                <button className="text-[0.58rem] font-black uppercase tracking-[0.14em] text-red-200" type="button">
                  Fight Details →
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <SectionHeader eyebrow="Media" title="Career Gallery" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {view.gallery.map((photo) => (
            <article className="group relative aspect-square overflow-hidden rounded-[1.1rem] border border-white/10" key={photo.id}>
              <Image alt={photo.category} className="object-cover transition duration-500 group-hover:scale-105" fill sizes="(max-width:768px) 50vw, 33vw" src={photo.image} />
              <div className={`absolute inset-0 bg-gradient-to-t ${photo.tone}`} />
              <div className="absolute inset-x-0 bottom-0 p-3">
                <p className="text-[0.56rem] font-black uppercase tracking-[0.14em] text-red-200">{photo.category}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <SectionHeader eyebrow="Discover" title="Related Fighters" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {view.relatedFighters.map((fighter) => (
            <article className="rounded-[1.25rem] border border-white/10 bg-white/[0.02] p-5" key={fighter.name}>
              {fighter.slug ? (
                <Link className="font-display text-2xl uppercase text-white transition hover:text-[#FF1010]" href={`/fighters/${fighter.slug}`}>
                  {fighter.name}
                </Link>
              ) : (
                <p className="font-display text-2xl uppercase text-white">{fighter.name}</p>
              )}
              <p className="mt-2 text-sm text-zinc-400">
                {fighter.record} · {fighter.division}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
