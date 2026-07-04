"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserTypeBadge } from "@/components/profile/UserTypeBadge";
import type { LicenseApplication } from "@/data/license-applications";
import { resolvePortalNavigation } from "@/data/profile-portal-nav";
import { resolveAccountTypeLabel, resolveUserTypeTagIds, type UserTypeTagId } from "@/data/user-type-tags";
import type { MemberRecord } from "@/lib/profile/member-record";
import type { UserProfile } from "@/lib/auth/types";
import type { LucideIcon } from "lucide-react";

export type ProfileSectionId =
  | "overview"
  | "membership"
  | "licenses"
  | "important-documents"
  | "digital-id"
  | "calendar"
  | "competition-entries"
  | "events"
  | "certificates"
  | "club"
  | "payments"
  | "notifications"
  | "settings"
  | "profile"
  | "dashboard"
  | "fighter"
  | "record"
  | "history"
  | "achievements"
  | "medical"
  | "rankings"
  | "coach-tools"
  | "official-tools"
  | "judge-tools"
  | "council-tools"
  | "staff-tools"
  | "admin-members"
  | "admin-licenses"
  | "admin-reports"
  | "orders"
  | "wishlist"
  | "saved-fighters"
  | "saved-teams"
  | "saved-events";

export function ProfileSidebarNav({
  user,
  memberRecord,
  licenseApplication = null,
  adminAssignedTags = [],
  activeSection,
  onSectionChange,
  unreadCount,
  pendingLicenseCount = 0,
}: {
  user: UserProfile;
  memberRecord: MemberRecord;
  licenseApplication?: LicenseApplication | null;
  adminAssignedTags?: UserTypeTagId[];
  activeSection: ProfileSectionId;
  onSectionChange: (section: ProfileSectionId) => void;
  unreadCount: number;
  pendingLicenseCount?: number;
}) {
  const pathname = usePathname();
  const tagIds = resolveUserTypeTagIds(user, licenseApplication, adminAssignedTags);
  const accountTypeLabel = resolveAccountTypeLabel(user, tagIds);
  const navGroups = resolvePortalNavigation({
    tagIds,
    isAdmin: memberRecord.isAdmin,
    unreadCount,
    pendingLicenseCount,
  });

  return (
    <nav
      aria-label="Profile navigation"
      className="glass-panel flex max-h-[calc(100dvh-7rem)] flex-col overflow-hidden rounded-[1.5rem] xl:sticky xl:top-28 xl:max-h-[calc(100dvh-8rem)]"
    >
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-4 pb-2">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-3 px-2 text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-zinc-400">
              {group.label}
            </p>
            <div className="flex flex-col gap-1.5">
              {group.items.map((item) =>
            item.href ? (
              <SidebarLink
                active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                href={item.href}
                icon={item.icon}
                key={item.href}
                label={item.label}
              />
            ) : (
                  <SidebarButton
                    active={activeSection === item.id || (activeSection === "profile" && item.id === "overview")}
                    badge={item.badge}
                    icon={item.icon}
                    key={item.id}
                    label={item.label}
                    onClick={() => onSectionChange(item.id)}
                  />
                ),
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="shrink-0 border-t border-white/10 px-4 py-5">
        <p className="text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-[#FF1010]">Account Type</p>
        <p className="font-display mt-2 text-xl uppercase leading-none tracking-wide text-white">{accountTypeLabel}</p>
        <div className="mt-3 flex flex-col gap-2">
          {tagIds.map((tagId) => (
            <UserTypeBadge compact key={tagId} tagId={tagId} />
          ))}
        </div>
        <Link
          className="mt-4 inline-flex min-h-10 items-center text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-zinc-400 transition hover:text-white"
          href="/register-for-license"
        >
          Register For License →
        </Link>
      </div>
    </nav>
  );
}

const sidebarItemClass =
  "group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition duration-200";

function SidebarButton({
  label,
  icon: Icon,
  active,
  onClick,
  badge,
}: {
  label: string;
  icon: LucideIcon;
  active: boolean;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      className={`${sidebarItemClass} ${
        active
          ? "bg-[#FF1010] text-white shadow-[0_8px_24px_rgba(255,16,16,0.28)]"
          : "text-zinc-300 hover:bg-white/[0.06] hover:text-white"
      }`}
      onClick={onClick}
      type="button"
    >
      <SidebarIcon active={active} icon={Icon} />
      <span className="min-w-0 flex-1 text-[0.6875rem] font-bold uppercase leading-snug tracking-[0.1em]">
        {label}
      </span>
      {badge && badge > 0 ? (
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[0.625rem] font-bold ${
            active ? "bg-white/20 text-white" : "bg-[#FF1010] text-white"
          }`}
        >
          {badge}
        </span>
      ) : null}
    </button>
  );
}

function SidebarLink({
  label,
  icon: Icon,
  href,
  active,
}: {
  label: string;
  icon: LucideIcon;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      className={`${sidebarItemClass} ${
        active
          ? "bg-[#FF1010] text-white shadow-[0_8px_24px_rgba(255,16,16,0.28)]"
          : "text-zinc-300 hover:bg-white/[0.06] hover:text-white"
      }`}
      href={href}
    >
      <SidebarIcon active={active} icon={Icon} />
      <span className="min-w-0 flex-1 text-[0.6875rem] font-bold uppercase leading-snug tracking-[0.1em]">
        {label}
      </span>
    </Link>
  );
}

function SidebarIcon({ icon: Icon, active }: { icon: LucideIcon; active: boolean }) {
  return (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
        active ? "bg-white/15 text-white" : "bg-white/[0.04] text-zinc-400 group-hover:bg-white/[0.08] group-hover:text-white"
      }`}
    >
      <Icon size={16} strokeWidth={2.25} aria-hidden />
    </span>
  );
}
