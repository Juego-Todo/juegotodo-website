"use client";

import { ExternalLink, RefreshCw, Search } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminPortalHeader } from "@/components/admin/AdminPortalShell";
import { fetchLicensedEnrichedFightersClient } from "@/lib/fighters/licensed";
import type { EnrichedFighterProfile } from "@/lib/fighters/profile";

const tableHeaderClassName =
  "px-3 py-3 text-left text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500";
const tableCellClassName = "px-3 py-3 text-sm text-zinc-300 align-top";

function FighterInitials({ fighter }: { fighter: EnrichedFighterProfile }) {
  return (
    <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full border border-white/10 bg-[radial-gradient(circle_at_35%_18%,rgba(255,16,16,0.28),transparent_42%),linear-gradient(145deg,#27272a,#050505)] font-display text-sm uppercase text-white">
      {fighter.initials || fighter.name.slice(0, 2).toUpperCase()}
    </span>
  );
}

export function AdminLatayanologyPanel({ embedded = false }: { embedded?: boolean }) {
  const [fighters, setFighters] = useState<EnrichedFighterProfile[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const refresh = useCallback(() => {
    setLoaded(false);
    void fetchLicensedEnrichedFightersClient()
      .then((records) => {
        setFighters(records);
        setError("");
        setLoaded(true);
      })
      .catch((caught) => {
        setError(caught instanceof Error ? caught.message : "Unable to load Latayanology roster.");
        setLoaded(true);
      });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        refresh();
      }
    }

    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refresh]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return fighters;
    }

    return fighters.filter((fighter) => {
      const haystack = [
        fighter.name,
        fighter.nickname,
        fighter.slug,
        fighter.division,
        fighter.gym,
        fighter.team,
        fighter.country,
        fighter.region,
        fighter.record,
        fighter.rank,
        fighter.style,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [fighters, search]);

  return (
    <div className="space-y-6">
      {embedded ? null : (
        <AdminPortalHeader
          description="Approved JTGC fighter licenses that power the public Latayanology Search Fighter database."
          tag="Latayanology"
          title="Fighter Database"
        />
      )}

      {embedded ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.62rem] font-black uppercase tracking-[0.28em] text-red-300">Latayanology</p>
            <h2 className="font-display mt-2 text-3xl uppercase text-white sm:text-4xl">Fighter Database</h2>
            <p className="mt-2 max-w-3xl text-sm text-zinc-400">
              Fighters appear here after their license is approved. This same roster feeds the public Search Fighter
              experience on Latayanology.
            </p>
          </div>
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/10 px-4 text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-300 transition hover:border-red-500/40 hover:text-white"
            href="/latayanology"
            target="_blank"
          >
            Open Public Search
            <ExternalLink size={14} aria-hidden />
          </Link>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
        <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.02] px-3 py-3 sm:px-4 sm:py-4">
          <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">Licensed Fighters</p>
          <p className="font-display mt-1 text-2xl text-white sm:text-3xl">{fighters.length}</p>
        </div>
        <div className="rounded-[1.25rem] border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-3 sm:px-4 sm:py-4">
          <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-emerald-200/70">Searchable</p>
          <p className="font-display mt-1 text-2xl text-white sm:text-3xl">{fighters.length}</p>
        </div>
        <div className="col-span-2 rounded-[1.25rem] border border-white/10 bg-white/[0.02] px-3 py-3 sm:col-span-1 sm:px-4 sm:py-4">
          <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">Source</p>
          <p className="mt-2 text-sm font-semibold text-zinc-300">Approved fighter licenses</p>
        </div>
      </div>

      <div className="glass-panel rounded-[1.75rem] p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-400">
            {error
              ? "Unable to load roster"
              : loaded
                ? `${filtered.length} of ${fighters.length} fighters`
                : "Loading roster..."}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="relative block min-w-0 flex-1 sm:w-80">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                size={14}
                aria-hidden
              />
              <input
                className="w-full rounded-xl border border-white/10 bg-black/40 py-2.5 pl-9 pr-3 text-sm text-white outline-none ring-red-500/40 placeholder:text-zinc-500 focus:ring-4"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, slug, division, gym..."
                value={search}
              />
            </label>
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/10 px-4 text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-300 transition hover:text-white"
              onClick={refresh}
              type="button"
            >
              <RefreshCw size={14} aria-hidden />
              Refresh
            </button>
          </div>
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-100">
            <p className="font-bold">Latayanology roster failed to load.</p>
            <p className="mt-2 text-red-100/80">{error}</p>
            <button
              className="mt-4 rounded-full border border-red-300/30 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-red-50"
              onClick={refresh}
              type="button"
            >
              Retry
            </button>
          </div>
        ) : !loaded ? (
          <div className="py-16 text-center text-zinc-400">Loading approved fighters...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-zinc-400">
            {fighters.length === 0
              ? "No approved fighter licenses yet. Approve a fighter license in Licenses to add them here and to public Search Fighter."
              : "No fighters match your search."}
          </div>
        ) : (
          <>
            <div className="mt-5 space-y-3 md:hidden">
              {filtered.map((fighter) => (
                <article
                  className="rounded-2xl border border-white/10 bg-black/30 p-4"
                  key={fighter.slug}
                >
                  <div className="flex items-start gap-3">
                    <FighterInitials fighter={fighter} />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white">{fighter.name}</p>
                      <p className="mt-0.5 truncate text-xs text-zinc-500">
                        {fighter.nickname ? `"${fighter.nickname}" · ` : null}
                        /{fighter.slug}
                      </p>
                      <p className="mt-2 text-sm text-zinc-300">
                        {fighter.division}
                        <span className="mx-1.5 text-zinc-700">·</span>
                        {fighter.record}
                        <span className="mx-1.5 text-zinc-700">·</span>
                        {fighter.rank}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">{fighter.gym || fighter.team || "Independent"}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Link
                      className="inline-flex min-h-10 flex-1 items-center justify-center rounded-full border border-white/10 px-3 text-[0.6rem] font-black uppercase tracking-[0.12em] text-zinc-300 transition hover:text-white"
                      href={`/fighters/${fighter.slug}`}
                    >
                      View Profile
                    </Link>
                    <Link
                      className="inline-flex min-h-10 flex-1 items-center justify-center rounded-full border border-red-500/30 px-3 text-[0.6rem] font-black uppercase tracking-[0.12em] text-red-200 transition hover:border-red-400/50"
                      href={`/latayanology?q=${encodeURIComponent(fighter.name)}`}
                    >
                      Find In Search
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-5 hidden overflow-x-auto md:block">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className={tableHeaderClassName}>Fighter</th>
                    <th className={tableHeaderClassName}>Division</th>
                    <th className={tableHeaderClassName}>Record</th>
                    <th className={tableHeaderClassName}>Rank</th>
                    <th className={tableHeaderClassName}>Gym / Team</th>
                    <th className={tableHeaderClassName}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((fighter) => (
                    <tr className="border-b border-white/5 hover:bg-white/[0.02]" key={fighter.slug}>
                      <td className={tableCellClassName}>
                        <div className="flex items-center gap-3">
                          <FighterInitials fighter={fighter} />
                          <div className="min-w-0">
                            <p className="font-semibold text-white">{fighter.name}</p>
                            <p className="mt-0.5 text-xs text-zinc-500">
                              {fighter.nickname ? `"${fighter.nickname}" · ` : null}
                              {fighter.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className={tableCellClassName}>{fighter.division || "—"}</td>
                      <td className={tableCellClassName}>{fighter.record || "—"}</td>
                      <td className={tableCellClassName}>{fighter.rank || "NR"}</td>
                      <td className={`${tableCellClassName} max-w-[12rem] truncate`}>
                        {fighter.gym || fighter.team || "Independent"}
                      </td>
                      <td className={tableCellClassName}>
                        <div className="flex flex-wrap gap-1.5">
                          <Link
                            className="rounded-full border border-white/10 px-3 py-1.5 text-[0.58rem] font-black uppercase tracking-[0.12em] text-zinc-300 transition hover:border-white/30 hover:text-white"
                            href={`/fighters/${fighter.slug}`}
                          >
                            Profile
                          </Link>
                          <Link
                            className="rounded-full border border-red-500/30 px-3 py-1.5 text-[0.58rem] font-black uppercase tracking-[0.12em] text-red-200 transition hover:border-red-400/50"
                            href={`/latayanology?q=${encodeURIComponent(fighter.name)}`}
                          >
                            Search
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
