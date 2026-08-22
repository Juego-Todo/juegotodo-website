"use client";

import { CheckCircle2, Search, XCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminPortalHeader } from "@/components/admin/AdminPortalShell";
import { formatAdminDate, readAdminJson } from "@/components/admin/platform/admin-platform-utils";
import { adminFetch } from "@/lib/auth/admin-fetch";
import type { CompetitionEntryRecord } from "@/lib/platform/competitions-server";

type EntryFilter = "submitted" | "under_review" | "all";

function statusTone(status: string) {
  if (status === "approved") return "text-emerald-300";
  if (status === "rejected" || status === "withdrawn") return "text-red-300";
  if (status === "under_review") return "text-sky-300";
  return "text-amber-200";
}

export function AdminCompetitionsPanel() {
  const [entries, setEntries] = useState<CompetitionEntryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<EntryFilter>("submitted");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError("");
    try {
      const response = await adminFetch("/api/competition-entries?admin=1");
      const payload = await readAdminJson<{ entries?: CompetitionEntryRecord[] }>(
        response,
        "Unable to load competition entries.",
      );
      setEntries(
        (payload.entries ?? []).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load competition entries.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  async function setStatus(id: string, status: string) {
    setBusyId(id);
    setError("");
    try {
      const response = await adminFetch("/api/competition-entries", {
        method: "PATCH",
        body: JSON.stringify({ id, status }),
      });
      await readAdminJson(response, "Unable to update entry.");
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update entry.");
    } finally {
      setBusyId(null);
    }
  }

  const counts = useMemo(
    () => ({
      submitted: entries.filter((entry) => entry.status === "submitted").length,
      under_review: entries.filter((entry) => entry.status === "under_review").length,
      all: entries.length,
    }),
    [entries],
  );

  const filteredEntries = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return entries.filter((entry) => {
      if (filter === "submitted" && entry.status !== "submitted") return false;
      if (filter === "under_review" && entry.status !== "under_review") return false;
      if (!normalized) return true;
      const haystack = [entry.eventTitle, entry.division, entry.userId, entry.notes, entry.status]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [entries, filter, query]);

  const filters: { id: EntryFilter; label: string }[] = [
    { id: "submitted", label: `Submitted (${counts.submitted})` },
    { id: "under_review", label: `Under Review (${counts.under_review})` },
    { id: "all", label: `All (${counts.all})` },
  ];

  return (
    <div className="space-y-6">
      <AdminPortalHeader
        description="Manage sanctioned competition entries, bout assignments, and registration approvals."
        tag="Administration"
        title="Competitions"
      />

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
        <div className="rounded-[1.25rem] border border-amber-500/20 bg-amber-500/[0.06] px-3 py-3 sm:px-4 sm:py-4">
          <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-amber-200/70">Submitted</p>
          <p className="font-display mt-1 text-2xl text-white sm:text-3xl">{counts.submitted}</p>
        </div>
        <div className="rounded-[1.25rem] border border-sky-500/20 bg-sky-500/[0.06] px-3 py-3 sm:px-4 sm:py-4">
          <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-sky-200/70">Under Review</p>
          <p className="font-display mt-1 text-2xl text-white sm:text-3xl">{counts.under_review}</p>
        </div>
        <div className="col-span-2 rounded-[1.25rem] border border-white/10 bg-white/[0.02] px-3 py-3 sm:col-span-1 sm:px-4 sm:py-4">
          <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">Total Entries</p>
          <p className="font-display mt-1 text-2xl text-white sm:text-3xl">{counts.all}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.02] p-3">
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              className={`rounded-full px-3.5 py-2 text-[0.6rem] font-black uppercase tracking-[0.12em] transition ${
                filter === item.id
                  ? "bg-[#FF1010] text-white"
                  : "border border-white/10 text-zinc-400 hover:text-white"
              }`}
              key={item.id}
              onClick={() => setFilter(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
        <label className="relative block">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            size={14}
            aria-hidden
          />
          <input
            className="w-full rounded-xl border border-white/10 bg-black/40 py-2.5 pl-9 pr-3 text-sm text-white outline-none ring-red-500/30 placeholder:text-zinc-500 focus:ring-2"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search event, division, member id…"
            value={query}
          />
        </label>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-[1.75rem] border border-white/10 px-5 py-10 text-center text-sm text-zinc-400">
          Loading competition entries…
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="rounded-[1.75rem] border border-white/10 px-5 py-10 text-center text-sm text-zinc-400">
          {entries.length === 0 ? "No competition entries yet." : "No entries match this filter."}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry) => {
            const busy = busyId === entry.id;
            return (
              <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.02] p-5 sm:p-6" key={entry.id}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">{entry.division}</p>
                      <span className="rounded-full border border-white/10 px-2 py-0.5 text-[0.55rem] font-black uppercase tracking-[0.12em] text-zinc-500">
                        {entry.id.slice(0, 8)}
                      </span>
                    </div>
                    <p className="mt-2 font-semibold text-white">{entry.eventTitle}</p>
                    <p className="mt-1 text-sm text-zinc-400">Member: {entry.userId}</p>
                    {entry.notes ? <p className="mt-2 text-sm text-zinc-400">{entry.notes}</p> : null}
                    <p className="mt-2 text-xs text-zinc-500">{formatAdminDate(entry.createdAt)}</p>
                  </div>
                  <div className="shrink-0 text-left lg:text-right">
                    <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">Status</p>
                    <p className={`mt-1 text-lg font-semibold capitalize ${statusTone(entry.status)}`}>
                      {entry.status.replace("_", " ")}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                  {entry.status === "submitted" ? (
                    <button
                      className="rounded-full border border-white/10 px-3 py-1.5 text-[0.58rem] font-black uppercase tracking-[0.12em] text-zinc-400 transition hover:text-white disabled:opacity-60"
                      disabled={busy}
                      onClick={() => void setStatus(entry.id, "under_review")}
                      type="button"
                    >
                      Start Review
                    </button>
                  ) : null}
                  {!["approved", "rejected", "withdrawn"].includes(entry.status) ? (
                    <>
                      <button
                        className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-[0.62rem] font-black uppercase tracking-[0.14em] text-white transition hover:bg-emerald-500 disabled:opacity-60"
                        disabled={busy}
                        onClick={() => void setStatus(entry.id, "approved")}
                        type="button"
                      >
                        <CheckCircle2 size={14} aria-hidden />
                        Approve
                      </button>
                      <button
                        className="inline-flex items-center gap-2 rounded-full border border-red-500/30 px-4 py-2 text-[0.62rem] font-black uppercase tracking-[0.14em] text-red-300 transition hover:bg-red-500/10 disabled:opacity-60"
                        disabled={busy}
                        onClick={() => void setStatus(entry.id, "rejected")}
                        type="button"
                      >
                        <XCircle size={14} aria-hidden />
                        Reject
                      </button>
                    </>
                  ) : null}
                  {entry.status !== "withdrawn" && entry.status !== "rejected" ? (
                    <button
                      className="rounded-full border border-white/10 px-3 py-1.5 text-[0.58rem] font-black uppercase tracking-[0.12em] text-zinc-400 transition hover:text-white disabled:opacity-60"
                      disabled={busy}
                      onClick={() => void setStatus(entry.id, "withdrawn")}
                      type="button"
                    >
                      Withdraw
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
