"use client";

import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { CompetitionEntryRecord } from "@/lib/platform/competitions-server";
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

function entryStatusTone(status: string): "success" | "warning" | "neutral" | "danger" {
  const normalized = status.toLowerCase();
  if (normalized.includes("approved") || normalized.includes("confirmed")) return "success";
  if (normalized.includes("pending") || normalized.includes("review")) return "warning";
  if (normalized.includes("reject") || normalized.includes("cancel")) return "danger";
  return "neutral";
}

export function MemberCompetitionEntriesPanel() {
  const supabaseReady = isSupabaseConfigured();
  const [entries, setEntries] = useState<CompetitionEntryRecord[]>([]);
  const [loading, setLoading] = useState(supabaseReady);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(!supabaseReady);
  const [eventTitle, setEventTitle] = useState("");
  const [division, setDivision] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadEntries = useCallback(async (options?: { showLoading?: boolean }) => {
    if (!supabaseReady) return;

    if (options?.showLoading) {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await platformFetch("/api/competition-entries");
      const payload = (await response.json()) as { entries?: CompetitionEntryRecord[]; error?: string };

      if (isSupabaseUnavailableResponse(response.status)) {
        setUnavailable(true);
        return;
      }

      if (!response.ok) {
        throw new Error(payload.error || "Unable to load entries.");
      }

      setEntries(payload.entries ?? []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load entries.");
    } finally {
      setLoading(false);
    }
  }, [supabaseReady]);

  useEffect(() => {
    if (!supabaseReady) return;

    let cancelled = false;

    void platformFetch("/api/competition-entries")
      .then(async (response) => {
        const payload = (await response.json()) as { entries?: CompetitionEntryRecord[]; error?: string };
        if (cancelled) return;

        if (isSupabaseUnavailableResponse(response.status)) {
          setUnavailable(true);
          return;
        }

        if (!response.ok) {
          throw new Error(payload.error || "Unable to load entries.");
        }

        setEntries(payload.entries ?? []);
        setError(null);
      })
      .catch((caught) => {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "Unable to load entries.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [supabaseReady]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!eventTitle.trim() || !division.trim()) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await platformFetch("/api/competition-entries", {
        method: "POST",
        body: JSON.stringify({ eventTitle, division }),
      });
      const payload = (await response.json()) as { entry?: CompetitionEntryRecord; error?: string };

      if (isSupabaseUnavailableResponse(response.status)) {
        setUnavailable(true);
        return;
      }

      if (!response.ok) {
        throw new Error(payload.error || "Unable to submit entry.");
      }

      if (payload.entry) {
        setEntries((current) => [payload.entry!, ...current]);
      } else {
        await loadEntries({ showLoading: true });
      }

      setEventTitle("");
      setDivision("");
    } catch (caught) {
      setSubmitError(caught instanceof Error ? caught.message : "Unable to submit entry.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <MemberPanelShell
      description="View sanctioned competition entries, bout assignments, and registration status."
      title="Competition Entries"
    >
      {unavailable ? <SupabaseUnavailableNotice /> : null}

      {!unavailable ? (
        <form className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]" onSubmit={handleSubmit}>
          <input
            className="min-h-11 rounded-full border border-white/10 bg-black/40 px-4 text-sm text-white outline-none ring-red-500/30 placeholder:text-zinc-600 focus:ring-4"
            onChange={(event) => setEventTitle(event.target.value)}
            placeholder="Event title"
            value={eventTitle}
          />
          <input
            className="min-h-11 rounded-full border border-white/10 bg-black/40 px-4 text-sm text-white outline-none ring-red-500/30 placeholder:text-zinc-600 focus:ring-4"
            onChange={(event) => setDivision(event.target.value)}
            placeholder="Division"
            value={division}
          />
          <button
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-[#FF1010] px-5 text-xs font-black uppercase tracking-[0.14em] text-white disabled:opacity-50"
            disabled={submitting || !eventTitle.trim() || !division.trim()}
            type="submit"
          >
            <Plus size={14} aria-hidden />
            Submit
          </button>
          {submitError ? <p className="sm:col-span-3 text-sm text-red-200">{submitError}</p> : null}
        </form>
      ) : null}

      <div className="mt-6 space-y-3">
        {loading ? <PanelLoadingState /> : null}
        {error ? <PanelErrorState message={error} /> : null}

        {!loading && !error && !unavailable && entries.length === 0 ? (
          <PanelEmptyState message="No competition entries yet. Submit an event and division above to register." />
        ) : null}

        {!loading && !error && entries.length > 0
          ? entries.map((entry) => (
              <div className="rounded-[1.25rem] border border-white/10 bg-black/30 p-4 sm:p-5" key={entry.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{entry.eventTitle}</p>
                    <p className="mt-1 text-sm text-zinc-400">{entry.division}</p>
                  </div>
                  <StatusBadge label={entry.status || "Submitted"} tone={entryStatusTone(entry.status)} />
                </div>
                <p className="mt-3 text-xs text-zinc-500">Submitted {formatPanelDate(entry.createdAt)}</p>
                {entry.notes ? <p className="mt-2 text-sm text-zinc-400">{entry.notes}</p> : null}
              </div>
            ))
          : null}
      </div>
    </MemberPanelShell>
  );
}
