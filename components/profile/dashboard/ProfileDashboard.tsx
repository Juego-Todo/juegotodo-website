"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BackButton } from "@/components/BackButton";
import { AdminPendingTasksPanel } from "@/components/profile/AdminPendingTasksPanel";
import { CoachPortalOverview } from "@/components/profile/dashboard/CoachPortalOverview";
import { FanPortalOverview } from "@/components/profile/dashboard/FanPortalOverview";
import { ProfileActivityFeed, ProfileCareerTimeline } from "@/components/profile/dashboard/ProfileCareerTimeline";
import { ProfileCommandCenter } from "@/components/profile/dashboard/ProfileCommandCenter";
import { ProfileCommandPalette, ProfileCommandPaletteHotkey } from "@/components/profile/dashboard/ProfileCommandPalette";
import { ProfileFighterHero, ProfileFighterMobileIntro } from "@/components/profile/dashboard/fighter/ProfileFighterHero";
import { ProfileFighterPrivateDashboard } from "@/components/profile/dashboard/fighter/ProfileFighterPrivateDashboard";
import { ProfileFighterPublicProfile } from "@/components/profile/dashboard/fighter/ProfileFighterPublicProfile";
import { ProfileInteractiveCredential } from "@/components/profile/dashboard/ProfileInteractiveCredential";
import { ProfileMissionHero } from "@/components/profile/dashboard/ProfileMissionHero";
import { ProfileMobileNav } from "@/components/profile/dashboard/ProfileMobileNav";
import { ProfileRoleWorkspace } from "@/components/profile/dashboard/ProfileRoleWorkspace";
import { MemberStatisticsRow } from "@/components/profile/MemberPortalPanels";
import type { ProfileSectionId } from "@/components/profile/ProfileSidebarNav";
import type { LicenseApplication } from "@/data/license-applications";
import type { MemberRecord } from "@/lib/profile/member-record";
import { resolveAthleteProfile } from "@/lib/profile/identity";
import type { ProfileIdentity } from "@/lib/profile/identity";
import type { UserProfile } from "@/lib/auth/types";
import { buildFighterProfileView } from "@/lib/profile/fighter-profile-view";
import {
  adminWorkspaceTabs,
  canAccessWorkspaceTab,
  fighterWorkspaceTabs,
  mobileTabToWorkspace,
  workspaceTabs,
  type MobileTabId,
  type WorkspaceTabId,
} from "@/lib/profile/mission-control";
import { coachWorkspaceTabs, fanWorkspaceTabs } from "@/lib/profile/portal-experience";
import { getProfileRolePreviewLabel, type ProfileRoleKind } from "@/lib/profile/role-modules";

function OpsBrandHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-4 rounded-[1.75rem] border border-white/10 bg-gradient-to-r from-black via-[#120606] to-black px-5 py-4 sm:px-6">
      <Link
        aria-label="Juego Todo home"
        className="relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-[1.1rem] border border-[#FF1010]/35 bg-black shadow-[0_0_28px_rgba(255,16,16,0.28)] sm:h-16 sm:w-16"
        href="/"
      >
        <Image
          alt="Juego Todo official logo"
          className="h-full w-full object-contain"
          height={64}
          priority
          src="/juego-todo-logo.png"
          width={64}
        />
      </Link>
      <div className="min-w-0">
        <p className="font-display text-2xl uppercase leading-none tracking-wide text-white sm:text-3xl">{title}</p>
        <p className="mt-1 text-[0.68rem] font-medium tracking-wide text-zinc-500">{subtitle}</p>
      </div>
    </div>
  );
}

export function ProfileDashboard({
  user,
  identity,
  memberRecord,
  licenseApplication,
  activeTab,
  onTabChange,
  onNavigateSection,
  deepSectionContent,
  settingsContent,
  documentsContent,
  achievementsContent,
  membershipAnalyticsContent,
  membershipContent,
  pageAccessContent,
  calendarContent,
  ticketsContent,
  ordersContent,
  shopContent,
  membersContent,
  licensesContent,
  latayanologyContent,
  shopAnalyticsContent,
  previewRoleKind = null,
  onExitViewAs,
  portraitImage,
  onPortraitUpload,
  onPortraitRemove,
  allowPortraitUpload = false,
}: {
  user: UserProfile;
  identity: ProfileIdentity;
  memberRecord: MemberRecord;
  licenseApplication: LicenseApplication | null;
  activeTab: WorkspaceTabId;
  onTabChange: (tab: WorkspaceTabId) => void;
  onNavigateSection: (section: ProfileSectionId) => void;
  deepSectionContent?: React.ReactNode;
  settingsContent?: React.ReactNode;
  documentsContent?: React.ReactNode;
  achievementsContent?: React.ReactNode;
  membershipAnalyticsContent?: React.ReactNode;
  shopAnalyticsContent?: React.ReactNode;
  membershipContent?: React.ReactNode;
  pageAccessContent?: React.ReactNode;
  calendarContent?: React.ReactNode;
  ticketsContent?: React.ReactNode;
  ordersContent?: React.ReactNode;
  shopContent?: React.ReactNode;
  membersContent?: React.ReactNode;
  licensesContent?: React.ReactNode;
  latayanologyContent?: React.ReactNode;
  previewRoleKind?: ProfileRoleKind | null;
  onExitViewAs?: () => void;
  portraitImage?: string;
  onPortraitUpload?: (dataUrl: string) => Promise<void> | void;
  onPortraitRemove?: () => Promise<void> | void;
  allowPortraitUpload?: boolean;
}) {
  const router = useRouter();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTabId>("dashboard");
  const canAccessOpsTabs = memberRecord.canAccessOpsTabs;
  const portalExperience = memberRecord.portalExperience;
  const isFanPortal = !canAccessOpsTabs && portalExperience === "fan";
  const isCoachPortal = !canAccessOpsTabs && portalExperience === "coach";

  function handleMobileTab(tab: MobileTabId) {
    setMobileTab(tab);
    if (tab === "credential") {
      return;
    }
    if (canAccessOpsTabs) {
      if (tab === "career") {
        onTabChange("shop");
        return;
      }
      if (tab === "activity") {
        onTabChange("licenses");
        return;
      }
    }
    if (isFanPortal) {
      // Fan mobile nav: Home · Calendar · Latayanology · Settings.
      if (tab === "career") {
        router.push("/calendar?from=profile");
        return;
      }
      if (tab === "activity") {
        router.push("/latayanology?from=profile");
        return;
      }
    }
    onTabChange(mobileTabToWorkspace(tab, portalExperience));
  }

  function handleNavigateSection(section: ProfileSectionId) {
    onNavigateSection(section);
  }

  function handleAction(href?: string, section?: ProfileSectionId) {
    if (href) return;
    if (section) onNavigateSection(section);
  }

  // Fan accounts use the Licenses tab instead of the hero member-card system.
  const showCredentials = !canAccessOpsTabs && !isFanPortal;
  const credentialPinned = showCredentials && mobileTab === "credential";
  const isShopWorkspace = activeTab === "shop" || activeTab === "orders";
  const isTicketsWorkspace = activeTab === "tickets";
  // Ops accounts: keep the profile strip on Overview only — other tabs are tool workspaces.
  const showOpsProfileHero = canAccessOpsTabs && activeTab === "overview";
  const isFighterRole = memberRecord.roleModule.kind === "fighter";
  const athlete =
    identity.athlete ??
    (isFighterRole ? resolveAthleteProfile(user, ["fighter", ...identity.roles]) : undefined);
  const fighterView = useMemo(() => {
    if (!isFighterRole || !athlete) {
      return null;
    }

    return buildFighterProfileView({
      user,
      identity,
      athlete,
      memberRecord,
      licenseApplication,
      userPortrait: portraitImage,
    });
  }, [isFighterRole, athlete, user, identity, memberRecord, licenseApplication, portraitImage]);

  const credentialCard = showCredentials ? (
    <ProfileInteractiveCredential
      compact={Boolean(fighterView)}
      identity={identity}
      licenseApplication={licenseApplication}
      memberRecord={memberRecord}
      pinned={credentialPinned}
      user={user}
    />
  ) : null;

  const heroSideCard = credentialCard;

  const tabs = canAccessOpsTabs
    ? adminWorkspaceTabs
    : fighterView
      ? showCredentials
        ? fighterWorkspaceTabs
        : fighterWorkspaceTabs.filter((tab) => tab.id !== "documents")
      : isFanPortal
        ? fanWorkspaceTabs
        : isCoachPortal
          ? coachWorkspaceTabs
          : workspaceTabs;

  function handleTabClick(tab: WorkspaceTabId) {
    if (!canAccessWorkspaceTab(tab, canAccessOpsTabs, portalExperience)) {
      return;
    }
    if (isFanPortal && tab === "calendar") {
      router.push("/calendar?from=profile");
      return;
    }
    if (isFanPortal && tab === "latayanology") {
      router.push("/latayanology?from=profile");
      return;
    }
    onTabChange(tab);
  }

  return (
    <>
      <div className="space-y-8 pb-28 lg:pb-10">
        <ProfileCommandPaletteHotkey onOpen={() => setPaletteOpen(true)} />

        {previewRoleKind ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-sm text-amber-100">
              <span className="font-black uppercase tracking-[0.12em]">Preview mode · </span>
              Viewing dashboard as {getProfileRolePreviewLabel(previewRoleKind)}.
            </p>
            {onExitViewAs ? (
              <button
                className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-full border border-amber-400/30 bg-black/30 px-4 py-2 text-[0.62rem] font-black uppercase tracking-[0.16em] text-amber-100 transition hover:border-amber-300/50"
                onClick={onExitViewAs}
                type="button"
              >
                Exit Preview
              </button>
            ) : null}
          </div>
        ) : null}

        {credentialPinned && credentialCard ? (
          <div className="lg:hidden">{credentialCard}</div>
        ) : mobileTab === "settings" ? (
          <div className="lg:hidden">{settingsContent}</div>
        ) : (
          <>
            {isShopWorkspace ? (
              <OpsBrandHeader subtitle="Official store operations" title="Juego Todo Shop" />
            ) : isTicketsWorkspace ? (
              <OpsBrandHeader subtitle="Event ticket purchases" title="Juego Todo Tickets" />
            ) : fighterView ? (
              <>
                <div className={`${mobileTab === "dashboard" ? "" : "hidden lg:block"}`}>
                  <div className="lg:hidden">
                    <ProfileFighterMobileIntro view={fighterView} />
                  </div>
                  <div className="hidden lg:block">
                    <ProfileFighterHero view={fighterView} />
                  </div>
                </div>
              </>
            ) : showOpsProfileHero ? (
              <ProfileMissionHero
                licenseApplication={licenseApplication}
                memberRecord={memberRecord}
                onPortraitUpload={onPortraitUpload}
                portraitImage={portraitImage}
                user={user}
              />
            ) : !canAccessOpsTabs ? (
              <div className={`grid gap-8 xl:grid-cols-12 xl:items-start ${mobileTab === "dashboard" ? "" : "hidden lg:grid"}`}>
                <div className={heroSideCard ? "xl:col-span-8" : "xl:col-span-12"}>
                  <ProfileMissionHero
                    licenseApplication={licenseApplication}
                    memberRecord={memberRecord}
                    onPortraitUpload={onPortraitUpload}
                    portraitImage={portraitImage}
                    user={user}
                  />
                </div>
                {heroSideCard ? <div className="hidden xl:col-span-4 xl:block">{heroSideCard}</div> : null}
              </div>
            ) : null}

            {deepSectionContent ? (
              <motion.div animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 8 }}>
                {deepSectionContent}
              </motion.div>
            ) : (
              <>
                <div className="hidden lg:block">
                  <nav aria-label="Workspace tabs" className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
                    {tabs.map((tab) => (
                      <button
                        className={`rounded-full px-5 py-2.5 text-[0.62rem] font-black uppercase tracking-[0.14em] transition ${
                          activeTab === tab.id
                            ? "bg-[#FF1010] text-white"
                            : "text-zinc-400 hover:text-white"
                        }`}
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id)}
                        type="button"
                      >
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    initial={{ opacity: 0, y: 8 }}
                    key={activeTab}
                    transition={{ duration: 0.22 }}
                  >
                    {isFanPortal && activeTab !== "overview" && activeTab !== "documents" ? (
                      <div className="mb-5">
                        <BackButton label="Back to Home" onClick={() => onTabChange("overview")} />
                      </div>
                    ) : null}

                    {activeTab === "overview" ? (
                      fighterView ? (
                        <ProfileFighterPublicProfile view={fighterView} />
                      ) : (
                        <div className="space-y-10">
                          {canAccessOpsTabs ? (
                            <AdminPendingTasksPanel />
                          ) : isFanPortal ? (
                            <FanPortalOverview
                              licenseApplication={licenseApplication}
                              onOpenLicenses={() => onTabChange("documents")}
                            />
                          ) : isCoachPortal ? (
                            <CoachPortalOverview
                              licenseApplication={licenseApplication}
                              onOpenDocuments={() => onTabChange("documents")}
                              user={user}
                            />
                          ) : (
                            <ProfileCommandCenter memberRecord={memberRecord} onAction={handleAction} />
                          )}
                          {!isFanPortal ? <ProfileRoleWorkspace memberRecord={memberRecord} /> : null}
                        </div>
                      )
                    ) : null}

                    {activeTab === "camp" && fighterView ? (
                      <ProfileFighterPrivateDashboard
                        credentialSlot={credentialCard}
                        documentsSlot={showCredentials ? documentsContent : null}
                        memberRecord={memberRecord}
                        onAction={handleAction}
                        onNavigate={handleNavigateSection}
                        view={fighterView}
                      />
                    ) : null}

                    {activeTab === "activity" && !fighterView ? (
                      canAccessOpsTabs ? (
                        <div>{licensesContent ?? membershipContent}</div>
                      ) : (
                        <>
                          <div className="lg:hidden">
                            {mobileTab === "career" ? (
                              <ProfileCareerTimeline memberRecord={memberRecord} />
                            ) : (
                              <ProfileActivityFeed memberRecord={memberRecord} />
                            )}
                          </div>
                          <div className="hidden gap-10 lg:grid xl:grid-cols-2">
                            <ProfileCareerTimeline memberRecord={memberRecord} />
                            <ProfileActivityFeed memberRecord={memberRecord} />
                          </div>
                        </>
                      )
                    ) : null}

                    {activeTab === "documents" && documentsContent ? (
                      <div>{documentsContent}</div>
                    ) : null}

                    {activeTab === "analytics" && !fighterView && !canAccessOpsTabs ? (
                      <section className="space-y-5">
                        <div>
                          <p className="text-[0.62rem] font-black uppercase tracking-[0.28em] text-red-200">Analytics</p>
                          <h2 className="font-display mt-2 text-3xl uppercase text-white sm:text-4xl">Performance</h2>
                        </div>
                        <MemberStatisticsRow statistics={memberRecord.statistics} />
                      </section>
                    ) : null}

                    {activeTab === "membership-analytics" && canAccessOpsTabs ? (
                      <div>{membershipAnalyticsContent}</div>
                    ) : null}

                    {activeTab === "shop-analytics" && canAccessOpsTabs ? (
                      <div>{shopAnalyticsContent}</div>
                    ) : null}

                    {activeTab === "calendar" && canAccessOpsTabs ? (
                      <div>{calendarContent}</div>
                    ) : null}

                    {activeTab === "tickets" && canAccessOpsTabs ? <div>{ticketsContent}</div> : null}

                    {(activeTab === "shop" || activeTab === "orders") && canAccessOpsTabs ? (
                      <div>{shopContent ?? ordersContent}</div>
                    ) : null}

                    {activeTab === "members" && canAccessOpsTabs ? <div>{membersContent}</div> : null}

                    {activeTab === "licenses" && canAccessOpsTabs ? (
                      <div>{licensesContent ?? membershipContent}</div>
                    ) : null}

                    {activeTab === "latayanology" && canAccessOpsTabs ? (
                      <div>{latayanologyContent}</div>
                    ) : null}

                    {activeTab === "achievements" && !fighterView && !canAccessOpsTabs ? (
                      <div>{achievementsContent}</div>
                    ) : null}

                    {activeTab === "page-access" && canAccessOpsTabs ? (
                      <div>{pageAccessContent}</div>
                    ) : null}

                    {activeTab === "settings" ? (
                      <div>{settingsContent}</div>
                    ) : null}
                  </motion.div>
                </AnimatePresence>
              </>
            )}
          </>
        )}
      </div>

      <ProfileMobileNav
        active={mobileTab}
        adminMode={canAccessOpsTabs}
        coachMode={isCoachPortal && !fighterView}
        fanMode={isFanPortal && !fighterView}
        fighterMode={Boolean(fighterView)}
        hideCredentials={!showCredentials}
        onChange={handleMobileTab}
      />

      <ProfileCommandPalette
        isAdmin={canAccessOpsTabs}
        onClose={() => setPaletteOpen(false)}
        onNavigateSection={handleNavigateSection}
        onNavigateTab={onTabChange}
        open={paletteOpen}
        role={memberRecord.roleModule}
      />
    </>
  );
}
