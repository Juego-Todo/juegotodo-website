"use client";

import {
  ChevronDown,
  ChevronUp,
  Download,
  Filter,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AdminMemberDetailDrawer } from "@/components/admin/AdminMemberDetailDrawer";
import { AdminMemberManageModal } from "@/components/admin/AdminMemberManageModal";
import { AdminPortalHeader } from "@/components/admin/AdminPortalShell";
import { MemberBadge, MemberBadgeList } from "@/components/admin/MemberBadge";
import { leadershipStaffAccounts } from "@/data/leadership-staff-accounts";
import { userTypeTags } from "@/data/user-type-tags";
import {
  fetchAdminMemberRecords,
  provisionLeadershipStaffMembers,
  type AdminMemberRecord,
} from "@/lib/admin/member-directory";
import {
  resolveAccountBadge,
  resolveRoleBadges,
  memberAccountKind,
  memberSystemAccess,
} from "@/lib/admin/member-badges";
import {
  activeFilterChips,
  computeMemberStats,
  defaultMemberFilters,
  defaultMemberSort,
  filterMembers,
  isTeamMember,
  memberDisplayName,
  memberHasUnlimitedPlan,
  planCaption,
  proStatusCaption,
  sortMembers,
  toggleMemberSort,
  type AccountFilter,
  type CredentialsFilter,
  type JoinedFilter,
  type MemberDirectoryFilters,
  type MemberSort,
  type MemberSortColumn,
  type MembershipFilter,
  type QuickView,
  type RoleFilter,
} from "@/lib/admin/member-directory-filters";
import { getAllOrders } from "@/lib/commerce/storage";

type ManageMode = "edit" | "reset" | "delete" | "pro" | "tags";
type OpenPopover = "filter" | "export" | "more" | "add" | null;

const ROLE_FILTER_OPTIONS: Array<{ value: RoleFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "admin_role", label: "Admin" },
  ...Object.values(userTypeTags).map((tag) => ({ value: tag.id as RoleFilter, label: tag.label })),
];

const MEMBERSHIP_OPTIONS: Array<{ value: MembershipFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "unlimited", label: "Unlimited" },
  { value: "pro", label: "Pro" },
  { value: "free", label: "Free" },
  { value: "expired", label: "Expired" },
  { value: "pending", label: "Pending" },
];

const ACCOUNT_OPTIONS: Array<{ value: AccountFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "fan", label: "Fan" },
  { value: "staff", label: "Team" },
];

const CREDENTIAL_OPTIONS: Array<{ value: CredentialsFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "licensed", label: "Licensed" },
  { value: "pending", label: "Pending" },
  { value: "none", label: "None" },
];

const JOINED_OPTIONS: Array<{ value: JoinedFilter; label: string }> = [
  { value: "all", label: "Any time" },
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
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

function MembershipCell({ member }: { member: AdminMemberRecord }) {
  if (memberHasUnlimitedPlan(member)) {
    return <StatusPill tone="accent">Unlimited</StatusPill>;
  }
  if (!member.proResolved) {
    return <StatusPill tone="warn">Unknown</StatusPill>;
  }
  if (!member.proEntitled && member.proStatus === "none") {
    return <StatusPill>Free</StatusPill>;
  }
  const tone =
    member.proEntitled && (member.proStatus === "active" || member.proStatus === "cancelled")
      ? member.proStatus === "active"
        ? "success"
        : "warn"
      : member.proStatus === "expired" || member.proStatus === "past_due"
        ? "danger"
        : member.proStatus === "pending"
          ? "accent"
          : "warn";
  return <StatusPill tone={tone}>Pro · {proStatusCaption(member.proStatus, member.proEntitled)}</StatusPill>;
}

function RolesCell({ member }: { member: AdminMemberRecord }) {
  return (
    <MemberBadgeList
      badges={resolveRoleBadges(member)}
      empty="—"
      limit={2}
      overflowTitle="All roles"
    />
  );
}

function AccountCell({ member }: { member: AdminMemberRecord }) {
  return <MemberBadge {...resolveAccountBadge(member)} />;
}

function SortableColumnHeader({
  label,
  column,
  sort,
  onSort,
}: {
  label: string;
  column: MemberSortColumn;
  sort: MemberSort;
  onSort: (column: MemberSortColumn) => void;
}) {
  const active = sort.column === column;
  return (
    <th className="px-3 py-2.5 text-left">
      <button
        aria-label={`Sort by ${label}${active ? `, ${sort.direction === "asc" ? "ascending" : "descending"}` : ""}`}
        className={`inline-flex items-center gap-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] transition ${
          active ? "text-white" : "text-zinc-500 hover:text-zinc-300"
        }`}
        onClick={() => onSort(column)}
        type="button"
      >
        {label}
        <span className={active ? "opacity-100" : "opacity-35"} aria-hidden>
          {active && sort.direction === "asc" ? (
            <ChevronUp size={12} strokeWidth={2.5} />
          ) : (
            <ChevronDown size={12} strokeWidth={active ? 2.5 : 2} />
          )}
        </span>
      </button>
    </th>
  );
}

function ToolbarButton({
  label,
  ariaLabel,
  active,
  badge,
  onClick,
  children,
}: {
  label: string;
  ariaLabel: string;
  active?: boolean;
  badge?: number;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      aria-expanded={active}
      aria-label={ariaLabel}
      className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition ${
        active
          ? "border-white/20 bg-white/[0.08] text-white"
          : "border-white/10 bg-transparent text-zinc-400 hover:border-white/20 hover:text-zinc-200"
      }`}
      onClick={onClick}
      title={ariaLabel}
      type="button"
    >
      {children}
      {label ? <span className="hidden sm:inline">{label}</span> : null}
      {badge && badge > 0 ? (
        <span className="ml-0.5 inline-flex min-w-[1.1rem] items-center justify-center rounded-full bg-[#FF1010]/20 px-1 text-[0.65rem] font-semibold text-[#ffb4b4]">
          {badge}
        </span>
      ) : null}
    </button>
  );
}

function PopoverShell({
  title,
  onClose,
  children,
  className = "",
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <>
      <button
        aria-label="Close"
        className="fixed inset-0 z-30 bg-black/50 md:bg-transparent"
        onClick={onClose}
        type="button"
      />
      <div
        className={`fixed inset-x-0 bottom-0 z-40 max-h-[80vh] overflow-y-auto rounded-t-2xl border border-white/10 bg-[#111] p-4 shadow-2xl md:absolute md:inset-x-auto md:bottom-auto md:right-0 md:top-full md:mt-2 md:max-h-[min(70vh,28rem)] md:w-72 md:rounded-xl ${className}`}
        role="dialog"
      >
        <div className="mb-3 flex items-center justify-between md:mb-2">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-zinc-500">{title}</p>
          <button
            aria-label="Close panel"
            className="rounded-md p-1 text-zinc-500 transition hover:text-white md:hidden"
            onClick={onClose}
            type="button"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </>
  );
}

function FilterFieldGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-zinc-500">{label}</p>
      {children}
    </div>
  );
}

function CompactSelect<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  return (
    <select
      aria-label={ariaLabel}
      className="w-full rounded-lg border border-white/10 bg-black/40 px-2.5 py-2 text-sm text-zinc-200 outline-none transition focus:border-white/25"
      onChange={(event) => onChange(event.target.value as T)}
      value={value}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function downloadMembersCsv(rows: AdminMemberRecord[], filename: string) {
  const header = ["First Name", "Last Name", "Username", "Email", "Account", "Role", "Plan", "City", "Joined", "Pro ID"];
  const lines = [
    header.join(","),
    ...rows.map((member) =>
      [
        member.firstName === "—" ? "" : member.firstName,
        member.lastName === "—" ? "" : member.lastName,
        member.username === "—" ? "" : member.username,
        member.email,
        memberAccountKind(member) === "staff" || isTeamMember(member) ? "Team" : "Fan",
        memberSystemAccess(member) === "admin" ? "Admin" : "User",
        planCaption(member),
        member.city,
        member.memberSince,
        member.proMembershipId ?? "",
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(","),
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function filtersForQuickView(view: QuickView): MemberDirectoryFilters {
  switch (view) {
    case "pro":
      return { ...defaultMemberFilters, membership: "pro" };
    case "unlimited":
      return { ...defaultMemberFilters, membership: "unlimited" };
    case "team":
      return { ...defaultMemberFilters, account: "staff" };
    case "fans":
      return { ...defaultMemberFilters, account: "fan" };
    case "licensed":
      return { ...defaultMemberFilters, credentials: "licensed" };
    case "all":
    default:
      return defaultMemberFilters;
  }
}

function useIsDesktopViewport(breakpointPx = 768): boolean | null {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const media = window.matchMedia(`(min-width: ${breakpointPx}px)`);
    const sync = () => setIsDesktop(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [breakpointPx]);

  return isDesktop;
}

function RowActions({
  member,
  open,
  onToggle,
  onClose,
  onView,
  onEdit,
  onPro,
  onTags,
  onReset,
  onDelete,
}: {
  member: AdminMemberRecord;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onView: () => void;
  onEdit: () => void;
  onPro: () => void;
  onTags: () => void;
  onReset: () => void;
  onDelete: () => void;
}) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [menuStyle, setMenuStyle] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!open || !buttonRef.current) {
      setMenuStyle(null);
      return;
    }

    function placeMenu() {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        setMenuStyle(null);
        return;
      }
      const menuWidth = 192;
      const left = Math.min(
        Math.max(8, rect.right - menuWidth),
        window.innerWidth - menuWidth - 8,
      );
      setMenuStyle({
        top: rect.bottom + 6,
        left,
      });
    }

    placeMenu();
    window.addEventListener("resize", placeMenu);
    window.addEventListener("scroll", placeMenu, true);
    return () => {
      window.removeEventListener("resize", placeMenu);
      window.removeEventListener("scroll", placeMenu, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !menuStyle) return;

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, menuStyle, onClose]);

  function runAction(action: () => void) {
    action();
    onClose();
  }

  const menuItems = [
    { label: "View profile", action: onView },
    { label: "Edit member", action: onEdit },
    { label: "Manage membership", action: onPro },
    { label: "Manage credentials", action: onTags },
    { label: "Reset password", action: onReset },
  ];

  const menu =
    open && menuStyle
      ? createPortal(
          <>
            <button
              aria-label="Close actions menu"
              className="fixed inset-0 z-[89] cursor-default bg-transparent"
              onPointerDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onClose();
              }}
              type="button"
            />
            <div
              className="fixed z-[90] w-48 overflow-hidden rounded-xl border border-white/10 bg-[#111] py-1 shadow-2xl"
              role="menu"
              style={{ top: menuStyle.top, left: menuStyle.left }}
              onPointerDown={(event) => event.stopPropagation()}
            >
              {menuItems.map((item) => (
                <button
                  className="block w-full px-3 py-2 text-left text-xs text-zinc-300 transition hover:bg-white/5 hover:text-white"
                  key={item.label}
                  onPointerDown={(event) => {
                    // pointerdown beats outside-close listeners that run on mousedown/click.
                    event.preventDefault();
                    event.stopPropagation();
                    runAction(item.action);
                  }}
                  role="menuitem"
                  type="button"
                >
                  {item.label}
                </button>
              ))}
              <div className="my-1 border-t border-white/10" />
              <button
                className="block w-full px-3 py-2 text-left text-xs text-red-300 transition hover:bg-red-500/10"
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  runAction(onDelete);
                }}
                role="menuitem"
                type="button"
              >
                Delete account
              </button>
            </div>
          </>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Actions for ${memberDisplayName(member)}`}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-zinc-400 transition hover:border-white/25 hover:text-white"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onToggle();
        }}
        onMouseDown={(event) => event.stopPropagation()}
        ref={buttonRef}
        type="button"
      >
        <MoreHorizontal size={15} aria-hidden />
      </button>
      {menu}
    </>
  );
}

export function AdminMemberDirectoryPanel({ embedded = false }: { embedded?: boolean }) {
  const [members, setMembers] = useState<AdminMemberRecord[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [proLoadError, setProLoadError] = useState("");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [filters, setFilters] = useState<MemberDirectoryFilters>(defaultMemberFilters);
  const [quickView, setQuickView] = useState<QuickView>("all");
  const [sort, setSort] = useState<MemberSort>(defaultMemberSort);
  const [menuUserId, setMenuUserId] = useState<string | null>(null);
  const [drawerMember, setDrawerMember] = useState<AdminMemberRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [manageMember, setManageMember] = useState<AdminMemberRecord | null>(null);
  const [manageMode, setManageMode] = useState<ManageMode | null>(null);
  const [provisionStatus, setProvisionStatus] = useState("");
  const [provisioning, setProvisioning] = useState(false);
  const [openPopover, setOpenPopover] = useState<OpenPopover>(null);
  const autoProvisionedRef = useRef(false);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const searchValueRef = useRef(search);
  searchValueRef.current = search;
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const refreshRequestIdRef = useRef(0);
  const isDesktop = useIsDesktopViewport();

  const refreshMembers = useCallback(() => {
    const requestId = ++refreshRequestIdRef.current;
    void getAllOrders()
      .then((orders) => fetchAdminMemberRecords(orders))
      .then(({ records, proLoadError: nextProLoadError }) => {
        if (requestId !== refreshRequestIdRef.current) return;

        setProLoadError(nextProLoadError ?? "");
        setError("");
        setLoaded(true);
        setMembers((previous) => {
          if (!nextProLoadError) {
            return records;
          }
          if (previous.length === 0) {
            // First load failed — records already marked proResolved=false.
            return records;
          }
          // Preserve previously known Pro fields when a later Pro fetch fails.
          const previousById = new Map(previous.map((member) => [member.userId, member]));
          return records.map((record) => {
            const prior = previousById.get(record.userId);
            if (!prior?.proResolved) return record;
            return {
              ...record,
              proResolved: true,
              proStatus: prior.proStatus,
              proEntitled: prior.proEntitled,
              proMembershipId: prior.proMembershipId,
              proExpiresAt: prior.proExpiresAt,
              proPaymentStatus: prior.proPaymentStatus,
            };
          });
        });
        setDrawerMember((current) => {
          if (!current) return current;
          if (requestId !== refreshRequestIdRef.current) return current;
          const next = records.find((record) => record.userId === current.userId);
          if (!next) {
            setDrawerOpen(false);
            return null;
          }
          if (nextProLoadError && current.proResolved) {
            return {
              ...next,
              proResolved: true,
              proStatus: current.proStatus,
              proEntitled: current.proEntitled,
              proMembershipId: current.proMembershipId,
              proExpiresAt: current.proExpiresAt,
              proPaymentStatus: current.proPaymentStatus,
            };
          }
          return next;
        });
      })
      .catch((caught) => {
        if (requestId !== refreshRequestIdRef.current) return;
        setError(caught instanceof Error ? caught.message : "Unable to load member directory.");
        setLoaded(true);
      });
  }, []);

  function openManage(member: AdminMemberRecord, mode: ManageMode) {
    setDrawerOpen(false);
    setDrawerMember(null);
    setMenuUserId(null);
    setManageMember(member);
    setManageMode(mode);
  }

  function closeManage() {
    setManageMember(null);
    setManageMode(null);
  }

  function openDrawer(member: AdminMemberRecord) {
    setManageMember(null);
    setManageMode(null);
    setDrawerMember(member);
    setDrawerOpen(true);
    setMenuUserId(null);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setDrawerMember(null);
  }

  const createLeadershipAccounts = useCallback(async () => {
    setProvisioning(true);
    setProvisionStatus("Creating leadership accounts...");
    setOpenPopover(null);
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

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (event.key === "Escape") {
        if (openPopover) {
          setOpenPopover(null);
          return;
        }
        if (document.activeElement === searchRef.current && searchValueRef.current) {
          setSearch("");
        }
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openPopover]);

  const stats = useMemo(() => computeMemberStats(members), [members]);

  const filteredMembers = useMemo(
    () =>
      sortMembers(
        filterMembers(members, { search: deferredSearch, filters, quickView }),
        sort,
      ),
    [members, deferredSearch, filters, quickView, sort],
  );

  const chips = useMemo(() => activeFilterChips(filters), [filters]);
  const activeFilterCount = chips.length;

  function applyQuickView(view: QuickView) {
    setQuickView(view);
    setFilters(filtersForQuickView(view));
    setOpenPopover(null);
  }

  function updateFilter<K extends keyof MemberDirectoryFilters>(key: K, value: MemberDirectoryFilters[K]) {
    setFilters((current) => {
      const next = { ...current, [key]: value };
      setQuickView("all");
      return next;
    });
  }

  function clearFilters() {
    setFilters(defaultMemberFilters);
    setQuickView("all");
    setSearch("");
    setOpenPopover(null);
  }

  function clearFilterChipsOnly() {
    setFilters(defaultMemberFilters);
    setQuickView("all");
  }

  function applySortColumn(column: MemberSortColumn) {
    setSort((current) => toggleMemberSort(current, column));
  }

  function exportMembers(scope: "view" | "all") {
    const rows = scope === "view" ? filteredMembers : members;
    downloadMembersCsv(
      rows,
      scope === "view" ? "juegotodo-members-current-view.csv" : "juegotodo-members-all.csv",
    );
    setOpenPopover(null);
  }

  function togglePopover(next: OpenPopover) {
    setOpenPopover((current) => (current === next ? null : next));
    setMenuUserId(null);
  }

  const quickViews: Array<{ id: QuickView; label: string; count: number | null }> = [
    { id: "all", label: "All Members", count: stats.total },
    { id: "team", label: "Team", count: stats.team },
    { id: "fans", label: "Fan Accounts", count: stats.fans },
    { id: "pro", label: "Pro Plan", count: proLoadError ? null : stats.pro },
    { id: "unlimited", label: "Unlimited", count: stats.unlimited },
    { id: "licensed", label: "Licensed", count: stats.licensed },
  ];

  return (
    <div className="space-y-5">
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
              ? `${stats.total} members · ${stats.team} team · ${stats.fans} fans`
              : "Loading member community…"}
          </p>
        </div>

        <div className="relative">
          <button
            aria-expanded={openPopover === "add"}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#FF1010] px-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#ff2a2a]"
            onClick={() => togglePopover("add")}
            type="button"
          >
            <Plus size={14} aria-hidden />
            Add Member
            <ChevronDown size={14} aria-hidden />
          </button>
          {openPopover === "add" ? (
            <PopoverShell title="Add member" onClose={() => setOpenPopover(null)} className="md:w-64">
              <button
                className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-zinc-200 transition hover:bg-white/5 disabled:opacity-50"
                disabled={provisioning}
                onClick={() => void createLeadershipAccounts()}
                type="button"
              >
                Add leadership accounts
              </button>
              <p className="mt-1 px-1 text-xs leading-relaxed text-zinc-500">
                Provisions configured leadership staff with temporary passwords.
              </p>
            </PopoverShell>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {(
          [
            { label: "Members", value: loaded ? stats.total : null, view: "all" as QuickView },
            { label: "Team", value: loaded ? stats.team : null, view: "team" as QuickView },
            { label: "Fan Accounts", value: loaded ? stats.fans : null, view: "fans" as QuickView },
            {
              label: "Pro Plan",
              value: !loaded || proLoadError ? null : stats.pro,
              view: "pro" as QuickView,
            },
          ] as const
        ).map((card) => (
          <button
            className={`rounded-xl border px-3.5 py-3.5 text-left transition ${
              quickView === card.view
                ? "border-[#FF1010]/35 bg-[#FF1010]/10"
                : "border-white/10 bg-white/[0.02] hover:border-white/20"
            }`}
            key={card.label}
            onClick={() => applyQuickView(card.view)}
            type="button"
          >
            <p className="text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-zinc-500">{card.label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
              {card.value === null ? "—" : card.value}
            </p>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {quickViews.map((view) => (
          <button
            className={`rounded-full border px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.1em] transition ${
              quickView === view.id
                ? "border-[#FF1010]/40 bg-[#FF1010]/12 text-[#ffb4b4]"
                : "border-white/10 text-zinc-500 hover:border-white/20 hover:text-zinc-300"
            }`}
            key={view.id}
            onClick={() => applyQuickView(view.id)}
            type="button"
          >
            {view.label}
            <span className="ml-1 text-zinc-600">{!loaded || view.count === null ? "—" : view.count}</span>
          </button>
        ))}
      </div>

      <div className="space-y-3" ref={toolbarRef}>
        <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-2 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={15} aria-hidden />
            <input
              className="w-full rounded-lg border border-transparent bg-transparent py-2 pl-9 pr-9 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-white/10"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search members by name, email, username, city or Pro ID..."
              ref={searchRef}
              spellCheck={false}
              value={search}
            />
            <button
              aria-hidden={!search}
              aria-label="Clear search"
              className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-zinc-500 transition-opacity hover:text-white ${
                search ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
              onClick={() => {
                setSearch("");
                searchRef.current?.focus();
              }}
              tabIndex={search ? 0 : -1}
              type="button"
            >
              <X size={14} />
            </button>
          </div>

          <div className="relative flex flex-wrap items-center gap-1.5 sm:flex-nowrap">
            <ToolbarButton
              active={openPopover === "filter"}
              ariaLabel="Filter members"
              badge={activeFilterCount}
              label="Filter"
              onClick={() => togglePopover("filter")}
            >
              <Filter size={14} aria-hidden />
            </ToolbarButton>

            <ToolbarButton
              active={openPopover === "export"}
              ariaLabel="Export members"
              label="Export"
              onClick={() => togglePopover("export")}
            >
              <Download size={14} aria-hidden />
            </ToolbarButton>

            <ToolbarButton
              active={openPopover === "more"}
              ariaLabel="More member actions"
              label=""
              onClick={() => togglePopover("more")}
            >
              <MoreHorizontal size={14} aria-hidden />
            </ToolbarButton>

            {openPopover === "filter" ? (
              <PopoverShell title="Filter members" onClose={() => setOpenPopover(null)} className="md:w-80">
                <div className="space-y-4">
                  <FilterFieldGroup label="Membership">
                    <CompactSelect
                      ariaLabel="Membership filter"
                      onChange={(value) => updateFilter("membership", value)}
                      options={MEMBERSHIP_OPTIONS}
                      value={filters.membership}
                    />
                  </FilterFieldGroup>
                  <FilterFieldGroup label="Account">
                    <CompactSelect
                      ariaLabel="Account filter"
                      onChange={(value) => updateFilter("account", value)}
                      options={ACCOUNT_OPTIONS}
                      value={filters.account}
                    />
                  </FilterFieldGroup>
                  <FilterFieldGroup label="Credentials">
                    <CompactSelect
                      ariaLabel="Credentials filter"
                      onChange={(value) => updateFilter("credentials", value)}
                      options={CREDENTIAL_OPTIONS}
                      value={filters.credentials}
                    />
                  </FilterFieldGroup>
                  <FilterFieldGroup label="Role">
                    <CompactSelect
                      ariaLabel="Role filter"
                      onChange={(value) => updateFilter("role", value)}
                      options={ROLE_FILTER_OPTIONS}
                      value={filters.role}
                    />
                  </FilterFieldGroup>
                  <FilterFieldGroup label="Joined">
                    <CompactSelect
                      ariaLabel="Joined filter"
                      onChange={(value) => updateFilter("joined", value)}
                      options={JOINED_OPTIONS}
                      value={filters.joined}
                    />
                  </FilterFieldGroup>
                  {activeFilterCount > 0 ? (
                    <button
                      className="text-xs font-medium text-[#FF1010] transition hover:text-[#ff3a3a]"
                      onClick={clearFilterChipsOnly}
                      type="button"
                    >
                      Clear all filters
                    </button>
                  ) : null}
                </div>
              </PopoverShell>
            ) : null}

            {openPopover === "export" ? (
              <PopoverShell title="Export members" onClose={() => setOpenPopover(null)}>
                <div className="space-y-3">
                  <div className="space-y-0.5">
                    <button
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-zinc-300 transition hover:bg-white/[0.04] hover:text-white"
                      onClick={() => exportMembers("view")}
                      type="button"
                    >
                      <Download size={14} aria-hidden />
                      Export current view
                    </button>
                    <button
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-zinc-300 transition hover:bg-white/[0.04] hover:text-white"
                      onClick={() => exportMembers("all")}
                      type="button"
                    >
                      <Download size={14} aria-hidden />
                      Export all members
                    </button>
                  </div>
                  <div>
                    <p className="mb-1.5 text-[0.65rem] font-medium uppercase tracking-[0.12em] text-zinc-500">
                      Format
                    </p>
                    <p className="rounded-lg border border-white/10 bg-black/30 px-2.5 py-2 text-sm text-zinc-300">
                      CSV
                    </p>
                  </div>
                </div>
              </PopoverShell>
            ) : null}

            {openPopover === "more" ? (
              <PopoverShell title="More" onClose={() => setOpenPopover(null)} className="md:w-56">
                <button
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-zinc-300 transition hover:bg-white/[0.04] hover:text-white"
                  onClick={() => {
                    refreshMembers();
                    setOpenPopover(null);
                  }}
                  type="button"
                >
                  <RefreshCw size={14} aria-hidden />
                  Refresh
                </button>
                <button
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-zinc-300 transition hover:bg-white/[0.04] hover:text-white disabled:opacity-50"
                  disabled={provisioning}
                  onClick={() => void createLeadershipAccounts()}
                  type="button"
                >
                  <Plus size={14} aria-hidden />
                  Add leadership accounts
                </button>
              </PopoverShell>
            ) : null}
          </div>
        </div>

        {chips.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {chips.map((chip) => (
              <button
                className="inline-flex items-center gap-1 rounded-full border border-white/12 bg-white/[0.04] px-2.5 py-1 text-[0.65rem] font-medium text-zinc-300 transition hover:border-white/25 hover:text-white"
                key={chip.key}
                onClick={() =>
                  setFilters((current) => {
                    const next = {
                      ...current,
                      [chip.key]: defaultMemberFilters[chip.key],
                    };
                    setQuickView("all");
                    return next;
                  })
                }
                type="button"
              >
                {chip.label.replace(/^(Plan|Account|Credentials|Role):\s*/i, "")}
                <X size={11} aria-hidden />
              </button>
            ))}
            <button
              className="ml-1 text-[0.65rem] font-medium text-zinc-500 transition hover:text-[#FF1010]"
              onClick={clearFilterChipsOnly}
              type="button"
            >
              Clear all
            </button>
          </div>
        ) : null}

        {provisionStatus ? <p className="text-sm text-zinc-400">{provisionStatus}</p> : null}

        {proLoadError ? (
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.08] px-4 py-3 text-sm text-amber-50">
            <p className="font-semibold">Unable to load Pro membership data.</p>
            <p className="mt-1 text-amber-50/70">{proLoadError}</p>
            <button
              className="mt-2 rounded-lg border border-amber-300/25 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-amber-50"
              onClick={refreshMembers}
              type="button"
            >
              Retry Pro data
            </button>
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/25 bg-red-500/[0.08] px-4 py-5 text-sm text-red-100">
          <p className="font-semibold">Unable to load members.</p>
          <p className="mt-1 text-red-100/70">Please try again.</p>
          <button
            className="mt-3 rounded-lg border border-red-300/25 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-red-50"
            onClick={refreshMembers}
            type="button"
          >
            Try again
          </button>
        </div>
      ) : !loaded ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div className="h-14 animate-pulse rounded-xl border border-white/5 bg-white/[0.03]" key={index} />
          ))}
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="rounded-xl border border-white/10 px-5 py-12 text-center">
          <p className="text-lg font-semibold text-white">No members found</p>
          <p className="mt-1 text-sm text-zinc-500">Try adjusting your filters or search.</p>
          <button
            className="mt-4 rounded-lg border border-white/12 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-300"
            onClick={clearFilters}
            type="button"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-2 sm:p-3">
          <div className="mb-2 px-1">
            <p className="text-sm text-zinc-500">
              {filteredMembers.length} of {members.length} members
            </p>
          </div>

          {isDesktop === null ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div className="h-14 animate-pulse rounded-xl border border-white/5 bg-white/[0.03]" key={index} />
              ))}
            </div>
          ) : !isDesktop ? (
          <div className="space-y-2">
            {filteredMembers.map((member) => (
              <article className="rounded-xl border border-white/10 bg-black/30 p-3.5" key={member.userId}>
                <div className="flex items-start gap-3">
                  <button className="min-w-0 flex-1 text-left" onClick={() => openDrawer(member)} type="button">
                    <p className="font-medium text-white">
                      {member.firstName !== "—" ? member.firstName : "—"}{" "}
                      <span className="text-zinc-300">
                        {member.lastName !== "—" ? member.lastName : ""}
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {member.username !== "—" ? `@${member.username}` : "—"}
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      <MembershipCell member={member} />
                    </div>
                  </button>
                  <RowActions
                    member={member}
                    onClose={() => setMenuUserId(null)}
                    onDelete={() => openManage(member, "delete")}
                    onEdit={() => openManage(member, "edit")}
                    onPro={() => openManage(member, "pro")}
                    onReset={() => openManage(member, "reset")}
                    onTags={() => openManage(member, "tags")}
                    onToggle={() => setMenuUserId((current) => (current === member.userId ? null : member.userId))}
                    onView={() => openDrawer(member)}
                    open={menuUserId === member.userId}
                  />
                </div>
              </article>
            ))}
          </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  {(
                    [
                      { label: "First Name", column: "firstName" },
                      { label: "Last Name", column: "lastName" },
                      { label: "Username", column: "username" },
                      { label: "Account", column: "account" },
                      { label: "Membership", column: "plan" },
                      { label: "Roles", column: "roles" },
                      { label: "Joined", column: "joined" },
                    ] as const
                  ).map((header) => (
                    <SortableColumnHeader
                      column={header.column}
                      key={header.column}
                      label={header.label}
                      onSort={applySortColumn}
                      sort={sort}
                    />
                  ))}
                  <th className="px-3 py-2.5 text-right text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                    <span className="sr-only">Actions</span>
                    <MoreHorizontal size={14} className="ml-auto text-zinc-600" aria-hidden />
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
                    <td className="px-3 py-3">
                      <p className="font-medium text-white">
                        {member.firstName !== "—" ? member.firstName : "—"}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-medium text-zinc-200">
                        {member.lastName !== "—" ? member.lastName : "—"}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-sm text-zinc-400">
                        {member.username !== "—" ? `@${member.username}` : "—"}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <AccountCell member={member} />
                    </td>
                    <td className="px-3 py-3">
                      <MembershipCell member={member} />
                    </td>
                    <td className="px-3 py-3">
                      <RolesCell member={member} />
                    </td>
                    <td className="px-3 py-3 text-xs text-zinc-500">{member.memberSince}</td>
                    <td className="px-3 py-3 text-right" onClick={(event) => event.stopPropagation()}>
                      <div className="inline-flex justify-end">
                        <RowActions
                          member={member}
                          onClose={() => setMenuUserId(null)}
                          onDelete={() => openManage(member, "delete")}
                          onEdit={() => openManage(member, "edit")}
                          onPro={() => openManage(member, "pro")}
                          onReset={() => openManage(member, "reset")}
                          onTags={() => openManage(member, "tags")}
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
          )}
        </div>
      )}

      <AdminMemberDetailDrawer
        member={drawerMember}
        onClose={closeDrawer}
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
          }}
        />
      ) : null}
    </div>
  );
}
