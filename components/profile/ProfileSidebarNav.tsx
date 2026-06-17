"use client";

import Link from "next/link";
import {
  Award,
  BarChart3,
  Bell,
  CalendarDays,
  Heart,
  History,
  LayoutDashboard,
  Package,
  Settings,
  Shield,
  Star,
  Swords,
  UserRound,
} from "lucide-react";
import type { ProfileIdentity } from "@/lib/profile/identity";

export type ProfileSectionId =
  | "profile"
  | "dashboard"
  | "fighter"
  | "record"
  | "history"
  | "achievements"
  | "orders"
  | "wishlist"
  | "saved-fighters"
  | "saved-teams"
  | "saved-events"
  | "notifications"
  | "settings";

type NavItem = {
  id: ProfileSectionId;
  label: string;
  icon: typeof UserRound;
  badge?: number;
  fighterOnly?: boolean;
  fanOnly?: boolean;
};

const fighterNav: NavItem[] = [
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, fighterOnly: true },
  { id: "fighter", label: "Fighter Profile", icon: Swords, fighterOnly: true },
  { id: "record", label: "Record & Stats", icon: BarChart3, fighterOnly: true },
  { id: "history", label: "Fight History", icon: History, fighterOnly: true },
  { id: "achievements", label: "Achievements", icon: Award, fighterOnly: true },
];

const commerceNav: NavItem[] = [
  { id: "orders", label: "Orders", icon: Package },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "saved-fighters", label: "Saved Fighters", icon: Star },
  { id: "saved-teams", label: "Saved Teams", icon: Shield },
  { id: "saved-events", label: "Saved Events", icon: CalendarDays },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
];

export function ProfileSidebarNav({
  identity,
  activeSection,
  onSectionChange,
  unreadCount,
}: {
  identity: ProfileIdentity;
  activeSection: ProfileSectionId;
  onSectionChange: (section: ProfileSectionId) => void;
  unreadCount: number;
}) {
  const primaryNav = identity.isFighter ? fighterNav : fighterNav.filter((item) => !item.fighterOnly || item.id === "profile");
  const secondaryNav = commerceNav.map((item) =>
    item.id === "notifications" ? { ...item, badge: unreadCount } : item,
  );

  return (
    <nav className="glass-panel flex flex-col gap-1 rounded-[1.5rem] p-3">
      <p className="px-3 py-2 text-[0.58rem] font-black uppercase tracking-[0.22em] text-zinc-500">Identity</p>
      {primaryNav.map((item) => (
        <SidebarButton
          active={activeSection === item.id}
          badge={item.badge}
          icon={item.icon}
          key={item.id}
          label={item.label}
          onClick={() => onSectionChange(item.id)}
        />
      ))}

      <div className="my-2 border-t border-white/10" />

      <p className="px-3 py-2 text-[0.58rem] font-black uppercase tracking-[0.22em] text-zinc-500">Account</p>
      {secondaryNav.map((item) => (
        <SidebarButton
          active={activeSection === item.id}
          badge={item.badge}
          icon={item.icon}
          key={item.id}
          label={item.label}
          onClick={() => onSectionChange(item.id)}
        />
      ))}

      <div className="mt-3 rounded-2xl border border-[#FF1010]/30 bg-[#FF1010]/10 p-4">
        <p className="text-[0.58rem] font-black uppercase tracking-[0.2em] text-[#FF1010]">JTGC Membership</p>
        <p className="mt-2 font-display text-2xl uppercase text-white">
          {identity.roles.includes("grand_council") ? "Grand Council" : "Member"}
        </p>
        <Link
          className="mt-3 inline-flex text-[0.62rem] font-black uppercase tracking-[0.16em] text-red-200 hover:text-white"
          href="/registration"
        >
          View Benefits →
        </Link>
      </div>
    </nav>
  );
}

function SidebarButton({
  label,
  icon: Icon,
  active,
  onClick,
  badge,
}: {
  label: string;
  icon: typeof UserRound;
  active: boolean;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-black uppercase tracking-[0.14em] transition ${
        active ? "bg-[#FF1010] text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white"
      }`}
      onClick={onClick}
      type="button"
    >
      <Icon size={15} aria-hidden />
      <span className="flex-1">{label}</span>
      {badge && badge > 0 ? (
        <span className="rounded-full bg-[#FF1010] px-1.5 py-0.5 text-[0.58rem] text-white">{badge}</span>
      ) : null}
    </button>
  );
}
