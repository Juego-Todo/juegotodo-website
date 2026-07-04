"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  adminPageAccessTone,
  buildAdminPageAccessList,
  type AdminPageAccessLevel,
} from "@/lib/profile/admin-page-access";
import type { MemberRecord } from "@/lib/profile/member-record";

const tableHeaderClassName =
  "px-4 py-3 text-left text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500";
const tableCellClassName = "px-4 py-4 align-top text-sm text-zinc-300";

function AccessBadge({ access }: { access: AdminPageAccessLevel }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[0.58rem] font-black uppercase tracking-[0.1em] ${adminPageAccessTone(access)}`}
    >
      {access}
    </span>
  );
}

export function AdminPageAccessPanel({ memberRecord }: { memberRecord: MemberRecord }) {
  const entries = useMemo(
    () =>
      buildAdminPageAccessList({
        isAdmin: memberRecord.isAdmin,
        permissions: memberRecord.adminPermissions,
      }),
    [memberRecord.isAdmin, memberRecord.adminPermissions],
  );

  const categories = useMemo(() => {
    const grouped = new Map<string, typeof entries>();
    for (const entry of entries) {
      const list = grouped.get(entry.category) ?? [];
      list.push(entry);
      grouped.set(entry.category, list);
    }
    return [...grouped.entries()];
  }, [entries]);

  const fullAccessCount = entries.filter((entry) => entry.access === "Full Access").length;

  return (
    <section className="space-y-6">
      <div>
        <p className="text-[0.62rem] font-black uppercase tracking-[0.28em] text-red-200">Route Map</p>
        <h2 className="font-display mt-2 text-3xl uppercase text-white sm:text-4xl">Page Access</h2>
        <p className="mt-2 max-w-3xl text-sm text-zinc-400">
          Every profile workspace route, admin console page, and public site area this administrator can reach.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.02] p-4">
          <p className="text-[0.58rem] font-black uppercase tracking-[0.14em] text-zinc-500">Total Pages</p>
          <p className="font-display mt-2 text-4xl text-white">{entries.length}</p>
        </div>
        <div className="rounded-[1.25rem] border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="text-[0.58rem] font-black uppercase tracking-[0.14em] text-emerald-200">Full Access</p>
          <p className="font-display mt-2 text-4xl text-white">{fullAccessCount}</p>
        </div>
        <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.02] p-4">
          <p className="text-[0.58rem] font-black uppercase tracking-[0.14em] text-zinc-500">Permissions Active</p>
          <p className="font-display mt-2 text-4xl text-white">
            {memberRecord.adminPermissions.filter((permission) => permission.enabled).length}
          </p>
        </div>
      </div>

      {categories.map(([category, categoryEntries]) => (
        <div className="glass-panel overflow-hidden rounded-[1.75rem]" key={category}>
          <div className="border-b border-white/10 px-5 py-4 sm:px-6">
            <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-zinc-500">{category}</p>
            <p className="mt-1 text-sm text-zinc-400">{categoryEntries.length} pages</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className={tableHeaderClassName}>Page</th>
                  <th className={tableHeaderClassName}>Route</th>
                  <th className={tableHeaderClassName}>Description</th>
                  <th className={tableHeaderClassName}>Required Permission</th>
                  <th className={tableHeaderClassName}>Access</th>
                </tr>
              </thead>
              <tbody>
                {categoryEntries.map((entry) => (
                  <tr className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02]" key={entry.id}>
                    <td className={tableCellClassName}>
                      <p className="font-semibold text-white">{entry.page}</p>
                    </td>
                    <td className={tableCellClassName}>
                      {entry.route.includes("[") ? (
                        <code className="text-xs text-zinc-400">{entry.route}</code>
                      ) : (
                        <Link className="text-xs text-red-200 transition hover:text-white" href={entry.route}>
                          {entry.route}
                        </Link>
                      )}
                    </td>
                    <td className={`${tableCellClassName} max-w-[18rem]`}>
                      <p className="text-sm leading-6 text-zinc-400">{entry.description}</p>
                    </td>
                    <td className={tableCellClassName}>
                      <p className="text-sm text-zinc-300">{entry.requiredPermission ?? "Administrator"}</p>
                    </td>
                    <td className={tableCellClassName}>
                      <AccessBadge access={entry.access} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </section>
  );
}
