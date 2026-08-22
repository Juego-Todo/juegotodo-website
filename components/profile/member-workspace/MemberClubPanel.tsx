"use client";

import Link from "next/link";
import { Users, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { MemberRecord } from "@/lib/profile/member-record";
import type { CoachRosterLink } from "@/lib/platform/coach-roster-server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isSupabaseUnavailableResponse, platformFetch } from "@/lib/platform/client";
import {
  MemberPanelShell,
  PanelEmptyState,
  PanelErrorState,
  PanelLoadingState,
  SupabaseUnavailableNotice,
  formatPanelDate,
} from "@/components/profile/member-workspace/shared";

function slugifyName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

export function MemberClubPanel({
  memberRecord,
  isCoach,
}: {
  memberRecord: MemberRecord;
  isCoach: boolean;
}) {
  const supabaseReady = isSupabaseConfigured();
  const [roster, setRoster] = useState<CoachRosterLink[]>([]);
  const [loading, setLoading] = useState(isCoach && supabaseReady);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(isCoach && !supabaseReady);
  const [fighterName, setFighterName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadRoster = useCallback(async (options?: { showLoading?: boolean }) => {
    if (!isCoach || !supabaseReady) return;

    if (options?.showLoading) {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await platformFetch("/api/coach-roster");
      const payload = (await response.json()) as { roster?: CoachRosterLink[]; error?: string };

      if (isSupabaseUnavailableResponse(response.status)) {
        setUnavailable(true);
        return;
      }

      if (!response.ok) {
        throw new Error(payload.error || "Unable to load coach roster.");
      }

      setRoster(payload.roster ?? []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load coach roster.");
    } finally {
      setLoading(false);
    }
  }, [isCoach, supabaseReady]);

  useEffect(() => {
    if (!isCoach || !supabaseReady) return;

    let cancelled = false;

    void platformFetch("/api/coach-roster")
      .then(async (response) => {
        const payload = (await response.json()) as { roster?: CoachRosterLink[]; error?: string };
        if (cancelled) return;

        if (isSupabaseUnavailableResponse(response.status)) {
          setUnavailable(true);
          return;
        }

        if (!response.ok) {
          throw new Error(payload.error || "Unable to load coach roster.");
        }

        setRoster(payload.roster ?? []);
        setError(null);
      })
      .catch((caught) => {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "Unable to load coach roster.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isCoach, supabaseReady]);

  async function handleAddFighter() {
    const name = fighterName.trim();
    if (!name) return;

    setSubmitting(true);
    try {
      const response = await platformFetch("/api/coach-roster", {
        method: "POST",
        body: JSON.stringify({ fighterName: name, fighterSlug: slugifyName(name) }),
      });
      const payload = (await response.json()) as { link?: CoachRosterLink; error?: string };

      if (isSupabaseUnavailableResponse(response.status)) {
        setUnavailable(true);
        return;
      }

      if (!response.ok) {
        throw new Error(payload.error || "Unable to link fighter.");
      }

      if (payload.link) {
        setRoster((current) => [payload.link!, ...current.filter((entry) => entry.id !== payload.link!.id)]);
      } else {
        await loadRoster({ showLoading: true });
      }
      setFighterName("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to link fighter.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemoveFighter(id: string) {
    try {
      const response = await platformFetch(`/api/coach-roster?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Unable to remove fighter.");
      }

      setRoster((current) => current.filter((entry) => entry.id !== id));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to remove fighter.");
    }
  }

  return (
    <MemberPanelShell
      description={`Official club affiliation: ${memberRecord.club}. Club management tools unlock for gym owners and coaches.`}
      title="Club"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
          <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">Club</p>
          <p className="mt-2 text-sm font-semibold text-white">{memberRecord.club}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
          <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">Region</p>
          <p className="mt-2 text-sm font-semibold text-white">{memberRecord.region}</p>
        </div>
      </div>

      {isCoach ? (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-zinc-400">Coach Roster</h3>
            <span className="text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-500">
              {roster.length} linked
            </span>
          </div>

          {unavailable ? <SupabaseUnavailableNotice /> : null}

          {!unavailable ? (
            <div className="flex gap-2">
              <input
                className="min-h-11 flex-1 rounded-full border border-white/10 bg-black/40 px-4 text-sm text-white outline-none ring-red-500/30 placeholder:text-zinc-600 focus:ring-4"
                onChange={(event) => setFighterName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    void handleAddFighter();
                  }
                }}
                placeholder="Fighter name"
                value={fighterName}
              />
              <button
                className="inline-flex min-h-11 items-center rounded-full bg-[#FF1010] px-4 text-xs font-black uppercase tracking-[0.14em] text-white disabled:opacity-50"
                disabled={submitting || !fighterName.trim()}
                onClick={() => void handleAddFighter()}
                type="button"
              >
                Link
              </button>
            </div>
          ) : null}

          {loading ? <PanelLoadingState /> : null}
          {error ? <PanelErrorState message={error} /> : null}

          {!loading && !error && !unavailable && roster.length === 0 ? (
            <PanelEmptyState message="No fighters linked yet. Add athletes you coach to build your camp roster." />
          ) : null}

          {!loading && roster.length > 0 ? (
            <ul className="space-y-2">
              {roster.map((entry) => (
                <li
                  className="flex items-center justify-between gap-3 rounded-[1.25rem] border border-white/10 bg-white/[0.02] px-4 py-3"
                  key={entry.id}
                >
                  <div className="min-w-0">
                    <Link
                      className="truncate text-sm font-semibold text-white hover:text-red-200"
                      href={`/fighters/${entry.fighterSlug}`}
                    >
                      {entry.fighterName}
                    </Link>
                    <p className="mt-0.5 text-xs text-zinc-500">Linked {formatPanelDate(entry.createdAt)}</p>
                  </div>
                  {!unavailable ? (
                    <button
                      aria-label={`Unlink ${entry.fighterName}`}
                      className="shrink-0 rounded-full border border-white/10 p-2 text-zinc-500 transition hover:border-red-500/40 hover:text-red-200"
                      onClick={() => void handleRemoveFighter(entry.id)}
                      type="button"
                    >
                      <X size={14} aria-hidden />
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : (
        <div className="mt-6 rounded-[1.25rem] border border-dashed border-white/10 px-4 py-6 text-center">
          <Users className="mx-auto text-zinc-600" size={22} aria-hidden />
          <p className="mt-2 text-sm text-zinc-500">
            Coach roster management is available for verified coaches. Apply for a coaching license to unlock camp tools.
          </p>
        </div>
      )}
    </MemberPanelShell>
  );
}
