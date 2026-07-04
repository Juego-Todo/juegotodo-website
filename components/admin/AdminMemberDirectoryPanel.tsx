"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { AdminMemberManageModal } from "@/components/admin/AdminMemberManageModal";
import { AdminPortalHeader } from "@/components/admin/AdminPortalShell";
import { AdminAccountTagEditor } from "@/components/profile/AdminAccountTagEditor";
import { UserTypeBadge } from "@/components/profile/UserTypeBadge";
import { fetchAdminMemberRecords, type AdminMemberRecord } from "@/lib/admin/member-directory";
import { formatCurrency } from "@/lib/commerce/pricing";
import { getAllOrders } from "@/lib/commerce/storage";

type ManageMode = "edit" | "reset" | "delete";

const COLUMN_COUNT = 7;

const tableHeaderClassName =
  "px-3 py-3 text-left text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500";
const tableCellClassName = "px-3 py-3 text-sm text-zinc-300 align-top";

const actionButtonClassName =
  "rounded-full border px-2.5 py-1 text-[0.58rem] font-black uppercase tracking-[0.12em] transition sm:px-3 sm:py-1.5";

function memberDisplayName(member: AdminMemberRecord) {
  const parts = [member.firstName, member.lastName].filter((part) => part && part !== "—");
  return parts.join(" ") || member.fullName || member.email;
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.58rem] font-black uppercase tracking-[0.14em] text-zinc-500">{label}</p>
      <p className="mt-1 text-sm text-zinc-200">{value}</p>
    </div>
  );
}

export function AdminMemberDirectoryPanel() {
  const [members, setMembers] = useState<AdminMemberRecord[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [manageMember, setManageMember] = useState<AdminMemberRecord | null>(null);
  const [manageMode, setManageMode] = useState<ManageMode | null>(null);

  const refreshMembers = useCallback(() => {
    void getAllOrders().then((orders) => {
      void fetchAdminMemberRecords(orders).then((records) => {
        setMembers(records);
        setLoaded(true);
      });
    });
  }, []);

  useEffect(() => {
    refreshMembers();
  }, [refreshMembers]);

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return members;
    }

    return members.filter((member) => {
      const haystack = [
        member.firstName,
        member.lastName,
        member.username,
        member.email,
        member.phone,
        member.gender,
        member.city,
        member.gym,
        member.country,
        member.accountTypeLabel,
        member.role,
        member.licenseStatus ?? "",
        member.tags.join(" "),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [members, search]);

  function openManage(member: AdminMemberRecord, mode: ManageMode) {
    setManageMember(member);
    setManageMode(mode);
  }

  function closeManage() {
    setManageMember(null);
    setManageMode(null);
  }

  function toggleExpanded(userId: string) {
    setExpandedUserId((current) => (current === userId ? null : userId));
  }

  return (
    <div className="space-y-6">
      <AdminPortalHeader
        description="Search members, review account standing, and manage official account type tags."
        tag="Administration"
        title="Member Directory"
      />

      <div className="glass-panel rounded-[1.75rem] p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-400">
            {loaded ? `${filteredMembers.length} of ${members.length} profiles` : "Loading profiles..."}
          </p>
          <input
            className="w-full max-w-md rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none ring-red-500/40 focus:ring-4"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email, username, city, tags..."
            value={search}
          />
        </div>

        {!loaded ? (
          <div className="py-16 text-center text-zinc-400">Loading member directory...</div>
        ) : filteredMembers.length === 0 ? (
          <div className="py-16 text-center text-zinc-400">No members match your search.</div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className={`${tableHeaderClassName} w-8`} />
                  <th className={tableHeaderClassName}>Member</th>
                  <th className={tableHeaderClassName}>Email</th>
                  <th className={tableHeaderClassName}>Account</th>
                  <th className={tableHeaderClassName}>Standing</th>
                  <th className={tableHeaderClassName}>Tags</th>
                  <th className={tableHeaderClassName}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => {
                  const expanded = expandedUserId === member.userId;
                  const displayName = memberDisplayName(member);

                  return (
                    <Fragment key={member.userId}>
                      <tr className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className={tableCellClassName}>
                          <button
                            aria-expanded={expanded}
                            aria-label={expanded ? "Hide profile details" : "Show profile details"}
                            className="rounded-full border border-white/10 p-1 text-zinc-400 transition hover:border-white/30 hover:text-white"
                            onClick={() => toggleExpanded(member.userId)}
                            type="button"
                          >
                            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </button>
                        </td>
                        <td className={tableCellClassName}>
                          <p className="font-semibold text-white">{displayName}</p>
                          <p className="mt-0.5 text-xs text-zinc-500">
                            @{member.username !== "—" ? member.username : "no-username"}
                          </p>
                        </td>
                        <td className={`${tableCellClassName} max-w-[14rem] truncate`}>{member.email}</td>
                        <td className={tableCellClassName}>
                          <p>{member.accountTypeLabel}</p>
                          <p className="mt-0.5 text-xs capitalize text-zinc-500">{member.role}</p>
                        </td>
                        <td className={tableCellClassName}>
                          <p>{member.licenseStatus ?? "No license"}</p>
                          <p className="mt-0.5 text-xs text-zinc-500">
                            {member.orders} orders · {formatCurrency(member.lifetimeSpent)}
                          </p>
                        </td>
                        <td className={tableCellClassName}>
                          <div className="flex max-w-[10rem] flex-wrap gap-1">
                            {member.tags.length > 0 ? (
                              member.tags.map((tagId) => <UserTypeBadge key={tagId} tagId={tagId} />)
                            ) : (
                              <span className="text-xs text-zinc-500">None</span>
                            )}
                          </div>
                        </td>
                        <td className={tableCellClassName}>
                          <div className="flex flex-wrap gap-1">
                            <button
                              className={`${actionButtonClassName} border-white/10 text-zinc-300 hover:border-white/30 hover:text-white`}
                              onClick={() => openManage(member, "edit")}
                              type="button"
                            >
                              Edit
                            </button>
                            <button
                              className={`${actionButtonClassName} border-amber-500/30 text-amber-200 hover:border-amber-400/50`}
                              onClick={() => openManage(member, "reset")}
                              type="button"
                            >
                              Reset
                            </button>
                            <button
                              className={`${actionButtonClassName} border-red-500/30 text-red-200 hover:border-red-400/50`}
                              onClick={() => openManage(member, "delete")}
                              type="button"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expanded ? (
                        <tr className="border-b border-white/5 bg-black/25">
                          <td className="px-3 py-4" colSpan={COLUMN_COUNT}>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                              <DetailField label="First Name" value={member.firstName} />
                              <DetailField label="Last Name" value={member.lastName} />
                              <DetailField label="Username" value={member.username} />
                              <DetailField label="Phone" value={member.phone} />
                              <DetailField label="Date of Birth" value={member.dateOfBirth} />
                              <DetailField label="Gender" value={member.gender} />
                              <DetailField label="Blood Type" value={member.bloodType} />
                              <DetailField label="Nationality" value={member.nationality} />
                              <DetailField label="Civil Status" value={member.civilStatus} />
                              <DetailField label="City" value={member.city} />
                              <DetailField label="Gym" value={member.gym} />
                              <DetailField label="Country" value={member.country} />
                              <DetailField label="Member Since" value={member.memberSince} />
                              <DetailField label="Membership Tier" value={member.membershipTier} />
                              <DetailField label="License" value={member.licenseStatus ?? "—"} />
                              <DetailField
                                label="Lifetime Value"
                                value={`${member.orders} orders · ${formatCurrency(member.lifetimeSpent)}`}
                              />
                            </div>
                            <AdminAccountTagEditor
                              initialTags={member.tags}
                              onChange={refreshMembers}
                              userId={member.userId}
                            />
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {manageMember && manageMode ? (
        <AdminMemberManageModal
          member={manageMember}
          mode={manageMode}
          onClose={closeManage}
          onSaved={refreshMembers}
        />
      ) : null}
    </div>
  );
}
