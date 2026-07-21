"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
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
  canAccessOpsWorkspaceTab,
  fighterWorkspaceTabs,
  mobileTabToWorkspace,
  workspaceTabs,
  type MobileTabId,
  type WorkspaceTabId,
} from "@/lib/profile/mission-control";
import { getProfileRolePreviewLabel, type ProfileRoleKind } from "@/lib/profile/role-modules";

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
  licensesContent,
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
  licensesContent?: React.ReactNode;
  previewRoleKind?: ProfileRoleKind | null;
  onExitViewAs?: () => void;
  portraitImage?: string;
  onPortraitUpload?: (dataUrl: string) => Promise<void> | void;
  onPortraitRemove?: () => Promise<void> | void;
  allowPortraitUpload?: boolean;
}) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTabId>("dashboard");
  const canAccessOpsTabs = memberRecord.canAccessOpsTabs;

  function handleMobileTab(tab: MobileTabId) {
    setMobileTab(tab);
    if (tab !== "credential") {
      onTabChange(mobileTabToWorkspace(tab));
    }
  }

  function handleNavigateSection(section: ProfileSectionId) {
    onNavigateSection(section);
  }

  function handleAction(href?: string, section?: ProfileSectionId) {
    if (href) return;
    if (section) onNavigateSection(section);
  }

  const showCredentials = !canAccessOpsTabs;
  const credentialPinned = showCredentials && mobileTab === "credential";
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

  const tabs = fighterView
    ? showCredentials
      ? fighterWorkspaceTabs
      : fighterWorkspaceTabs.filter((tab) => tab.id !== "documents")
    : showCredentials
      ? workspaceTabs
      : adminWorkspaceTabs;

  function handleTabClick(tab: WorkspaceTabId) {
    if (!canAccessOpsWorkspaceTab(tab, canAccessOpsTabs)) {
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
            {fighterView ? (
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
            ) : (
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
            )}

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
                    {activeTab === "overview" ? (
                      fighterView ? (
                        <ProfileFighterPublicProfile view={fighterView} />
                      ) : (
                        <div className="space-y-10">
                          <ProfileCommandCenter memberRecord={memberRecord} onAction={handleAction} />
                          <ProfileRoleWorkspace memberRecord={memberRecord} />
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

                    {activeTab === "documents" && showCredentials && documentsContent ? (
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

                    {activeTab === "orders" && canAccessOpsTabs ? <div>{ordersContent}</div> : null}

                    {activeTab === "licenses" && canAccessOpsTabs ? (
                      <div>{licensesContent ?? membershipContent}</div>
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
