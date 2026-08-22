"use client";

import Link from "next/link";
import { Plus, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { CoachRosterLink } from "@/lib/platform/coach-roster-server";
import type { OfficialAssignmentRecord } from "@/lib/platform/officials-server";
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

function assignmentStatusTone(status: string): "success" | "warning" | "neutral" | "danger" {
  const normalized = status.toLowerCase();
  if (normalized.includes("confirm") || normalized.includes("complete")) return "success";
  if (normalized.includes("pending") || normalized.includes("assigned")) return "warning";
  if (normalized.includes("cancel") || normalized.includes("declin")) return "danger";
  return "neutral";
}

function CoachRosterTools() {
  const supabaseReady = isSupabaseConfigured();
  const [roster, setRoster] = useState<CoachRosterLink[]>([]);
  const [loading, setLoading] = useState(supabaseReady);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(!supabaseReady);
  const [fighterName, setFighterName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadRoster = useCallback(async (options?: { showLoading?: boolean }) => {
    if (!supabaseReady) return;

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
        throw new Error(payload.error || "Unable to load roster.");
      }

      setRoster(payload.roster ?? []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load roster.");
    } finally {
      setLoading(false);
    }
  }, [supabaseReady]);

  useEffect(() => {
    if (!supabaseReady) return;

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
          throw new Error(payload.error || "Unable to load roster.");
        }

        setRoster(payload.roster ?? []);
        setError(null);
      })
      .catch((caught) => {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "Unable to load roster.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [supabaseReady]);

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
    <div className="space-y-4">
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
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-[#FF1010] px-4 text-xs font-black uppercase tracking-[0.14em] text-white disabled:opacity-50"
            disabled={submitting || !fighterName.trim()}
            onClick={() => void handleAddFighter()}
            type="button"
          >
            <Plus size={14} aria-hidden />
            Link
          </button>
        </div>
      ) : null}

      {loading ? <PanelLoadingState /> : null}
      {error ? <PanelErrorState message={error} /> : null}

      {!loading && !error && !unavailable && roster.length === 0 ? (
        <PanelEmptyState message="No fighters linked yet. Add athletes you coach to manage your camp roster." />
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
  );
}

function OfficialAssignmentsTools() {
  const supabaseReady = isSupabaseConfigured();
  const [assignments, setAssignments] = useState<OfficialAssignmentRecord[]>([]);
  const [loading, setLoading] = useState(supabaseReady);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(!supabaseReady);

  useEffect(() => {
    if (!supabaseReady) return;

    let cancelled = false;

    void platformFetch("/api/member/official-assignments")
      .then(async (response) => {
        const payload = (await response.json()) as {
          assignments?: OfficialAssignmentRecord[];
          error?: string;
        };
        if (cancelled) return;

        if (isSupabaseUnavailableResponse(response.status)) {
          setUnavailable(true);
          return;
        }

        if (!response.ok) {
          throw new Error(payload.error || "Unable to load assignments.");
        }

        setAssignments(payload.assignments ?? []);
      })
      .catch((caught) => {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "Unable to load assignments.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [supabaseReady]);

  return (
    <div className="space-y-4">
      {unavailable ? <SupabaseUnavailableNotice /> : null}
      {loading ? <PanelLoadingState /> : null}
      {error ? <PanelErrorState message={error} /> : null}

      {!loading && !error && !unavailable && assignments.length === 0 ? (
        <PanelEmptyState message="No official assignments on file yet. Event assignments appear here when scheduled by league staff." />
      ) : null}

      {!loading && !error && assignments.length > 0
        ? assignments.map((assignment) => (
            <div className="rounded-[1.25rem] border border-white/10 bg-black/30 p-4 sm:p-5" key={assignment.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{assignment.eventTitle}</p>
                  <p className="mt-1 text-sm text-zinc-400">{assignment.role}</p>
                </div>
                <StatusBadge label={assignment.status || "Assigned"} tone={assignmentStatusTone(assignment.status)} />
              </div>
              <p className="mt-3 text-xs text-zinc-500">Assigned {formatPanelDate(assignment.createdAt)}</p>
              {assignment.notes ? <p className="mt-2 text-sm text-zinc-400">{assignment.notes}</p> : null}
            </div>
          ))
        : null}
    </div>
  );
}

export function RoleToolsPanel({
  variant,
}: {
  variant: "coach" | "official" | "judge" | "council" | "staff";
}) {
  const copy =
    variant === "coach"
      ? {
          eyebrow: "Identity Tools",
          title: "Coach Tools",
          description: "Manage coaching credentials, athlete assignments, and certification visibility.",
        }
      : variant === "official"
        ? {
            eyebrow: "Identity Tools",
            title: "Official Tools",
            description: "Access referee assignments, bout oversight tools, and official credential controls.",
          }
        : variant === "judge"
          ? {
              eyebrow: "Identity Tools",
              title: "Judge Tools",
              description: "Review scoring assignments, judge credentials, and sanctioned event access.",
            }
          : variant === "council"
            ? {
                eyebrow: "Identity Tools",
                title: "Council Tools",
                description: "Grand Council governance tools, league oversight, and membership administration.",
              }
            : {
                eyebrow: "Identity Tools",
                title: "Staff Tools",
                description: "Staff operations, event support workflows, and internal league utilities.",
              };

  return (
    <MemberPanelShell description={copy.description} eyebrow={copy.eyebrow} title={copy.title}>
      {variant === "coach" ? <CoachRosterTools /> : null}
      {variant === "official" || variant === "judge" ? <OfficialAssignmentsTools /> : null}
      {variant === "council" || variant === "staff" ? (
        <PanelEmptyState
          href="/register-for-license"
          linkLabel="Manage License"
          message="Specialized tools for this role are managed through league staff workflows. Keep your license current to unlock access."
        />
      ) : null}
    </MemberPanelShell>
  );
}
