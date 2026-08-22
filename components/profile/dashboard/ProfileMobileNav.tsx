"use client";

import {
  Activity,
  BarChart3,
  CalendarDays,
  CreditCard,
  FileText,
  LayoutDashboard,
  LineChart,
  MoreHorizontal,
  Search,
  Settings,
  Trophy,
  Users,
  Ticket,
  Database,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { MobileTabId, WorkspaceTabId } from "@/lib/profile/mission-control";

const defaultIcons: Record<MobileTabId, typeof LayoutDashboard> = {
  dashboard: LayoutDashboard,
  career: Trophy,
  credential: CreditCard,
  activity: Activity,
  settings: Settings,
};

const fanIcons: Record<MobileTabId, typeof LayoutDashboard> = {
  dashboard: LayoutDashboard,
  career: CalendarDays,
  credential: CreditCard,
  activity: Search,
  settings: Settings,
};

const opsMoreItems: { id: WorkspaceTabId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "tickets", label: "Tickets", icon: Ticket },
  { id: "members", label: "Members", icon: Users },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "latayanology", label: "Latayanology", icon: Database },
  { id: "membership-analytics", label: "Member Analytics", icon: BarChart3 },
  { id: "shop-analytics", label: "Shop Analytics", icon: LineChart },
];

const memberMoreItems: { id: WorkspaceTabId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "documents", label: "Licenses", icon: FileText },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "achievements", label: "Achievements", icon: Trophy },
];

export function ProfileMobileNav({
  active,
  activeWorkspace,
  onChange,
  onWorkspaceNavigate,
  fighterMode = false,
  adminMode = false,
  fanMode = false,
  coachMode = false,
  memberMode = false,
  hideCredentials = false,
}: {
  active: MobileTabId;
  activeWorkspace?: WorkspaceTabId;
  onChange: (tab: MobileTabId) => void;
  onWorkspaceNavigate?: (tab: WorkspaceTabId) => void;
  fighterMode?: boolean;
  adminMode?: boolean;
  fanMode?: boolean;
  coachMode?: boolean;
  memberMode?: boolean;
  hideCredentials?: boolean;
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const showMoreSheet = adminMode || memberMode;
  const moreItems = adminMode ? opsMoreItems : memberMoreItems;
  const moreActive = useMemo(
    () =>
      showMoreSheet &&
      Boolean(activeWorkspace && moreItems.some((item) => item.id === activeWorkspace)),
    [activeWorkspace, moreItems, showMoreSheet],
  );

  useEffect(() => {
    if (!moreOpen) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [moreOpen]);

  useEffect(() => {
    if (!moreOpen) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMoreOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [moreOpen]);

  const baseTabs: MobileTabId[] = fighterMode
    ? ["dashboard", "career", "credential", "settings"]
    : fanMode
      ? ["dashboard", "career", "activity", "settings"]
      : ["dashboard", "career", "credential", "activity", "settings"];
  const tabs = hideCredentials ? baseTabs.filter((tab) => tab !== "credential") : baseTabs;

  const labels: Record<MobileTabId, string> = fighterMode
    ? {
        dashboard: "Profile",
        career: "Dashboard",
        credential: "Credential",
        activity: "Activity",
        settings: "Settings",
      }
    : adminMode
      ? {
          dashboard: "Home",
          career: "Shop",
          credential: "Credential",
          activity: "Licenses",
          settings: "Settings",
        }
      : fanMode
        ? {
            dashboard: "Home",
            career: "Calendar",
            credential: "Credential",
            activity: "Latayanology",
            settings: "Settings",
          }
        : coachMode
          ? {
              dashboard: "Home",
              career: "Documents",
              credential: "Credential",
              activity: "Activity",
              settings: "Settings",
            }
          : {
              dashboard: "Home",
              career: "Career",
              credential: "Credential",
              activity: "Activity",
              settings: "Settings",
            };

  const icons = fanMode ? fanIcons : defaultIcons;

  function handleTabClick(tab: MobileTabId) {
    setMoreOpen(false);
    onChange(tab);
  }

  function handleMoreSelect(tab: WorkspaceTabId) {
    setMoreOpen(false);
    onWorkspaceNavigate?.(tab);
  }

  return (
    <>
      {moreOpen ? (
        <div className="fixed inset-0 z-[56] lg:hidden">
          <button
            aria-label="Close more workspaces"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMoreOpen(false)}
            type="button"
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-[1.5rem] border border-white/10 bg-[#0a0a0a] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-20px_60px_rgba(0,0,0,0.55)]">
            <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-zinc-500">More workspaces</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const selected = activeWorkspace === item.id;
                return (
                  <button
                    className={`flex min-h-14 items-center gap-3 rounded-2xl border px-3 py-3 text-left transition ${
                      selected
                        ? "border-[#FF1010]/40 bg-[#FF1010]/10 text-white"
                        : "border-white/10 bg-white/[0.02] text-zinc-300 hover:border-white/25 hover:text-white"
                    }`}
                    key={item.id}
                    onClick={() => handleMoreSelect(item.id)}
                    type="button"
                  >
                    <Icon size={18} aria-hidden />
                    <span className="text-[0.68rem] font-black uppercase tracking-[0.1em]">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-black/90 px-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-lg items-stretch justify-between gap-0.5">
          {tabs.map((tab) => {
            if (showMoreSheet && tab === "settings") {
              return (
                <button
                  aria-current={moreActive ? "page" : undefined}
                  aria-expanded={moreOpen}
                  className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 transition ${
                    moreActive || moreOpen ? "text-[#FF1010]" : "text-zinc-500"
                  }`}
                  key="more"
                  onClick={() => setMoreOpen((open) => !open)}
                  type="button"
                >
                  <MoreHorizontal size={18} aria-hidden />
                  <span className="text-[0.6rem] font-black uppercase tracking-[0.08em]">More</span>
                </button>
              );
            }

            const Icon = icons[tab];
            const selected = active === tab && !moreActive;
            return (
              <button
                aria-current={selected ? "page" : undefined}
                className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 transition ${
                  selected ? "text-[#FF1010]" : "text-zinc-500"
                }`}
                key={tab}
                onClick={() => handleTabClick(tab)}
                type="button"
              >
                <Icon size={18} aria-hidden />
                <span className="text-[0.6rem] font-black uppercase tracking-[0.08em]">{labels[tab]}</span>
              </button>
            );
          })}
          {showMoreSheet ? (
            <button
              aria-current={active === "settings" && !moreActive ? "page" : undefined}
              className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 transition ${
                active === "settings" && !moreActive ? "text-[#FF1010]" : "text-zinc-500"
              }`}
              onClick={() => handleTabClick("settings")}
              type="button"
            >
              <Settings size={18} aria-hidden />
              <span className="text-[0.6rem] font-black uppercase tracking-[0.08em]">Settings</span>
            </button>
          ) : null}
        </div>
      </nav>
    </>
  );
}
