"use client";

import { useEffect, useState } from "react";
import type { AthleteCredentialProfile } from "@/data/profile-credentials";
import type { FightRecordEntry } from "@/lib/platform/fight-records-server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isSupabaseUnavailableResponse, platformFetch } from "@/lib/platform/client";
import {
  MemberPanelShell,
  PanelEmptyState,
  PanelErrorState,
  PanelLoadingState,
  StatusBadge,
  SupabaseUnavailableNotice,
  formatPanelDate,
} from "@/components/profile/member-workspace/shared";

function slugifyName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

function resultTone(result: string): "success" | "warning" | "neutral" | "danger" {
  const normalized = result.toLowerCase();
  if (normalized.includes("win")) return "success";
  if (normalized.includes("loss")) return "danger";
  if (normalized.includes("draw")) return "warning";
  return "neutral";
}

export function MemberRankingsPanel({
  athlete,
  fighterName,
}: {
  athlete: AthleteCredentialProfile;
  fighterName: string;
}) {
  const supabaseReady = isSupabaseConfigured();
  const slug = athlete.slug ?? slugifyName(fighterName);
  const [records, setRecords] = useState<FightRecordEntry[]>([]);
  const [loading, setLoading] = useState(supabaseReady);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(!supabaseReady);

  useEffect(() => {
    if (!supabaseReady) return;

    let cancelled = false;

    void platformFetch(`/api/fight-records/${encodeURIComponent(slug)}`)
      .then(async (response) => {
        const payload = (await response.json()) as { records?: FightRecordEntry[]; error?: string };
        if (cancelled) return;

        if (isSupabaseUnavailableResponse(response.status)) {
          setUnavailable(true);
          return;
        }

        if (!response.ok) {
          throw new Error(payload.error || "Unable to load fight records.");
        }

        setRecords(payload.records ?? []);
      })
      .catch((caught) => {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "Unable to load fight records.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [supabaseReady, slug]);

  const hasIdentityRank = Boolean(athlete.rank?.trim());
  const hasBackendRecords = records.length > 0;

  return (
    <MemberPanelShell
      description="Rankings and sanctioned results from JTGC competition records."
      title="Rankings"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
          <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">League Rank</p>
          <p className="font-display mt-2 text-3xl uppercase text-white">{hasIdentityRank ? athlete.rank : "Unranked"}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
          <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">Record</p>
          <p className="font-display mt-2 text-3xl uppercase text-white">{athlete.record || "—"}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
          <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">Division</p>
          <p className="mt-2 text-sm font-semibold text-white">{athlete.division || "—"}</p>
        </div>
      </div>

      {!hasIdentityRank ? (
        <p className="mt-4 text-sm text-zinc-500">
          No official league rank is on file yet. Rankings update after sanctioned competition results are recorded.
        </p>
      ) : (
        <p className="mt-4 text-sm text-zinc-400">
          Current league rank from your athlete profile: {athlete.rank}. Results below reflect recorded JTGC bouts when
          available.
        </p>
      )}

      <div className="mt-6 space-y-3">
        <h3 className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-zinc-400">Sanctioned Fight Records</h3>
        {unavailable ? <SupabaseUnavailableNotice /> : null}
        {loading ? <PanelLoadingState /> : null}
        {error ? <PanelErrorState message={error} /> : null}

        {!loading && !error && !unavailable && !hasBackendRecords ? (
          <PanelEmptyState message="No backend fight records found for this profile yet. Identity stats above reflect your current athlete profile." />
        ) : null}

        {!loading && !error && hasBackendRecords
          ? records.map((record) => (
              <div className="rounded-[1.25rem] border border-white/10 bg-black/30 p-4 sm:p-5" key={record.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">vs {record.opponentName}</p>
                    <p className="mt-1 text-sm text-zinc-400">{record.eventTitle}</p>
                  </div>
                  <StatusBadge label={record.result || "Recorded"} tone={resultTone(record.result)} />
                </div>
                <p className="mt-3 text-xs text-zinc-500">
                  {formatPanelDate(record.eventDate)}
                  {record.method ? ` • ${record.method}` : ""}
                  {record.round ? ` • Round ${record.round}` : ""}
                </p>
              </div>
            ))
          : null}
      </div>
    </MemberPanelShell>
  );
}
