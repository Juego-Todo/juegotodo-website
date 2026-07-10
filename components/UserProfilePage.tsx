"use client";

import {
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BackButton } from "@/components/BackButton";
import { MotionSection } from "@/components/MotionSection";
import {
  AchievementsSection,
  FightHistorySection,
  FighterAnalyticsSection,
  FighterCardHero,
  PhysicalAttributesCard,
} from "@/components/profile/FighterIdentitySections";
import { AdminMembershipPanel } from "@/components/profile/AdminMembershipPanel";
import {
  AdminMembershipLicenseAnalyticsContent,
  AdminShopAnalyticsContent,
} from "@/components/profile/AdminAnalyticsContent";
import { AdminPageAccessPanel } from "@/components/profile/AdminPageAccessPanel";
import { AdminCalendarPanel } from "@/components/admin/AdminCalendarPanel";
import { ProfileDashboard } from "@/components/profile/dashboard/ProfileDashboard";
import { LicenseApplicationProfileSection } from "@/components/profile/LicenseApplicationProfileSection";
import {
  AdminPermissionsPanel,
  LicenseProgressPanel,
  RequirementsPanel,
} from "@/components/profile/MemberPortalPanels";
import type { ProfileSectionId } from "@/components/profile/ProfileSidebarNav";
import type { WorkspaceTabId } from "@/lib/profile/mission-control";
import { events, fighters, getShopProduct } from "@/data/site";
import { getAdminAssignedTags } from "@/lib/profile/account-tags";
import { buildMemberRecord } from "@/lib/profile/member-record";
import { teams } from "@/data/teams";
import { useAuth } from "@/lib/auth/context";
import { useCommerce } from "@/lib/commerce/context";
import { isAdminProfile } from "@/lib/commerce/storage";
import { formatCurrency } from "@/lib/commerce/pricing";
import {
  membershipTierLabels,
  orderStatusLabels,
  paymentMethodLabels,
  type MembershipTier,
} from "@/lib/commerce/types";
import type { LicenseApplication } from "@/data/license-applications";
import { fetchLicenseApplicationByUserId, fetchPendingLicenseApplicationCount } from "@/lib/licenses/storage";
import { buildProfileIdentity, getJtgcTierLabel } from "@/lib/profile/identity";
import {
  getProfileRolePreviewLabel,
  isProfileRoleKind,
  profileRolePreviewOptions,
  type ProfileRoleKind,
} from "@/lib/profile/role-modules";
import { useProfilePortrait } from "@/lib/profile/use-profile-portrait";

const membershipTiers = Object.keys(membershipTierLabels) as MembershipTier[];
const PROFILE_VIEW_AS_STORAGE_KEY = "jt-profile-view-as";

function resolveSection(tab: string | null): ProfileSectionId {
  const map: Record<string, ProfileSectionId> = {
    overview: "overview",
    profile: "overview",
    membership: "membership",
    licenses: "licenses",
    "important-documents": "important-documents",
    "digital-id": "digital-id",
    calendar: "calendar",
    "competition-entries": "competition-entries",
    certificates: "certificates",
    club: "club",
    payments: "payments",
    medical: "medical",
    rankings: "rankings",
    dashboard: "overview",
    fighter: "fighter",
    record: "record",
    history: "history",
    achievements: "achievements",
    "coach-tools": "coach-tools",
    "official-tools": "official-tools",
    "judge-tools": "judge-tools",
    "council-tools": "council-tools",
    "staff-tools": "staff-tools",
    "admin-members": "admin-members",
    "admin-licenses": "admin-licenses",
    "admin-reports": "admin-reports",
    orders: "orders",
    wishlist: "wishlist",
    fighters: "saved-fighters",
    teams: "saved-teams",
    events: "events",
    notifications: "notifications",
    settings: "settings",
  };
  return map[tab ?? "overview"] ?? "overview";
}

export function UserProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSection = resolveSection(searchParams.get("tab"));
  const { user, loading, logout } = useAuth();
  const {
    userData,
    orders,
    toggleWishlist,
    toggleSavedFighter,
    toggleSavedEvent,
    toggleSavedTeam,
    updateUserCommerceProfile,
    markNotificationRead,
  } = useCommerce();

  const [activeSection, setActiveSection] = useState<ProfileSectionId>(initialSection);
  const [activeTab, setActiveTab] = useState<WorkspaceTabId>("overview");
  const [membershipTier, setMembershipTier] = useState<MembershipTier>("free");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [licenseApplication, setLicenseApplication] = useState<LicenseApplication | null>(null);
  const [previewRoleKind, setPreviewRoleKind] = useState<ProfileRoleKind | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const stored = localStorage.getItem(PROFILE_VIEW_AS_STORAGE_KEY);
    return stored && isProfileRoleKind(stored) ? stored : null;
  });
  const [pendingPreviewRole, setPendingPreviewRole] = useState<ProfileRoleKind | "">(() => {
    if (typeof window === "undefined") {
      return "";
    }

    const stored = localStorage.getItem(PROFILE_VIEW_AS_STORAGE_KEY);
    return stored && isProfileRoleKind(stored) ? stored : "";
  });
  const profileSyncKey = user ? `${user.id}|${userData.membershipTier}` : null;
  const [lastProfileSyncKey, setLastProfileSyncKey] = useState<string | null>(null);
  const { portraitImage, savePortrait, removePortrait } = useProfilePortrait(
    user?.id,
    licenseApplication?.uploads?.profilePhoto,
  );

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?next=/profile");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) {
      return;
    }

    void fetchLicenseApplicationByUserId(user.id).then(setLicenseApplication);
  }, [user]);

  const adminAssignedTags = useMemo(
    () => (user ? getAdminAssignedTags(user.id) : []),
    [user],
  );
  const [pendingLicenseCount, setPendingLicenseCount] = useState(0);

  useEffect(() => {
    if (!user || !isAdminProfile(user)) {
      return;
    }

    void fetchPendingLicenseApplicationCount().then(setPendingLicenseCount);
  }, [user]);
  const effectivePendingLicenseCount = user && isAdminProfile(user) ? pendingLicenseCount : 0;

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (!user || !isAdminProfile(user)) {
      return;
    }

    const adminRouteMap: Partial<Record<ProfileSectionId, string>> = {
      "admin-members": "/admin/members",
      "admin-reports": "/admin/reports",
      "important-documents": "/admin/documents",
      "official-tools": "/admin/officials",
      "council-tools": "/admin/grand-council",
      orders: "/admin/store-orders",
      notifications: "/admin/announcements",
      settings: "/admin/settings",
    };

    const route = tab ? adminRouteMap[resolveSection(tab)] : undefined;
    if (route) {
      router.replace(route);
    }
  }, [searchParams, user, router]);

  const adminTabDirective =
    user && isAdminProfile(user)
      ? searchParams.get("tab") === "membership" || searchParams.get("tab") === "admin-licenses"
        ? "membership-activity"
        : searchParams.get("tab") === "calendar"
          ? "calendar"
          : null
      : null;
  const [lastAdminTabDirective, setLastAdminTabDirective] = useState<string | null>(null);

  if (adminTabDirective && adminTabDirective !== lastAdminTabDirective) {
    setLastAdminTabDirective(adminTabDirective);
    if (adminTabDirective === "membership-activity") {
      setActiveSection("membership");
      setActiveTab("activity");
    } else if (adminTabDirective === "calendar") {
      setActiveTab("calendar");
    }
  }

  if (profileSyncKey && profileSyncKey !== lastProfileSyncKey) {
    setLastProfileSyncKey(profileSyncKey);
    setMembershipTier(userData.membershipTier);
  }

  const identity = useMemo(() => {
    if (!user) {
      return null;
    }
    return buildProfileIdentity(user, userData);
  }, [user, userData]);

  const memberRecord = useMemo(() => {
    if (!user || !identity) {
      return null;
    }
    return buildMemberRecord({
      user,
      userData,
      identity,
      licenseApplication,
      adminAssignedTags,
      isAdmin: isAdminProfile(user),
      ordersCount: orders.length,
      pendingLicenseCount: effectivePendingLicenseCount,
      previewRoleKind,
    });
  }, [user, userData, identity, licenseApplication, adminAssignedTags, orders.length, effectivePendingLicenseCount, previewRoleKind]);

  if (loading || !user || !identity || !memberRecord) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4 pt-8">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-zinc-400">Loading profile...</p>
      </main>
    );
  }

  const savedFighters = fighters.filter((fighter) => userData.savedFighters.includes(fighter.slug));
  const savedTeamsList = teams.filter((team) => userData.savedTeams.includes(team.slug));
  const savedEvents = events.filter((event) => userData.savedEvents.includes(event.slug));
  const wishlistProducts = userData.wishlist
    .map((slug) => getShopProduct(slug))
    .filter((product): product is NonNullable<typeof product> => Boolean(product));
  const isAdmin = isAdminProfile(user);
  const unreadCount = userData.notifications.filter((entry) => !entry.read).length;

  async function handleSaveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      updateUserCommerceProfile({ membershipTier });
      setMessage("Settings updated successfully.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    void logout().then(() => {
      router.push("/login");
    });
  }

  function handleSectionChange(section: ProfileSectionId) {
    if (section === "calendar") {
      if (memberRecord!.isAdmin) {
        setActiveSection(section);
        setActiveTab("calendar");
        return;
      }

      router.push("/calendar");
      return;
    }

    setActiveSection(section);

    const isFighterContext = previewRoleKind === "fighter" || memberRecord!.roleModule.kind === "fighter";

    const tabBySection: Partial<Record<ProfileSectionId, WorkspaceTabId>> = {
      overview: "overview",
      profile: "overview",
      dashboard: isFighterContext ? "camp" : "overview",
      membership: memberRecord!.isAdmin ? "activity" : "overview",
      "admin-licenses": memberRecord!.isAdmin ? "activity" : "overview",
      settings: "settings",
      licenses: isFighterContext ? "camp" : memberRecord!.isAdmin ? "overview" : "documents",
      "important-documents": memberRecord!.isAdmin ? "overview" : "documents",
      "digital-id": memberRecord!.isAdmin ? "overview" : "documents",
      achievements: memberRecord!.isAdmin ? "settings" : "achievements",
      record: isFighterContext ? "overview" : memberRecord!.isAdmin ? "membership-analytics" : "analytics",
      fighter: isFighterContext ? "camp" : "analytics",
      "admin-reports": memberRecord!.isAdmin ? "shop-analytics" : "overview",
      calendar: memberRecord!.isAdmin ? "calendar" : "overview",
      events: memberRecord!.isAdmin ? "calendar" : "overview",
      "competition-entries": memberRecord!.isAdmin ? "calendar" : "overview",
      medical: isFighterContext ? "camp" : "documents",
      history: "activity",
    };

    if (tabBySection[section]) {
      setActiveTab(tabBySection[section]!);
    }
  }

  function handleTabChange(tab: WorkspaceTabId) {
    setActiveTab(tab);

    if ((memberRecord?.isAdmin || (user && isAdminProfile(user))) && tab === "activity") {
      setActiveSection("membership");
      router.replace("/profile?tab=membership", { scroll: false });
    }
  }

  function handleBackToWorkspace() {
    setActiveSection("overview");
    setActiveTab("overview");
  }

  function handleApplyViewAs() {
    const nextRole = pendingPreviewRole === "" ? null : pendingPreviewRole;
    setPreviewRoleKind(nextRole);

    if (nextRole) {
      localStorage.setItem(PROFILE_VIEW_AS_STORAGE_KEY, nextRole);
    } else {
      localStorage.removeItem(PROFILE_VIEW_AS_STORAGE_KEY);
    }

    setActiveSection("overview");
    setActiveTab("overview");
  }

  function handleExitViewAs() {
    setPreviewRoleKind(null);
    setPendingPreviewRole("");
    localStorage.removeItem(PROFILE_VIEW_AS_STORAGE_KEY);
    setActiveSection("overview");
    setActiveTab("overview");
  }

  const hubSections: ProfileSectionId[] = ["overview", "profile", "dashboard", "membership"];
  const isDeepSection = !hubSections.includes(activeSection);

  const documentsContent = memberRecord.isAdmin ? null : (
    <div className="space-y-6">
      <RequirementsPanel percent={memberRecord.requirementsPercent} requirements={memberRecord.requirements} />
      <LicenseProgressPanel steps={memberRecord.progressSteps} />
      <LicenseApplicationProfileSection application={licenseApplication} />
    </div>
  );

  const achievementsContent =
    identity.athlete ? <AchievementsSection athlete={identity.athlete} /> : (
      <PortalPlaceholderSection
        description="Achievements and league recognitions appear here once earned through sanctioned competition."
        title="Achievements"
      />
    );

  const permissionsContent = (
    <section className="space-y-4">
      <div>
        <p className="text-[0.62rem] font-black uppercase tracking-[0.28em] text-amber-200">Access Control</p>
        <h3 className="font-display mt-2 text-3xl uppercase text-white">Permissions</h3>
        <p className="mt-2 text-sm text-zinc-400">
          Platform capabilities assigned to your administrator account.
        </p>
      </div>
      <AdminPermissionsPanel permissions={memberRecord.adminPermissions} />
    </section>
  );

  const membershipContent = memberRecord.isAdmin ? <AdminMembershipPanel /> : null;

  const membershipAnalyticsContent = memberRecord.isAdmin ? (
    <AdminMembershipLicenseAnalyticsContent />
  ) : null;
  const shopAnalyticsContent = memberRecord.isAdmin ? <AdminShopAnalyticsContent /> : null;

  const pageAccessContent = memberRecord.isAdmin ? <AdminPageAccessPanel memberRecord={memberRecord} /> : null;
  const calendarContent = memberRecord.isAdmin ? <AdminCalendarPanel /> : null;

  const settingsContent = (
    <MotionSection>
      <form className="rounded-[1.75rem] border border-white/10 bg-white/[0.02] p-5 sm:p-8" onSubmit={handleSaveSettings}>
        <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-[#FF1010]">System</p>
        <h2 className="font-display mt-2 text-4xl uppercase text-white sm:text-5xl">Settings</h2>
        <label className="mt-6 block">
          <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
            Membership tier (demo)
          </span>
          <select
            className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none ring-red-500/40 focus:ring-4"
            onChange={(event) => setMembershipTier(event.target.value as MembershipTier)}
            value={membershipTier}
          >
            {membershipTiers.map((tier) => (
              <option key={tier} value={tier}>
                {getJtgcTierLabel(tier)}
              </option>
            ))}
          </select>
        </label>
        {message ? <p className="mt-4 text-sm text-emerald-300">{message}</p> : null}
        {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
        <button
          className="mt-6 inline-flex min-h-12 items-center rounded-full bg-red-600 px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-white"
          disabled={saving}
          type="submit"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>

        <div className="mt-8 border-t border-white/10 pt-6">
          <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-zinc-500">Profile Preview</p>
          <p className="mt-2 text-sm text-zinc-400">
            Preview how your dashboard looks for different member roles. Your account data stays the same — only the
            role workspace changes.
          </p>
          <label className="mt-4 block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-zinc-400">View as</span>
            <select
              className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none ring-red-500/40 focus:ring-4"
              onChange={(event) => setPendingPreviewRole(event.target.value as ProfileRoleKind | "")}
              value={pendingPreviewRole}
            >
              <option value="">My actual profile</option>
              {profileRolePreviewOptions.map((option) => (
                <option key={option.kind} value={option.kind}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-red-600 px-5 py-2.5 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:bg-red-500"
              onClick={handleApplyViewAs}
              type="button"
            >
              View As
            </button>
            {previewRoleKind ? (
              <button
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10 px-5 py-2.5 text-xs font-black uppercase tracking-[0.18em] text-amber-200 transition hover:border-amber-400/50"
                onClick={handleExitViewAs}
                type="button"
              >
                Exit Preview
              </button>
            ) : null}
          </div>
          {previewRoleKind ? (
            <p className="mt-4 text-sm text-amber-200">
              Currently previewing as {getProfileRolePreviewLabel(previewRoleKind)}.
            </p>
          ) : null}
        </div>

        {memberRecord.isAdmin ? (
          <div className="mt-8 border-t border-white/10 pt-6">{permissionsContent}</div>
        ) : null}

        <div className="mt-8 border-t border-white/10 pt-6">
          <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-zinc-500">Session</p>
          <p className="mt-2 text-sm text-zinc-400">Sign out of your JTGC account on this device.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {isAdmin ? (
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10 px-5 py-2.5 text-xs font-black uppercase tracking-[0.18em] text-amber-200"
                href="/admin"
              >
                Admin Dashboard
              </Link>
            ) : null}
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 bg-black/40 px-5 py-2.5 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:border-red-500/40"
              onClick={handleLogout}
              type="button"
            >
              <LogOut className="mr-2" size={16} aria-hidden />
              Logout
            </button>
          </div>
        </div>
      </form>
    </MotionSection>
  );

  const deepSectionContent = isDeepSection ? (
    <div className="space-y-6">
      <BackButton label="Back to Command Center" onClick={handleBackToWorkspace} />
      {renderDeepSection()}
    </div>
  ) : null;

  function renderDeepSection() {
    if (!memberRecord || !identity) return null;
    return (
      <>
        {activeSection === "membership" ? (
          <PortalPlaceholderSection
            description="Track membership standing, renewal dates, and official league affiliation."
            title="My Membership"
          />
        ) : null}

        {activeSection === "competition-entries" ? (
          <PortalPlaceholderSection
            ctaHref="/registration"
            ctaLabel="Open Registration"
            description="View sanctioned competition entries, bout assignments, and registration status."
            title="Competition Entries"
          />
        ) : null}

        {activeSection === "certificates" ? (
          <PortalPlaceholderSection
            description="Official certificates, coaching credentials, and league recognitions appear here once issued."
            title="Certificates"
          />
        ) : null}

        {activeSection === "club" ? (
          <PortalPlaceholderSection
            description={`Official club affiliation: ${memberRecord.club}. Club management tools unlock for gym owners and coaches.`}
            title="Club"
          />
        ) : null}

        {activeSection === "medical" ? (
          <PortalPlaceholderSection
            description="Medical clearance, expiry dates, and upload status for competition eligibility."
            title="Medical Clearance"
          />
        ) : null}

        {activeSection === "rankings" && identity.athlete ? (
          <PortalPlaceholderSection
            description={`Current league rank: ${identity.athlete.rank}. Rankings sync from sanctioned JTGC results.`}
            title="Rankings"
          />
        ) : null}

        {activeSection === "payments" || activeSection === "orders" ? (
          <CommerceSection title="Payments & Orders">
            <div className="mb-4 flex justify-end">
              <Link className="text-xs font-black uppercase tracking-[0.16em] text-red-200" href="/orders">
                Full Order History
              </Link>
            </div>
            {orders.length === 0 ? (
              <EmptyPanel href="/shop" linkLabel="Browse Shop" message="No orders yet." />
            ) : (
              orders.map((order) => (
                <div className="glass-panel rounded-[1.5rem] p-5 sm:p-6" key={order.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">
                        {order.payment.referenceNumber}
                      </p>
                      <p className="mt-1 text-sm text-zinc-400">
                        {new Date(order.createdAt).toLocaleDateString()} â€¢ {paymentMethodLabels[order.payment.method]}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-2xl text-white">{formatCurrency(order.total)}</p>
                      <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">{orderStatusLabels[order.status]}</p>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-1 text-sm text-zinc-400">
                    {order.items.map((item) => (
                      <li key={item.productSlug}>{item.name} Ã— {item.quantity}</li>
                    ))}
                  </ul>
                  <div className="mt-3 flex gap-2">
                    <Link className="text-xs font-black uppercase tracking-[0.14em] text-red-200" href={`/orders/${order.id}/tracking`}>
                      Tracking
                    </Link>
                    <Link className="text-xs font-black uppercase tracking-[0.14em] text-zinc-400" href={`/orders/${order.id}/invoice`}>
                      Invoice
                    </Link>
                  </div>
                </div>
              ))
            )}
          </CommerceSection>
        ) : null}

        {activeSection === "fighter" && identity.athlete ? (
          <div className="space-y-6">
            <FighterCardHero athlete={identity.athlete} identity={identity} orderCount={orders.length} />
            <PhysicalAttributesCard athlete={identity.athlete} />
          </div>
        ) : null}

        {activeSection === "record" && identity.athlete ? (
          <div className="space-y-6">
            <FighterCardHero athlete={identity.athlete} identity={identity} orderCount={orders.length} />
            <FighterAnalyticsSection athlete={identity.athlete} />
          </div>
        ) : null}

        {activeSection === "history" && identity.athlete ? <FightHistorySection athlete={identity.athlete} /> : null}

        {activeSection === "coach-tools" ? (
          <IdentityToolsSection
            description="Manage coaching credentials, athlete assignments, and certification visibility."
            title="Coach Tools"
          />
        ) : null}

        {activeSection === "official-tools" ? (
          <IdentityToolsSection
            description="Access referee assignments, bout oversight tools, and official credential controls."
            title="Official Tools"
          />
        ) : null}

        {activeSection === "judge-tools" ? (
          <IdentityToolsSection
            description="Review scoring assignments, judge credentials, and sanctioned event access."
            title="Judge Tools"
          />
        ) : null}

        {activeSection === "council-tools" ? (
          <IdentityToolsSection
            description="Grand Council governance tools, league oversight, and membership administration."
            title="Council Tools"
          />
        ) : null}

        {activeSection === "staff-tools" ? (
          <IdentityToolsSection
            description="Staff operations, event support workflows, and internal league utilities."
            title="Staff Tools"
          />
        ) : null}

        {activeSection === "wishlist" ? (
          <CommerceSection title="Wishlist">
            <div className="grid gap-4 sm:grid-cols-2">
              {wishlistProducts.length === 0 ? (
                <EmptyPanel href="/shop" linkLabel="Explore Gear" message="Your wishlist is empty." />
              ) : (
                wishlistProducts.map((product) => (
                  <div className="glass-panel rounded-[1.5rem] p-5" key={product.slug}>
                    <Link className="font-display text-2xl uppercase text-white hover:text-red-200" href={`/shop/${product.slug}`}>
                      {product.name}
                    </Link>
                    <p className="mt-2 text-sm text-zinc-400">{formatCurrency(product.priceAmount)}</p>
                    <button
                      className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-red-300"
                      onClick={() => toggleWishlist(product.slug)}
                      type="button"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </CommerceSection>
        ) : null}

        {activeSection === "saved-fighters" ? (
          <CommerceSection title="Saved Fighters">
            <div className="grid gap-4 sm:grid-cols-2">
              {savedFighters.length === 0 ? (
                <EmptyPanel href="/latayanology" linkLabel="Browse LATAYANOLOGY" message="No saved fighters yet." />
              ) : (
                savedFighters.map((fighter) => (
                  <div className="glass-panel rounded-[1.5rem] p-5" key={fighter.slug}>
                    <Link className="font-display text-2xl uppercase text-white" href={`/fighters/${fighter.slug}`}>
                      {fighter.name}
                    </Link>
                    <p className="mt-2 text-sm text-zinc-400">{fighter.division} â€¢ {fighter.record}</p>
                    <button
                      className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-red-300"
                      onClick={() => toggleSavedFighter(fighter.slug)}
                      type="button"
                    >
                      Unsave
                    </button>
                  </div>
                ))
              )}
            </div>
          </CommerceSection>
        ) : null}

        {activeSection === "saved-teams" ? (
          <CommerceSection title="Saved Teams">
            <div className="grid gap-4 sm:grid-cols-2">
              {savedTeamsList.length === 0 ? (
                <EmptyPanel href="/teams" linkLabel="Browse Teams" message="No saved teams yet." />
              ) : (
                savedTeamsList.map((team) => (
                  <div className="glass-panel rounded-[1.5rem] p-5" key={team.slug}>
                    <Link className="font-display text-2xl uppercase text-white" href={`/teams/${team.slug}`}>
                      {team.name}
                    </Link>
                    <p className="mt-2 text-sm text-zinc-400">{team.region} â€¢ {team.record}</p>
                    <button
                      className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-red-300"
                      onClick={() => toggleSavedTeam(team.slug)}
                      type="button"
                    >
                      Unsave
                    </button>
                  </div>
                ))
              )}
            </div>
          </CommerceSection>
        ) : null}

        {activeSection === "events" || activeSection === "saved-events" ? (
          <CommerceSection title="Saved Events">
            <div className="grid gap-4 sm:grid-cols-2">
              {savedEvents.length === 0 ? (
                <EmptyPanel href="/calendar" linkLabel="View Calendar" message="No saved events yet." />
              ) : (
                savedEvents.map((event) => (
                  <div className="glass-panel rounded-[1.5rem] p-5" key={event.slug}>
                    <Link className="font-display text-2xl uppercase text-white" href={`/events/${event.slug}`}>
                      {event.title}
                    </Link>
                    <p className="mt-2 text-sm text-zinc-400">{event.date} â€¢ {event.city}</p>
                    <button
                      className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-red-300"
                      onClick={() => toggleSavedEvent(event.slug)}
                      type="button"
                    >
                      Unsave
                    </button>
                  </div>
                ))
              )}
            </div>
          </CommerceSection>
        ) : null}

        {activeSection === "notifications" ? (
          <CommerceSection title="Notifications">
            {userData.notifications.length === 0 ? (
              <EmptyPanel href="/shop" linkLabel="Shop Now" message="No notifications yet." />
            ) : (
              userData.notifications.map((notification) => (
                <button
                  className={`glass-panel w-full rounded-[1.25rem] p-4 text-left transition ${
                    notification.read ? "opacity-70" : "border-red-500/20"
                  }`}
                  key={notification.id}
                  onClick={() => markNotificationRead(notification.id)}
                  type="button"
                >
                  <p className="font-semibold text-white">{notification.title}</p>
                  <p className="mt-1 text-sm text-zinc-400">{notification.body}</p>
                  <p className="mt-2 text-xs text-zinc-500">{new Date(notification.createdAt).toLocaleString()}</p>
                </button>
              ))
            )}
          </CommerceSection>
        ) : null}
      </>
    );
  }

  return (
    <main className="overflow-hidden px-4 pt-20 sm:px-6 sm:pt-24 lg:px-8 lg:pt-24">
      <section className="relative mx-auto max-w-[90rem] py-6 sm:py-8">
        <div className="cinematic-grid absolute inset-0 opacity-30" aria-hidden />
        <div className="relative">
          <ProfileDashboard
            achievementsContent={achievementsContent}
            calendarContent={calendarContent}
            membershipAnalyticsContent={membershipAnalyticsContent}
            membershipContent={membershipContent}
            pageAccessContent={pageAccessContent}
            shopAnalyticsContent={shopAnalyticsContent}
            activeTab={activeTab}
            allowPortraitUpload
            deepSectionContent={deepSectionContent}
            documentsContent={documentsContent}
            identity={identity}
            licenseApplication={licenseApplication}
            memberRecord={memberRecord}
            onExitViewAs={previewRoleKind ? handleExitViewAs : undefined}
            onNavigateSection={handleSectionChange}
            onPortraitRemove={removePortrait}
            onPortraitUpload={savePortrait}
            onTabChange={handleTabChange}
            portraitImage={portraitImage}
            previewRoleKind={previewRoleKind}
            settingsContent={settingsContent}
            user={user}
          />
        </div>
      </section>
    </main>
  );
}
function PortalPlaceholderSection({
  title,
  description,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  description: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="glass-panel rounded-[1.75rem] p-6 sm:p-8">
      <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-[#FF1010]">Member Portal</p>
      <h2 className="font-display mt-2 text-4xl uppercase text-white sm:text-5xl">{title}</h2>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">{description}</p>
      {ctaHref ? (
        <Link
          className="mt-6 inline-flex min-h-11 items-center rounded-full bg-red-600 px-5 py-2.5 text-xs font-black uppercase tracking-[0.18em] text-white"
          href={ctaHref}
        >
          {ctaLabel ?? "Open"} â†’
        </Link>
      ) : null}
    </div>
  );
}

function IdentityToolsSection({ title, description }: { title: string; description: string }) {
  return (
    <div className="glass-panel rounded-[1.75rem] p-6 sm:p-8">
      <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-[#FF1010]">Identity Tools</p>
      <h2 className="font-display mt-2 text-4xl uppercase text-white sm:text-5xl">{title}</h2>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">{description}</p>
      <Link
        className="mt-6 inline-flex min-h-11 items-center rounded-full bg-red-600 px-5 py-2.5 text-xs font-black uppercase tracking-[0.18em] text-white"
        href="/register-for-license"
      >
        Manage License â†’
      </Link>
    </div>
  );
}

function CommerceSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-4xl uppercase text-white">{title}</h2>
      {children}
    </div>
  );
}

function EmptyPanel({ message, href, linkLabel }: { message: string; href: string; linkLabel: string }) {
  return (
    <div className="glass-panel rounded-[1.75rem] p-8 text-center">
      <p className="text-sm text-zinc-400">{message}</p>
      <Link className="mt-4 inline-flex text-xs font-black uppercase tracking-[0.16em] text-red-200" href={href}>
        {linkLabel}
      </Link>
    </div>
  );
}
