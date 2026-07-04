"use client";

import { AlertTriangle, CheckCircle2, Clock3 } from "lucide-react";
import type { ReactNode } from "react";
import { ProfileCommandCenter } from "@/components/profile/dashboard/ProfileCommandCenter";
import type { FighterProfileView } from "@/lib/profile/fighter-profile-view";
import type { MemberRecord } from "@/lib/profile/member-record";
import type { ProfileSectionId } from "@/components/profile/ProfileSidebarNav";

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-[0.62rem] font-black uppercase tracking-[0.28em] text-red-200">{eyebrow}</p>
      <h2 className="font-display mt-2 text-3xl uppercase text-white sm:text-4xl">{title}</h2>
      <p className="mt-2 text-sm text-zinc-400">Private workspace for licensing, medical clearance, and fight preparation.</p>
    </div>
  );
}

function WeightCutCard({ view }: { view: FighterProfileView }) {
  const { weightCut } = view;
  const toLose = Math.max(weightCut.currentKg - weightCut.targetKg, 0);

  return (
    <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.02] p-5">
      <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">Weight Cut</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
        <div>
          <p className="text-[0.58rem] font-black uppercase tracking-[0.14em] text-zinc-500">Current</p>
          <p className="font-display mt-1 text-4xl text-white">{weightCut.currentKg}kg</p>
        </div>
        <p className="hidden text-2xl text-zinc-600 sm:block">↓</p>
        <div>
          <p className="text-[0.58rem] font-black uppercase tracking-[0.14em] text-zinc-500">Need to Lose</p>
          <p className="font-display mt-1 text-4xl text-[#FF1010]">{toLose}kg</p>
        </div>
        <p className="hidden text-2xl text-zinc-600 sm:block">↓</p>
        <div>
          <p className="text-[0.58rem] font-black uppercase tracking-[0.14em] text-zinc-500">Target</p>
          <p className="font-display mt-1 text-4xl text-white">{weightCut.targetKg}kg</p>
        </div>
      </div>
      <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#FF1010] to-red-400"
          style={{ width: `${weightCut.progressPercent}%` }}
        />
      </div>
    </article>
  );
}

export function ProfileFighterPrivateDashboard({
  view,
  memberRecord,
  onNavigate,
  onAction,
  credentialSlot,
  documentsSlot,
}: {
  view: FighterProfileView;
  memberRecord: MemberRecord;
  onNavigate: (section: ProfileSectionId) => void;
  onAction: (href?: string, section?: ProfileSectionId) => void;
  credentialSlot?: ReactNode;
  documentsSlot?: ReactNode;
}) {
  const camp = view.fightCamp;

  return (
    <div className="space-y-10">
      <SectionHeader eyebrow="Private Dashboard" title="Fight Camp" />

      {camp ? (
        <section className="overflow-hidden rounded-[1.75rem] border border-[#FF1010]/30 bg-gradient-to-br from-[#FF1010]/10 via-black to-black p-6 sm:p-8">
          <p className="text-[0.62rem] font-black uppercase tracking-[0.28em] text-red-200">Fight Camp</p>
          <h3 className="font-display mt-2 text-4xl uppercase text-white sm:text-5xl">{camp.daysRemaining} Days Remaining</h3>
          <p className="mt-2 text-sm text-zinc-400">
            {view.upcomingFight?.event} · vs {view.upcomingFight?.opponent}
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-[0.58rem] font-black uppercase tracking-[0.14em] text-zinc-500">Current Weight</p>
              <p className="font-display mt-2 text-3xl text-white">{view.weightCut.currentKg}kg</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-[0.58rem] font-black uppercase tracking-[0.14em] text-zinc-500">Target</p>
              <p className="font-display mt-2 text-3xl text-[#FF1010]">{view.weightCut.targetKg}kg</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-[0.58rem] font-black uppercase tracking-[0.14em] text-zinc-500">Camp Week</p>
              <p className="font-display mt-2 text-3xl text-white">
                Week {camp.campWeek} of {camp.totalWeeks}
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {camp.checklist.map((item) => (
              <article className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-4" key={item.label}>
                <div className="flex items-center gap-3">
                  {item.status === "complete" ? (
                    <CheckCircle2 className="text-emerald-300" size={18} aria-hidden />
                  ) : item.status === "pending" ? (
                    <AlertTriangle className="text-amber-300" size={18} aria-hidden />
                  ) : (
                    <Clock3 className="text-zinc-400" size={18} aria-hidden />
                  )}
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                </div>
                <p className="text-[0.58rem] font-black uppercase tracking-[0.12em] text-zinc-400">{item.dueLabel}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <ProfileCommandCenter memberRecord={memberRecord} onAction={onAction} />
      <WeightCutCard view={view} />

      {credentialSlot ? (
        <section className="space-y-4">
          <SectionHeader eyebrow="Credential" title="Digital Passport" />
          <div className="max-w-sm">{credentialSlot}</div>
        </section>
      ) : null}

      {documentsSlot ? (
        <section className="space-y-4">
          <SectionHeader eyebrow="Documents" title="Licensing & Medical" />
          {documentsSlot}
        </section>
      ) : null}
    </div>
  );
}
