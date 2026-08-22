"use client";

import { Download } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AdminPortalHeader } from "@/components/admin/AdminPortalShell";
import { readAdminJson } from "@/components/admin/platform/admin-platform-utils";
import { adminFetch } from "@/lib/auth/admin-fetch";
import type { PlatformReportSnapshot } from "@/lib/platform/reports-server";

const KPI_TILES: { key: keyof PlatformReportSnapshot; label: string; tone?: "amber" | "sky" | "emerald" }[] = [
  { key: "inquiriesNew", label: "New Inquiries", tone: "amber" },
  { key: "documentsPending", label: "Documents Pending", tone: "amber" },
  { key: "competitionEntriesPending", label: "Competition Entries", tone: "amber" },
  { key: "ordersPending", label: "Orders Pending", tone: "sky" },
  { key: "licensePending", label: "Licenses Pending", tone: "sky" },
  { key: "membershipApplications", label: "Membership Apps", tone: "sky" },
  { key: "publishedEvents", label: "Published Events", tone: "emerald" },
  { key: "publishedAnnouncements", label: "Published Announcements", tone: "emerald" },
];

function tileClassName(tone?: "amber" | "sky" | "emerald") {
  if (tone === "amber") return "border-amber-500/20 bg-amber-500/[0.06]";
  if (tone === "sky") return "border-sky-500/20 bg-sky-500/[0.06]";
  if (tone === "emerald") return "border-emerald-500/20 bg-emerald-500/[0.06]";
  return "border-white/10 bg-white/[0.02]";
}

function labelClassName(tone?: "amber" | "sky" | "emerald") {
  if (tone === "amber") return "text-amber-200/70";
  if (tone === "sky") return "text-sky-200/70";
  if (tone === "emerald") return "text-emerald-200/70";
  return "text-zinc-500";
}

function snapshotToCsv(snapshot: PlatformReportSnapshot) {
  const rows = KPI_TILES.map((tile) => [tile.label, String(snapshot[tile.key])]);
  const header = ["Metric", "Value"];
  const lines = [header, ...rows].map((row) =>
    row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","),
  );
  return lines.join("\n");
}

export function AdminReportsPanel() {
  const [snapshot, setSnapshot] = useState<PlatformReportSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setError("");
    try {
      const response = await adminFetch("/api/admin/reports");
      const payload = await readAdminJson<{ snapshot?: PlatformReportSnapshot }>(
        response,
        "Unable to load reports.",
      );
      setSnapshot(payload.snapshot ?? null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load reports.");
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

  function exportCsv() {
    if (!snapshot) return;
    const csv = snapshotToCsv(snapshot);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `juego-todo-platform-report-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <AdminPortalHeader
        description="Platform analytics, license activity, and league operational reports."
        tag="Administration"
        title="Reports"
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.02] p-4">
        <p className="text-sm text-zinc-400">Operational snapshot across inquiries, documents, orders, and events.</p>
        <button
          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-300 transition hover:text-white disabled:opacity-60"
          disabled={!snapshot}
          onClick={exportCsv}
          type="button"
        >
          <Download size={14} aria-hidden />
          Export CSV
        </button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-[1.75rem] border border-white/10 px-5 py-10 text-center text-sm text-zinc-400">
          Loading report snapshot…
        </div>
      ) : snapshot ? (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
          {KPI_TILES.map((tile) => (
            <div
              className={`rounded-[1.25rem] border px-3 py-3 sm:px-4 sm:py-4 ${tileClassName(tile.tone)}`}
              key={tile.key}
            >
              <p className={`text-[0.58rem] font-black uppercase tracking-[0.16em] ${labelClassName(tile.tone)}`}>
                {tile.label}
              </p>
              <p className="font-display mt-1 text-2xl text-white sm:text-3xl">{snapshot[tile.key]}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[1.75rem] border border-white/10 px-5 py-10 text-center text-sm text-zinc-400">
          No report data available.
        </div>
      )}
    </div>
  );
}
