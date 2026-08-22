"use client";

import { Plus, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminPortalHeader } from "@/components/admin/AdminPortalShell";
import { formatAdminDate, readAdminJson } from "@/components/admin/platform/admin-platform-utils";
import { adminFetch } from "@/lib/auth/admin-fetch";
import type { OfficialAssignmentRecord } from "@/lib/platform/officials-server";

const ROLE_OPTIONS = ["referee", "judge", "official", "medic"] as const;
const STATUS_OPTIONS = ["assigned", "confirmed", "completed", "cancelled"] as const;

type CreateForm = {
  officialUserId: string;
  role: (typeof ROLE_OPTIONS)[number];
  eventTitle: string;
  notes: string;
};

const emptyForm: CreateForm = {
  officialUserId: "",
  role: "referee",
  eventTitle: "",
  notes: "",
};

export function AdminOfficialsPanel() {
  const [assignments, setAssignments] = useState<OfficialAssignmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<CreateForm>(emptyForm);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError("");
    try {
      const response = await adminFetch("/api/admin/officials");
      const payload = await readAdminJson<{ assignments?: OfficialAssignmentRecord[] }>(
        response,
        "Unable to load official assignments.",
      );
      setAssignments(
        (payload.assignments ?? []).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load official assignments.");
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

  async function createAssignment(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);
    setError("");
    try {
      const response = await adminFetch("/api/admin/officials", {
        method: "POST",
        body: JSON.stringify(form),
      });
      await readAdminJson(response, "Unable to create assignment.");
      setForm(emptyForm);
      setShowForm(false);
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to create assignment.");
    } finally {
      setCreating(false);
    }
  }

  async function setStatus(id: string, status: string) {
    setBusyId(id);
    setError("");
    try {
      const response = await adminFetch("/api/admin/officials", {
        method: "PATCH",
        body: JSON.stringify({ id, status }),
      });
      await readAdminJson(response, "Unable to update assignment.");
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update assignment.");
    } finally {
      setBusyId(null);
    }
  }

  const filteredAssignments = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return assignments;
    return assignments.filter((item) =>
      [item.eventTitle, item.role, item.officialUserId, item.notes, item.status]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [assignments, query]);

  return (
    <div className="space-y-6">
      <AdminPortalHeader
        description="Manage referees, judges, and assigned officials across JTGC events."
        tag="Administration"
        title="Officials"
      />

      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.02] p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              size={14}
              aria-hidden
            />
            <input
              className="w-full rounded-xl border border-white/10 bg-black/40 py-2.5 pl-9 pr-3 text-sm text-white outline-none ring-red-500/30 placeholder:text-zinc-500 focus:ring-2"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search event, role, official id…"
              value={query}
            />
          </label>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF1010] px-4 py-2.5 text-[0.62rem] font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#ff2a2a]"
            onClick={() => setShowForm((current) => !current)}
            type="button"
          >
            <Plus size={14} aria-hidden />
            New Assignment
          </button>
        </div>
      </div>

      {showForm ? (
        <form
          className="space-y-4 rounded-[1.5rem] border border-white/10 bg-white/[0.02] p-5 sm:p-6"
          onSubmit={(event) => void createAssignment(event)}
        >
          <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-red-300">Create Assignment</p>
          <label className="block">
            <span className="text-[0.55rem] font-black uppercase tracking-[0.14em] text-zinc-500">Official User ID</span>
            <input
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none ring-red-500/30 focus:ring-2"
              onChange={(event) => setForm((current) => ({ ...current, officialUserId: event.target.value }))}
              placeholder="UUID from member directory"
              required
              value={form.officialUserId}
            />
          </label>
          <label className="block max-w-xs">
            <span className="text-[0.55rem] font-black uppercase tracking-[0.14em] text-zinc-500">Role</span>
            <select
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none ring-red-500/30 focus:ring-2"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  role: event.target.value as CreateForm["role"],
                }))
              }
              value={form.role}
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[0.55rem] font-black uppercase tracking-[0.14em] text-zinc-500">Event</span>
            <input
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none ring-red-500/30 focus:ring-2"
              onChange={(event) => setForm((current) => ({ ...current, eventTitle: event.target.value }))}
              required
              value={form.eventTitle}
            />
          </label>
          <label className="block">
            <span className="text-[0.55rem] font-black uppercase tracking-[0.14em] text-zinc-500">Notes</span>
            <textarea
              className="mt-1.5 min-h-20 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none ring-red-500/30 focus:ring-2"
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              value={form.notes}
            />
          </label>
          <button
            className="rounded-full bg-emerald-600 px-4 py-2 text-[0.62rem] font-black uppercase tracking-[0.14em] text-white transition hover:bg-emerald-500 disabled:opacity-60"
            disabled={creating}
            type="submit"
          >
            {creating ? "Saving…" : "Save Assignment"}
          </button>
        </form>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-[1.75rem] border border-white/10 px-5 py-10 text-center text-sm text-zinc-400">
          Loading official assignments…
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="rounded-[1.75rem] border border-white/10 px-5 py-10 text-center text-sm text-zinc-400">
          {assignments.length === 0 ? "No official assignments yet." : "No assignments match your search."}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map((item) => {
            const busy = busyId === item.id;
            return (
              <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.02] p-5 sm:p-6" key={item.id}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">{item.role}</p>
                      <span className="rounded-full border border-white/10 px-2 py-0.5 text-[0.55rem] font-black uppercase tracking-[0.12em] text-zinc-500 capitalize">
                        {item.status}
                      </span>
                    </div>
                    <p className="mt-2 font-semibold text-white">{item.eventTitle}</p>
                    <p className="mt-1 text-sm text-zinc-400">Official: {item.officialUserId}</p>
                    {item.notes ? <p className="mt-2 text-sm text-zinc-400">{item.notes}</p> : null}
                    <p className="mt-2 text-xs text-zinc-500">{formatAdminDate(item.createdAt)}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                  {STATUS_OPTIONS.filter((status) => status !== item.status).map((status) => (
                    <button
                      className="rounded-full border border-white/10 px-3 py-1.5 text-[0.58rem] font-black uppercase tracking-[0.12em] text-zinc-400 transition hover:text-white disabled:opacity-60"
                      disabled={busy}
                      key={status}
                      onClick={() => void setStatus(item.id, status)}
                      type="button"
                    >
                      Mark {status}
                    </button>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
