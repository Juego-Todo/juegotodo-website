"use client";

import { Plus, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminPortalHeader } from "@/components/admin/AdminPortalShell";
import { formatAdminDate, readAdminJson } from "@/components/admin/platform/admin-platform-utils";
import { adminFetch } from "@/lib/auth/admin-fetch";
import type { AnnouncementRecord } from "@/lib/platform/announcements-server";

const AUDIENCE_OPTIONS = ["all", "members", "fighters", "officials", "staff"] as const;

type CreateForm = {
  title: string;
  body: string;
  audience: (typeof AUDIENCE_OPTIONS)[number];
  published: boolean;
};

const emptyForm: CreateForm = {
  title: "",
  body: "",
  audience: "all",
  published: false,
};

export function AdminAnnouncementsPanel() {
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<CreateForm>(emptyForm);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const refresh = useCallback(async () => {
    setError("");
    try {
      const response = await adminFetch("/api/admin/announcements");
      const payload = await readAdminJson<{ announcements?: AnnouncementRecord[] }>(
        response,
        "Unable to load announcements.",
      );
      setAnnouncements(payload.announcements ?? []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load announcements.");
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

  async function createAnnouncement(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);
    setError("");
    try {
      const response = await adminFetch("/api/admin/announcements", {
        method: "POST",
        body: JSON.stringify(form),
      });
      await readAdminJson(response, "Unable to create announcement.");
      setForm(emptyForm);
      setShowForm(false);
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to create announcement.");
    } finally {
      setCreating(false);
    }
  }

  const filteredAnnouncements = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return announcements;
    return announcements.filter((item) =>
      [item.title, item.body, item.audience].join(" ").toLowerCase().includes(normalized),
    );
  }, [announcements, query]);

  const publishedCount = announcements.filter((item) => item.published).length;

  return (
    <div className="space-y-6">
      <AdminPortalHeader
        description="Publish league announcements and member notifications."
        tag="Administration"
        title="Announcements"
      />

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        <div className="rounded-[1.25rem] border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-3 sm:px-4 sm:py-4">
          <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-emerald-200/70">Published</p>
          <p className="font-display mt-1 text-2xl text-white sm:text-3xl">{publishedCount}</p>
        </div>
        <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.02] px-3 py-3 sm:px-4 sm:py-4">
          <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">Total</p>
          <p className="font-display mt-1 text-2xl text-white sm:text-3xl">{announcements.length}</p>
        </div>
      </div>

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
              placeholder="Search announcements…"
              value={query}
            />
          </label>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF1010] px-4 py-2.5 text-[0.62rem] font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#ff2a2a]"
            onClick={() => setShowForm((current) => !current)}
            type="button"
          >
            <Plus size={14} aria-hidden />
            New Announcement
          </button>
        </div>
      </div>

      {showForm ? (
        <form
          className="space-y-4 rounded-[1.5rem] border border-white/10 bg-white/[0.02] p-5 sm:p-6"
          onSubmit={(event) => void createAnnouncement(event)}
        >
          <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-red-300">Create Announcement</p>
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
            <span className="text-[0.55rem] font-black uppercase tracking-[0.14em] text-zinc-500">Body</span>
            <textarea
              className="mt-1.5 min-h-28 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none ring-red-500/30 focus:ring-2"
              onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))}
              required
              value={form.body}
            />
          </label>
          <label className="block max-w-xs">
            <span className="text-[0.55rem] font-black uppercase tracking-[0.14em] text-zinc-500">Audience</span>
            <select
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none ring-red-500/30 focus:ring-2"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  audience: event.target.value as CreateForm["audience"],
                }))
              }
              value={form.audience}
            >
              {AUDIENCE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              checked={form.published}
              className="rounded border-white/20 bg-black/40"
              onChange={(event) => setForm((current) => ({ ...current, published: event.target.checked }))}
              type="checkbox"
            />
            Publish immediately
          </label>
          <button
            className="rounded-full bg-emerald-600 px-4 py-2 text-[0.62rem] font-black uppercase tracking-[0.14em] text-white transition hover:bg-emerald-500 disabled:opacity-60"
            disabled={creating}
            type="submit"
          >
            {creating ? "Saving…" : "Save Announcement"}
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
          Loading announcements…
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="rounded-[1.75rem] border border-white/10 px-5 py-10 text-center text-sm text-zinc-400">
          {announcements.length === 0 ? "No announcements yet." : "No announcements match your search."}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((item) => (
            <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.02] p-5 sm:p-6" key={item.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">{item.audience}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[0.55rem] font-black uppercase tracking-[0.12em] ${
                        item.published
                          ? "border border-emerald-500/30 text-emerald-300"
                          : "border border-white/10 text-zinc-500"
                      }`}
                    >
                      {item.published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <p className="mt-2 font-semibold text-white">{item.title}</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-400">{item.body}</p>
                </div>
                <p className="shrink-0 text-xs text-zinc-500">
                  {item.publishedAt ? formatAdminDate(item.publishedAt) : formatAdminDate(item.createdAt)}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
