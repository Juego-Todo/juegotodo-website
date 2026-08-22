"use client";

import { Plus, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminPortalHeader } from "@/components/admin/AdminPortalShell";
import { formatAdminDate, readAdminJson } from "@/components/admin/platform/admin-platform-utils";
import { adminFetch } from "@/lib/auth/admin-fetch";
import type { CouncilRecord } from "@/lib/platform/council-server";

const RECORD_TYPES = ["decision", "committee", "regional", "governance"] as const;
const STATUS_OPTIONS = ["draft", "active", "archived"] as const;

type CreateForm = {
  recordType: (typeof RECORD_TYPES)[number];
  title: string;
  summary: string;
  status: (typeof STATUS_OPTIONS)[number];
};

const emptyForm: CreateForm = {
  recordType: "decision",
  title: "",
  summary: "",
  status: "active",
};

export function AdminCouncilPanel() {
  const [records, setRecords] = useState<CouncilRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<CreateForm>(emptyForm);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const refresh = useCallback(async () => {
    setError("");
    try {
      const response = await adminFetch("/api/admin/council");
      const payload = await readAdminJson<{ records?: CouncilRecord[] }>(
        response,
        "Unable to load council records.",
      );
      setRecords(
        (payload.records ?? []).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load council records.");
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

  async function createRecord(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);
    setError("");
    try {
      const response = await adminFetch("/api/admin/council", {
        method: "POST",
        body: JSON.stringify(form),
      });
      await readAdminJson(response, "Unable to save council record.");
      setForm(emptyForm);
      setShowForm(false);
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save council record.");
    } finally {
      setCreating(false);
    }
  }

  const filteredRecords = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return records;
    return records.filter((item) =>
      [item.title, item.summary, item.recordType, item.status].join(" ").toLowerCase().includes(normalized),
    );
  }, [records, query]);

  return (
    <div className="space-y-6">
      <AdminPortalHeader
        description="Council governance tools, regional oversight, and league administration."
        tag="Administration"
        title="Grand Council"
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
              placeholder="Search records…"
              value={query}
            />
          </label>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF1010] px-4 py-2.5 text-[0.62rem] font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#ff2a2a]"
            onClick={() => setShowForm((current) => !current)}
            type="button"
          >
            <Plus size={14} aria-hidden />
            New Record
          </button>
        </div>
      </div>

      {showForm ? (
        <form
          className="space-y-4 rounded-[1.5rem] border border-white/10 bg-white/[0.02] p-5 sm:p-6"
          onSubmit={(event) => void createRecord(event)}
        >
          <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-red-300">Create Council Record</p>
          <label className="block max-w-xs">
            <span className="text-[0.55rem] font-black uppercase tracking-[0.14em] text-zinc-500">Record Type</span>
            <select
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none ring-red-500/30 focus:ring-2"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  recordType: event.target.value as CreateForm["recordType"],
                }))
              }
              value={form.recordType}
            >
              {RECORD_TYPES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[0.55rem] font-black uppercase tracking-[0.14em] text-zinc-500">Title</span>
            <input
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none ring-red-500/30 focus:ring-2"
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              required
              value={form.title}
            />
          </label>
          <label className="block">
            <span className="text-[0.55rem] font-black uppercase tracking-[0.14em] text-zinc-500">Summary</span>
            <textarea
              className="mt-1.5 min-h-24 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none ring-red-500/30 focus:ring-2"
              onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))}
              value={form.summary}
            />
          </label>
          <label className="block max-w-xs">
            <span className="text-[0.55rem] font-black uppercase tracking-[0.14em] text-zinc-500">Status</span>
            <select
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none ring-red-500/30 focus:ring-2"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  status: event.target.value as CreateForm["status"],
                }))
              }
              value={form.status}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <button
            className="rounded-full bg-emerald-600 px-4 py-2 text-[0.62rem] font-black uppercase tracking-[0.14em] text-white transition hover:bg-emerald-500 disabled:opacity-60"
            disabled={creating}
            type="submit"
          >
            {creating ? "Saving…" : "Save Record"}
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
          Loading council records…
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="rounded-[1.75rem] border border-white/10 px-5 py-10 text-center text-sm text-zinc-400">
          {records.length === 0 ? "No council records yet." : "No records match your search."}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((item) => (
            <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.02] p-5 sm:p-6" key={item.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">{item.recordType}</p>
                    <span className="rounded-full border border-white/10 px-2 py-0.5 text-[0.55rem] font-black uppercase tracking-[0.12em] text-zinc-500 capitalize">
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-2 font-semibold text-white">{item.title}</p>
                  {item.summary ? (
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-400">{item.summary}</p>
                  ) : null}
                </div>
                <p className="shrink-0 text-xs text-zinc-500">{formatAdminDate(item.createdAt)}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
