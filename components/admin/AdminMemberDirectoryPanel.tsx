"use client";

import { Check, ChevronDown, MoreHorizontal, Plus, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AdminMemberDetailDrawer } from "@/components/admin/AdminMemberDetailDrawer";
import { AdminMemberManageModal } from "@/components/admin/AdminMemberManageModal";
import { AdminPortalHeader } from "@/components/admin/AdminPortalShell";
import { UserTypeBadge } from "@/components/profile/UserTypeBadge";
import { ProCountdown } from "@/components/pro/ProCountdown";
import { leadershipStaffAccounts } from "@/data/leadership-staff-accounts";
import { userTypeTags } from "@/data/user-type-tags";
import {
  fetchAdminMemberRecords,
  provisionLeadershipStaffMembers,
  type AdminMemberRecord,
} from "@/lib/admin/member-directory";
import {
  activeFilterChips,
  computeMemberStats,
  credentialLabels,
  defaultMemberFilters,
  filterMembers,
  isPendingCredential,
  isStaffAccount,
  memberDisplayName,
  orgRoleTags,
  proStatusCaption,
  sortMembers,
  type AccountFilter,
  type CredentialsFilter,
  type JoinedFilter,
  type MemberDirectoryFilters,
  type MemberSort,
  type MembershipFilter,
  type QuickView,
  type RoleFilter,
} from "@/lib/admin/member-directory-filters";
import { accountTypeLabels } from "@/lib/auth/types";
import { getAllOrders } from "@/lib/commerce/storage";

type ManageMode = "edit" | "reset" | "delete" | "pro";

const ROLE_FILTER_OPTIONS: Array<{ value: RoleFilter; label: string }> = [
  { value: "all", label: "All roles" },
  { value: "admin_role", label: "Admin" },
  ...Object.values(userTypeTags).map((tag) => ({ value: tag.id as RoleFilter, label: tag.label })),
];

function StatusPill({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "success" | "warn" | "danger" | "accent";
}) {
  const tones = {
    muted: "border-white/10 bg-white/[0.04] text-zinc-400",
    success: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    warn: "border-amber-400/30 bg-amber-400/10 text-amber-100",
    danger: "border-red-400/30 bg-red-400/10 text-red-200",
    accent: "border-[#FFCF6A]/30 bg-[#FFCF6A]/10 text-[#FFCF6A]",
  };
  return (
    <span className={`inline-flex rounded-md border px-1.5 py-0.5 text-[0.55rem] font-black uppercase tracking-[0.12em] ${tones[tone]}`}>
      {children}
    </span>
  );
}

function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <label className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 text-[0.62rem] font-black uppercase tracking-[0.12em] text-zinc-400">
      <span className="hidden sm:inline">{label}</span>
      <select
        className="max-w-[9rem] bg-transparent text-zinc-200 outline-none"
        onChange={(event) => onChange(event.target.value as T)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function MembershipCell({ member }: { member: AdminMemberRecord }) {
  if (!member.proEntitled && member.proStatus === "none") {
    return <StatusPill>Free</StatusPill>;
  }
  const tone =
    member.proEntitled && member.proStatus === "active"
      ? "success"
      : member.proStatus === "expired" || member.proStatus === "past_due"
        ? "danger"
        : member.proStatus === "pending"
          ? "accent"
          : "warn";
  return (
    <div>
      <StatusPill tone={tone}>Pro · {proStatusCaption(member.proStatus, member.proEntitled)}</StatusPill>
      {member.proExpiresAt ? (
        <div className="mt-1.5">
          <ProCountdown compact entitled={member.proEntitled} expiresAt={member.proExpiresAt} showBar={false} />
        </div>
      ) : null}
    </div>
  );
}

function CredentialsCell({ member }: { member: AdminMemberRecord }) {
  const labels = credentialLabels(member);
  if (labels.length === 0) {
    if (member.licenseStatus && isPendingCredential(member)) {
      return <StatusPill tone="warn">1 pending</StatusPill>;
    }
    return <span className="text-xs text-zinc-500">No credentials</span>;
  }
  const visible = labels.slice(0, 2);
  const rest = labels.length - visible.length;
  return (
    <div>
      <p className="text-xs font-medium text-zinc-300">
        {labels.length} credential{labels.length === 1 ? "" : "s"}
      </p>
      <div className="mt-1 flex flex-wrap gap-1">
        {visible.map((label) => (
          <span className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[0.58rem] text-zinc-300" key={label}>
            {label}
          </span>
        ))}
        {rest > 0 ? <span className="text-[0.58rem] text-zinc-500">+{rest}</span> : null}
      </div>
    </div>
  );
}

function RolesCell({ member }: { member: AdminMemberRecord }) {
  const roles = orgRoleTags(member).slice(0, 2);
  return (
    <div className="flex flex-wrap gap-1">
      {isStaffAccount(member) ? <StatusPill>Staff</StatusPill> : <StatusPill>Fan</StatusPill>}
      {member.role === "admin" ? <StatusPill tone="accent">Admin</StatusPill> : null}
      {roles.map((tagId) => (
        <UserTypeBadge compact key={tagId} tagId={tagId} />
      ))}
    </div>
  );
}

function RowActions({
  member,
  open,
  onToggle,
  onView,
  onEdit,
  onPro,
  onReset,
  onDelete,
}: {
  member: AdminMemberRecord;
  open: boolean;
  onToggle: () => void;
  onView: () => void;
  onEdit: () => void;
  onPro: () => void;
  onReset: () => void;
  onDelete: () => void;
}) {
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        onToggle();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onToggle]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        aria-expanded={open}
        aria-label={`Actions for ${memberDisplayName(member)}`}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-zinc-400 transition hover:border-white/25 hover:text-white"
        onClick={(event) => {
          event.stopPropagation();
          onToggle();
        }}
        type="button"
      >
        <MoreHorizontal size={16} aria-hidden />
      </button>
      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-white/10 bg-[#111] py-1 shadow-2xl">
          {[
            { label: "View profile", action: onView },
            { label: "Edit member", action: onEdit },
            { label: "Manage membership", action: onPro },
            { label: "Reset password", action: onReset },
          ].map((item) => (
            <button
              className="block w-full px-3 py-2 text-left text-xs text-zinc-300 transition hover:bg-white/5 hover:text-white"
              key={item.label}
              onClick={(event) => {
                event.stopPropagation();
                item.action();
              }}
              type="button"
            >
              {item.label}
            </button>
          ))}
          <div className="my-1 border-t border-white/10" />
          <button
            className="block w-full px-3 py-2 text-left text-xs text-red-300 transition hover:bg-red-500/10"
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
            type="button"
          >
            Delete account
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function AdminMemberDirectoryPanel({ embedded = false }: { embedded?: boolean }) {
  const [members, setMembers] = useState<AdminMemberRecord[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<MemberDirectoryFilters>(defaultMemberFilters);
  const [quickView, setQuickView] = useState<QuickView>("all");
  const [sort, setSort] = useState<MemberSort>("joined_desc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [menuUserId, setMenuUserId] = useState<string | null>(null);
  const [drawerMember, setDrawerMember] = useState<AdminMemberRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [manageMember, setManageMember] = useState<AdminMemberRecord | null>(null);
  const [manageMode, setManageMode] = useState<ManageMode | null>(null);
  const [provisionStatus, setProvisionStatus] = useState("");
  const [provisioning, setProvisioning] = useState(false);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const autoProvisionedRef = useRef(false);

  const refreshMembers = useCallback(() => {
    void getAllOrders()
      .then((orders) => fetchAdminMemberRecords(orders))
      .then((records) => {
        setMembers(records);
        setError("");
        setLoaded(true);
        setDrawerMember((current) => {
          if (!current) return current;
          return records.find((record) => record.userId === current.userId) ?? current;
        });
      })
      .catch((caught) => {
        setError(caught instanceof Error ? caught.message : "Unable to load member directory.");
        setLoaded(true);
      });
  }, []);

  const createLeadershipAccounts = useCallback(async () => {
    setProvisioning(true);
    setProvisionStatus("Creating leadership accounts...");
    setAddMenuOpen(false);
    try {
      const result = await provisionLeadershipStaffMembers();
      const createdCount = result?.results?.filter((entry) => entry.ok && entry.created).length ?? 0;
      const updatedCount = result?.results?.filter((entry) => entry.ok && !entry.created).length ?? 0;
      const failed = result?.results?.filter((entry) => !entry.ok) ?? [];

      if (failed.length > 0) {
        setProvisionStatus(
          `Created ${createdCount}, updated ${updatedCount}. Failed: ${failed
            .map((entry) => `${entry.email} (${entry.error ?? "error"})`)
            .join("; ")}`,
        );
      } else if (createdCount > 0) {
        setProvisionStatus(
          `Created ${createdCount} leadership account${createdCount === 1 ? "" : "s"} with the temporary password.`,
        );
      } else {
        setProvisionStatus("Leadership accounts are already in the directory.");
      }
      refreshMembers();
    } catch (caught) {
      setProvisionStatus(caught instanceof Error ? caught.message : "Unable to create leadership accounts.");
    } finally {
      setProvisioning(false);
    }
  }, [refreshMembers]);

  useEffect(() => {
    const timer = window.setTimeout(() => refreshMembers(), 0);
    return () => window.clearTimeout(timer);
  }, [refreshMembers]);

  useEffect(() => {
    if (!loaded || autoProvisionedRef.current) return;
    const existing = new Set(members.map((member) => member.email.trim().toLowerCase()));
    const missing = leadershipStaffAccounts.some((account) => !existing.has(account.email));
    if (!missing) return;
    autoProvisionedRef.current = true;
    const timer = window.setTimeout(() => {
      void createLeadershipAccounts();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [createLeadershipAccounts, loaded, members]);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") refreshMembers();
    }
    window.addEventListener("focus", refreshMembers);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("focus", refreshMembers);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshMembers]);

  const stats = useMemo(() => computeMemberStats(members), [members]);

  const filteredMembers = useMemo(
    () =>
      sortMembers(
        filterMembers(members, { search, filters, quickView }),
        sort,
      ),
    [members, search, filters, quickView, sort],
  );

  const chips = useMemo(() => activeFilterChips(filters), [filters]);

  function openManage(member: AdminMemberRecord, mode: ManageMode) {
    setManageMember(member);
    setManageMode(mode);
    setMenuUserId(null);
  }

  function closeManage() {
    setManageMember(null);
    setManageMode(null);
  }

  function openDrawer(member: AdminMemberRecord) {
    setDrawerMember(member);
    setDrawerOpen(true);
    setMenuUserId(null);
  }

  function clearFilters() {
    setFilters(defaultMemberFilters);
    setQuickView("all");
    setSearch("");
  }

  function toggleSelected(userId: string) {
    setSelectedIds((current) =>
      current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId],
    );
  }

  function toggleSelectAll() {
    if (selectedIds.length === filteredMembers.length) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(filteredMembers.map((member) => member.userId));
  }

  function exportSelected() {
    const rows = members.filter((member) => selectedIds.includes(member.userId));
    const header = ["Name", "Username", "Email", "Account", "Role", "Pro", "Joined"];
    const lines = [
      header.join(","),
      ...rows.map((member) =>
        [
          memberDisplayName(member),
          member.username,
          member.email,
          accountTypeLabels[member.accountType],
          member.role,
          proStatusCaption(member.proStatus, member.proEntitled),
          member.memberSince,
        ]
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(","),
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "juegotodo-members.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const quickViews: Array<{ id: QuickView; label: string; count: number }> = [
    { id: "all", label: "All Members", count: stats.total },
    { id: "pro", label: "Pro Members", count: stats.pro },
    { id: "staff", label: "Staff", count: stats.staff },
    { id: "leadership", label: "Leadership", count: stats.leadership },
    { id: "licensed", label: "Licensed", count: stats.licensed },
    { id: "pending", label: "Pending", count: stats.pending },
  ];

  return (
    <div className="space-y-6">
      {embedded ? null : (
        <AdminPortalHeader
          description="Manage JuegoTodo members, memberships, roles and credentials."
          tag="Administration"
          title="Members"
        />
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {embedded ? (
            <>
              <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-[#FF1010]">Members</p>
              <h2 className="font-display mt-1 text-3xl uppercase text-white">Member Directory</h2>
            </>
          ) : null}
          <p className="mt-1 text-sm text-zinc-400">
            {loaded
              ? `${stats.total} members · ${stats.staff} staff · ${stats.fans} fans`
              : "Loading member community…"}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Manage member accounts, memberships, roles and credentials.
          </p>
        </div>

        <div className="relative">
          <button
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#FF1010] px-5 text-xs font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#ff2a2a]"
            onClick={() => setAddMenuOpen((open) => !open)}
            type="button"
          >
            <Plus size={14} aria-hidden />
            Add Member
            <ChevronDown size={14} aria-hidden />
          </button>
          {addMenuOpen ? (
            <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-[#111] py-1 shadow-2xl">
              <button
                className="block w-full px-3 py-2.5 text-left text-xs text-zinc-300 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
                disabled={provisioning}
                onClick={() => void createLeadershipAccounts()}
                type="button"
              >
                Add leadership accounts
              </button>
              <p className="px-3 pb-2 text-[0.65rem] leading-relaxed text-zinc-500">
                Provisions configured leadership staff with temporary passwords.
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {(
          [
            { label: "Members", value: stats.total, view: "all" as QuickView },
            { label: "Pro Members", value: stats.pro, view: "pro" as QuickView },
            { label: "Staff", value: stats.staff, view: "staff" as QuickView },
            { label: "Licensed", value: stats.licensed, view: "licensed" as QuickView },
          ] as const
        ).map((card) => (
          <button
            className={`rounded-[1.25rem] border px-4 py-4 text-left transition ${
              quickView === card.view
                ? "border-[#FF1010]/40 bg-[#FF1010]/10"
                : "border-white/10 bg-white/[0.02] hover:border-white/20"
            }`}
            key={card.label}
            onClick={() => setQuickView(card.view)}
            type="button"
          >
            <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">{card.label}</p>
            <p className="font-display mt-1 text-3xl text-white">{loaded ? card.value : "—"}</p>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {quickViews.map((view) => (
          <button
            className={`rounded-full border px-3 py-1.5 text-[0.62rem] font-black uppercase tracking-[0.12em] transition ${
              quickView === view.id
                ? "border-[#FF1010]/45 bg-[#FF1010]/15 text-[#ffb4b4]"
                : "border-white/10 text-zinc-400 hover:border-white/25 hover:text-white"
            }`}
            key={view.id}
            onClick={() => setQuickView(view.id)}
            type="button"
          >
            {view.label} ({loaded ? view.count : "—"})
          </button>
        ))}
      </div>

      <div className="space-y-3 rounded-[1.5rem] border border-white/10 bg-white/[0.02] p-3 sm:p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={15} aria-hidden />
          <input
            className="w-full rounded-xl border border-white/10 bg-black/40 py-2.5 pl-10 pr-4 text-sm text-white outline-none ring-[#FF1010]/30 placeholder:text-zinc-500 focus:ring-2"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search members by name, email, username, city, Pro ID…"
            value={search}
          />
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <FilterSelect
              label="Membership"
              onChange={(value) => setFilters((current) => ({ ...current, membership: value }))}
              options={[
                { value: "all", label: "All" },
                { value: "pro", label: "Pro" },
                { value: "free", label: "Free" },
                { value: "expired", label: "Expired" },
                { value: "pending", label: "Pending" },
                { value: "expiring", label: "Expiring" },
              ] satisfies Array<{ value: MembershipFilter; label: string }>}
              value={filters.membership}
            />
            <FilterSelect
              label="Account"
              onChange={(value) => setFilters((current) => ({ ...current, account: value }))}
              options={[
                { value: "all", label: "All" },
                { value: "fan", label: "Fan" },
                { value: "staff", label: "Staff" },
                { value: "admin", label: "Admin" },
              ] satisfies Array<{ value: AccountFilter; label: string }>}
              value={filters.account}
            />
            <FilterSelect
              label="Credentials"
              onChange={(value) => setFilters((current) => ({ ...current, credentials: value }))}
              options={[
                { value: "all", label: "All" },
                { value: "licensed", label: "Licensed" },
                { value: "none", label: "None" },
                { value: "pending", label: "Pending" },
              ] satisfies Array<{ value: CredentialsFilter; label: string }>}
              value={filters.credentials}
            />
            <FilterSelect
              label="Role"
              onChange={(value) => setFilters((current) => ({ ...current, role: value }))}
              options={ROLE_FILTER_OPTIONS}
              value={filters.role}
            />
            <FilterSelect
              label="Joined"
              onChange={(value) => setFilters((current) => ({ ...current, joined: value }))}
              options={[
                { value: "all", label: "Any time" },
                { value: "today", label: "Today" },
                { value: "7d", label: "Last 7 days" },
                { value: "30d", label: "Last 30 days" },
              ] satisfies Array<{ value: JoinedFilter; label: string }>}
              value={filters.joined}
            />
          </div>

          <FilterSelect
            label="Sort"
            onChange={setSort}
            options={[
              { value: "joined_desc", label: "Recently joined" },
              { value: "joined_asc", label: "Oldest joined" },
              { value: "name_asc", label: "Name A–Z" },
              { value: "name_desc", label: "Name Z–A" },
              { value: "pro_first", label: "Pro first" },
              { value: "expiring", label: "Expiring soon" },
            ] satisfies Array<{ value: MemberSort; label: string }>}
            value={sort}
          />
        </div>

        {chips.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {chips.map((chip) => (
              <button
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-zinc-300"
                key={chip.key}
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    [chip.key]: defaultMemberFilters[chip.key],
                  }))
                }
                type="button"
              >
                {chip.label}
                <X size={12} aria-hidden />
              </button>
            ))}
            <button
              className="text-[0.62rem] font-black uppercase tracking-[0.12em] text-[#FF1010] hover:text-[#ff3a3a]"
              onClick={clearFilters}
              type="button"
            >
              Clear filters
            </button>
          </div>
        ) : null}

        {provisionStatus ? <p className="text-sm text-zinc-300">{provisionStatus}</p> : null}
      </div>

      {selectedIds.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#FF1010]/25 bg-[#FF1010]/8 px-4 py-3">
          <p className="text-sm text-zinc-200">
            <span className="font-semibold text-white">{selectedIds.length}</span> selected
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              className="rounded-full border border-white/15 px-3 py-1.5 text-[0.62rem] font-black uppercase tracking-[0.12em] text-zinc-200"
              onClick={exportSelected}
              type="button"
            >
              Export
            </button>
            <button
              className="rounded-full border border-white/15 px-3 py-1.5 text-[0.62rem] font-black uppercase tracking-[0.12em] text-zinc-400"
              onClick={() => setSelectedIds([])}
              type="button"
            >
              Clear selection
            </button>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-5 text-sm text-red-100">
          <p className="font-bold">Unable to load members.</p>
          <p className="mt-2 text-red-100/80">Please try again.</p>
          <button
            className="mt-4 rounded-full border border-red-300/30 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-red-50"
            onClick={refreshMembers}
            type="button"
          >
            Try again
          </button>
        </div>
      ) : !loaded ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div className="h-16 animate-pulse rounded-2xl border border-white/5 bg-white/[0.03]" key={index} />
          ))}
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="rounded-[1.75rem] border border-white/10 px-5 py-12 text-center">
          <p className="font-display text-2xl uppercase text-white">No members found</p>
          <p className="mt-2 text-sm text-zinc-400">Try adjusting your filters or search.</p>
          <button
            className="mt-5 rounded-full border border-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-zinc-200"
            onClick={clearFilters}
            type="button"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.02] p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-3 px-1">
            <p className="text-sm text-zinc-400">
              {filteredMembers.length} of {members.length} members
            </p>
            <button
              className="inline-flex items-center gap-2 text-[0.62rem] font-black uppercase tracking-[0.12em] text-zinc-400 hover:text-white"
              onClick={toggleSelectAll}
              type="button"
            >
              <span className="inline-flex h-4 w-4 items-center justify-center rounded border border-white/20">
                {selectedIds.length === filteredMembers.length && filteredMembers.length > 0 ? (
                  <Check size={10} aria-hidden />
                ) : null}
              </span>
              Select all
            </button>
          </div>

          <div className="space-y-2 md:hidden">
            {filteredMembers.map((member) => (
              <article
                className="rounded-2xl border border-white/10 bg-black/30 p-4"
                key={member.userId}
              >
                <div className="flex items-start gap-3">
                  <input
                    checked={selectedIds.includes(member.userId)}
                    className="mt-1"
                    onChange={() => toggleSelected(member.userId)}
                    type="checkbox"
                  />
                  <button className="min-w-0 flex-1 text-left" onClick={() => openDrawer(member)} type="button">
                    <p className="font-semibold text-white">{memberDisplayName(member)}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      @{member.username !== "—" ? member.username : "no-username"}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <MembershipCell member={member} />
                    </div>
                  </button>
                  <RowActions
                    member={member}
                    onDelete={() => openManage(member, "delete")}
                    onEdit={() => openManage(member, "edit")}
                    onPro={() => openManage(member, "pro")}
                    onReset={() => openManage(member, "reset")}
                    onToggle={() => setMenuUserId((current) => (current === member.userId ? null : member.userId))}
                    onView={() => openDrawer(member)}
                    open={menuUserId === member.userId}
                  />
                </div>
              </article>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="w-10 px-2 py-3" />
                  <th className="px-3 py-3 text-left text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500">
                    Member
                  </th>
                  <th className="px-3 py-3 text-left text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500">
                    Account
                  </th>
                  <th className="px-3 py-3 text-left text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500">
                    Membership
                  </th>
                  <th className="px-3 py-3 text-left text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500">
                    Credentials
                  </th>
                  <th className="px-3 py-3 text-left text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500">
                    Roles
                  </th>
                  <th className="px-3 py-3 text-left text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500">
                    Joined
                  </th>
                  <th className="px-3 py-3 text-right text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr
                    className="cursor-pointer border-b border-white/5 transition hover:bg-white/[0.02]"
                    key={member.userId}
                    onClick={() => openDrawer(member)}
                  >
                    <td className="px-2 py-3" onClick={(event) => event.stopPropagation()}>
                      <input
                        checked={selectedIds.includes(member.userId)}
                        onChange={() => toggleSelected(member.userId)}
                        type="checkbox"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-semibold text-white">{memberDisplayName(member)}</p>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        @{member.username !== "—" ? member.username : "no-username"}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1">
                        <StatusPill>{accountTypeLabels[member.accountType]}</StatusPill>
                        {member.role === "admin" ? <StatusPill tone="accent">Admin</StatusPill> : null}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <MembershipCell member={member} />
                    </td>
                    <td className="px-3 py-3">
                      <CredentialsCell member={member} />
                    </td>
                    <td className="px-3 py-3">
                      <RolesCell member={member} />
                    </td>
                    <td className="px-3 py-3 text-xs text-zinc-500">{member.memberSince}</td>
                    <td className="px-3 py-3 text-right" onClick={(event) => event.stopPropagation()}>
                      <div className="inline-flex justify-end">
                        <RowActions
                          member={member}
                          onDelete={() => openManage(member, "delete")}
                          onEdit={() => openManage(member, "edit")}
                          onPro={() => openManage(member, "pro")}
                          onReset={() => openManage(member, "reset")}
                          onToggle={() =>
                            setMenuUserId((current) => (current === member.userId ? null : member.userId))
                          }
                          onView={() => openDrawer(member)}
                          open={menuUserId === member.userId}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AdminMemberDetailDrawer
        member={drawerMember}
        onClose={() => setDrawerOpen(false)}
        onDelete={() => {
          if (drawerMember) openManage(drawerMember, "delete");
        }}
        onEdit={() => {
          if (drawerMember) openManage(drawerMember, "edit");
        }}
        onManagePro={() => {
          if (drawerMember) openManage(drawerMember, "pro");
        }}
        onReset={() => {
          if (drawerMember) openManage(drawerMember, "reset");
        }}
        open={drawerOpen}
      />

      {manageMember && manageMode ? (
        <AdminMemberManageModal
          member={manageMember}
          mode={manageMode}
          onClose={closeManage}
          onSaved={() => {
            refreshMembers();
            setDrawerOpen(Boolean(drawerMember && manageMember?.userId === drawerMember.userId));
          }}
        />
      ) : null}
    </div>
  );
}
