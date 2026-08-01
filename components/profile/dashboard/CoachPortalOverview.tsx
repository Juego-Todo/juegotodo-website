"use client";

import { ArrowUpRight, FileText, Inbox, Plus, Search, Users, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { LicenseApplication } from "@/data/license-applications";
import type { UserProfile } from "@/lib/auth/types";
import {
  getCoachRoster,
  linkFighterToCoach,
  unlinkFighterFromCoach,
  type CoachRosterEntry,
} from "@/lib/profile/coach-roster";

export function CoachPortalOverview({
  user,
  licenseApplication,
  onOpenDocuments,
}: {
  user: UserProfile;
  licenseApplication: LicenseApplication | null;
  onOpenDocuments?: () => void;
}) {
  const [roster, setRoster] = useState<CoachRosterEntry[]>([]);
  const [fighterName, setFighterName] = useState("");

  useEffect(() => {
    setRoster(getCoachRoster(user.id));
  }, [user.id]);

  const coachingClub =
    user.gym.trim() ||
    licenseApplication?.backgroundAnswers?.coachingClub ||
    licenseApplication?.backgroundAnswers?.clubName ||
    null;

  function handleAddFighter() {
    const next = linkFighterToCoach(user.id, user.fullName, fighterName);
    setRoster([...next]);
    setFighterName("");
  }

  function handleRemoveFighter(entryId: string) {
    setRoster([...unlinkFighterFromCoach(user.id, entryId)]);
  }

  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-[1.75rem] p-5 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[0.62rem] font-black uppercase tracking-[0.28em] text-red-200">Coach Account</p>
            <h2 className="font-display mt-2 text-3xl uppercase text-white sm:text-4xl">Fight Camp</h2>
            <p className="mt-2 text-sm text-zinc-400">
              {coachingClub ? `Coaching out of ${coachingClub}. ` : ""}
              Manage your fighter roster and keep credentials up to date.
            </p>
          </div>
          <Link
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-white/15 px-5 text-xs font-black uppercase tracking-[0.14em] text-zinc-200 transition hover:border-red-500/40 hover:text-white"
            href="/latayanology"
          >
            <Search size={14} aria-hidden />
            Fighter Database
          </Link>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="glass-panel space-y-4 rounded-[1.75rem] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-zinc-400">My Fighters</h3>
            <span className="text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-500">
              {roster.length} linked
            </span>
          </div>

          <div className="flex gap-2">
            <input
              className="min-h-11 flex-1 rounded-full border border-white/10 bg-black/40 px-4 text-sm text-white outline-none ring-red-500/30 placeholder:text-zinc-600 focus:ring-4"
              onChange={(event) => setFighterName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleAddFighter();
                }
              }}
              placeholder="Fighter name"
              value={fighterName}
            />
            <button
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-[#FF1010] px-4 text-xs font-black uppercase tracking-[0.14em] text-white disabled:opacity-50"
              disabled={!fighterName.trim()}
              onClick={handleAddFighter}
              type="button"
            >
              <Plus size={14} aria-hidden />
              Link
            </button>
          </div>

          {roster.length === 0 ? (
            <div className="rounded-[1.25rem] border border-dashed border-white/10 px-4 py-6 text-center">
              <Users className="mx-auto text-zinc-600" size={22} aria-hidden />
              <p className="mt-2 text-sm text-zinc-500">
                No fighters linked yet. Add the fighters you coach to build your camp roster.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {roster.map((entry) => (
                <li
                  className="flex items-center justify-between gap-3 rounded-[1.25rem] border border-white/10 bg-white/[0.02] px-4 py-3"
                  key={entry.id}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{entry.fighterName}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      Linked {new Date(entry.addedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    aria-label={`Unlink ${entry.fighterName}`}
                    className="shrink-0 rounded-full border border-white/10 p-2 text-zinc-500 transition hover:border-red-500/40 hover:text-red-200"
                    onClick={() => handleRemoveFighter(entry.id)}
                    type="button"
                  >
                    <X size={14} aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-6">
          <section className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
            <h3 className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-zinc-400">Fight Offers</h3>
            <div className="mt-4 rounded-[1.25rem] border border-dashed border-white/10 px-4 py-6 text-center">
              <Inbox className="mx-auto text-zinc-600" size={22} aria-hidden />
              <p className="mt-2 text-sm text-zinc-500">
                Fight offers for your roster will land here once matchmaking opens.
              </p>
            </div>
          </section>

          <section className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
            <h3 className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-zinc-400">Quick Links</h3>
            <div className="mt-4 grid gap-3">
              <Link
                className="group flex items-center justify-between rounded-[1.25rem] border border-white/10 bg-white/[0.02] px-4 py-3 transition hover:border-red-500/30"
                href="/latayanology"
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Search className="text-red-200" size={16} aria-hidden />
                  LATAYANOLOGY Roster
                </span>
                <ArrowUpRight className="text-zinc-600 transition group-hover:text-red-200" size={14} aria-hidden />
              </Link>
              {onOpenDocuments ? (
                <button
                  className="group flex items-center justify-between rounded-[1.25rem] border border-white/10 bg-white/[0.02] px-4 py-3 text-left transition hover:border-red-500/30"
                  onClick={onOpenDocuments}
                  type="button"
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-white">
                    <FileText className="text-red-200" size={16} aria-hidden />
                    Licenses
                  </span>
                  <ArrowUpRight className="text-zinc-600 transition group-hover:text-red-200" size={14} aria-hidden />
                </button>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
