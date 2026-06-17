"use client";

import {
  ArrowRight,
  LogOut,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { EquipmentOwned } from "@/components/commerce/EquipmentOwned";
import { MotionSection } from "@/components/MotionSection";
import { PageNavigation } from "@/components/PageNavigation";
import {
  AchievementsSection,
  FightHistorySection,
  FighterAnalyticsSection,
  FighterCardHero,
  FighterIdentityDashboard,
  PhysicalAttributesCard,
} from "@/components/profile/FighterIdentitySections";
import { ProfileIdentityHeader } from "@/components/profile/ProfileIdentityHeader";
import { ProfileRightRail } from "@/components/profile/ProfileRightRail";
import { ProfileSidebarNav, type ProfileSectionId } from "@/components/profile/ProfileSidebarNav";
import { events, fighters, getShopProduct } from "@/data/site";
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
import { buildProfileIdentity, getJtgcTierLabel, getPrimaryStatLabel } from "@/lib/profile/identity";

const membershipTiers = Object.keys(membershipTierLabels) as MembershipTier[];

function resolveSection(tab: string | null): ProfileSectionId {
  const map: Record<string, ProfileSectionId> = {
    profile: "profile",
    dashboard: "dashboard",
    fighter: "fighter",
    record: "record",
    history: "history",
    achievements: "achievements",
    orders: "orders",
    wishlist: "wishlist",
    fighters: "saved-fighters",
    teams: "saved-teams",
    events: "saved-events",
    notifications: "notifications",
    settings: "settings",
  };
  return map[tab ?? "profile"] ?? "profile";
}

export function UserProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSection = resolveSection(searchParams.get("tab"));
  const { user, loading, logout, updateProfile } = useAuth();
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
  const [fullName, setFullName] = useState("");
  const [gym, setGym] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("Philippines");
  const [membershipTier, setMembershipTier] = useState<MembershipTier>("free");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const profileSyncKey = user
    ? `${user.id}|${user.fullName}|${user.gym}|${user.city}|${user.bio}|${userData.phone}|${userData.country}|${userData.membershipTier}`
    : null;
  const [lastProfileSyncKey, setLastProfileSyncKey] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?next=/profile");
    }
  }, [loading, user, router]);

  if (profileSyncKey && profileSyncKey !== lastProfileSyncKey) {
    setLastProfileSyncKey(profileSyncKey);
    setFullName(user!.fullName);
    setGym(user!.gym);
    setCity(user!.city);
    setBio(user!.bio);
    setPhone(userData.phone);
    setCountry(userData.country);
    setMembershipTier(userData.membershipTier);
  }

  const identity = useMemo(() => {
    if (!user) {
      return null;
    }
    return buildProfileIdentity(user, userData);
  }, [user, userData]);

  if (loading || !user || !identity) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4 pt-8">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-zinc-400">Loading profile...</p>
      </main>
    );
  }

  const initials = user.fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  const joinedDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(user.createdAt));

  const savedFighters = fighters.filter((fighter) => userData.savedFighters.includes(fighter.slug));
  const savedTeamsList = teams.filter((team) => userData.savedTeams.includes(team.slug));
  const savedEvents = events.filter((event) => userData.savedEvents.includes(event.slug));
  const wishlistProducts = userData.wishlist
    .map((slug) => getShopProduct(slug))
    .filter((product): product is NonNullable<typeof product> => Boolean(product));
  const isAdmin = isAdminProfile(user);
  const unreadCount = userData.notifications.filter((entry) => !entry.read).length;
  const primaryStat = getPrimaryStatLabel(identity, orders.length);
  const tierLabel = identity.roles.includes("grand_council")
    ? "Grand Council"
    : getJtgcTierLabel(userData.membershipTier);

  async function handleSaveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      await updateProfile({
        fullName,
        accountType: user?.accountType ?? "fan",
        gym,
        city,
        bio,
      });
      updateUserCommerceProfile({ phone, country, membershipTier });
      setMessage("Profile updated successfully.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save profile.");
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
    setActiveSection(section);
  }

  const showFighterDashboard =
    identity.isFighter &&
    identity.athlete &&
    (activeSection === "profile" || activeSection === "dashboard");

  return (
    <main className="overflow-hidden px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
      <section className="relative mx-auto max-w-[90rem] py-10 sm:py-14">
        <div className="cinematic-grid absolute inset-0 opacity-30" aria-hidden />
        <div className="relative">
          <PageNavigation currentLabel="Your Profile" />

          <div className="mt-4 flex flex-wrap items-center justify-end gap-2 sm:mt-6">
            {isAdmin ? (
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10 px-5 py-2.5 text-xs font-black uppercase tracking-[0.18em] text-amber-200"
                href="/admin"
              >
                Admin Dashboard
              </Link>
            ) : null}
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 bg-black/40 px-5 py-2.5 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:border-red-500/40"
              href="/cart"
            >
              <ShoppingBag className="mr-2" size={16} aria-hidden />
              Cart
            </Link>
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 bg-black/40 px-5 py-2.5 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:border-red-500/40"
              onClick={handleLogout}
              type="button"
            >
              <LogOut className="mr-2" size={16} aria-hidden />
              Logout
            </button>
          </div>

          <div className="mt-6">
            <ProfileIdentityHeader identity={identity} initials={initials} user={user} />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <QuickStat label="Member Since" value={joinedDate} />
            <QuickStat label="JTGC Tier" value={tierLabel} />
            <QuickStat label={primaryStat.label} value={primaryStat.value} accent={identity.isFighter} />
            <QuickStat label="Profile Completion" value={`${identity.profileCompletion}%`} />
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[16rem_minmax(0,1fr)_18rem]">
            <ProfileSidebarNav
              activeSection={activeSection}
              identity={identity}
              onSectionChange={handleSectionChange}
              unreadCount={unreadCount}
            />

            <div className="min-w-0 space-y-6">
              {showFighterDashboard ? <FighterIdentityDashboard identity={identity} orderCount={orders.length} /> : null}

              {!identity.isFighter && activeSection === "profile" ? (
                <FanProfileOverview joinedDate={joinedDate} tierLabel={tierLabel} user={user} />
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

              {activeSection === "achievements" && identity.athlete ? (
                <AchievementsSection athlete={identity.athlete} />
              ) : null}

              {(activeSection === "profile" || activeSection === "dashboard") && user ? (
                <EquipmentOwned />
              ) : null}

              {(activeSection === "profile" || activeSection === "settings") && !showFighterDashboard ? (
                <MotionSection>
                  <form className="glass-panel rounded-[1.75rem] p-5 sm:p-8" onSubmit={handleSaveProfile}>
                    <h2 className="font-display text-4xl uppercase text-white sm:text-5xl">
                      {activeSection === "settings" ? "Settings" : "Identity Details"}
                    </h2>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <ProfileField label="Full name" onChange={setFullName} value={fullName} />
                      <ProfileField label="Email" onChange={() => undefined} readOnly value={user.email} />
                      <ProfileField label="Phone" onChange={setPhone} value={phone} />
                      <ProfileField label="Country" onChange={setCountry} value={country} />
                      <ProfileField label="Gym / affiliation" onChange={setGym} placeholder="Optional" value={gym} />
                      <ProfileField label="City" onChange={setCity} placeholder="Optional" value={city} />
                      {activeSection === "settings" ? (
                        <label className="block sm:col-span-2">
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
                      ) : (
                        <label className="block sm:col-span-2">
                          <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-zinc-400">Bio</span>
                          <textarea
                            className="min-h-32 w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none ring-red-500/40 transition placeholder:text-zinc-500 focus:ring-4"
                            onChange={(event) => setBio(event.target.value)}
                            value={bio}
                          />
                        </label>
                      )}
                    </div>
                    {message ? <p className="mt-4 text-sm text-emerald-300">{message}</p> : null}
                    {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
                    <button
                      className="mt-6 inline-flex min-h-12 items-center rounded-full bg-red-600 px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-white"
                      disabled={saving}
                      type="submit"
                    >
                      {saving ? "Saving..." : activeSection === "settings" ? "Save Settings" : "Save Profile"}
                    </button>
                  </form>
                </MotionSection>
              ) : null}

              {activeSection === "profile" && identity.isFighter ? (
                <MotionSection>
                  <form className="glass-panel rounded-[1.75rem] p-5 sm:p-8" onSubmit={handleSaveProfile}>
                    <h2 className="font-display text-4xl uppercase text-white sm:text-5xl">Credential Details</h2>
                    <p className="mt-2 text-sm text-zinc-400">
                      Update your official JTGC profile information. Rankings and fight history sync from sanctioned results.
                    </p>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <ProfileField label="Full name" onChange={setFullName} value={fullName} />
                      <ProfileField label="Gym / team" onChange={setGym} placeholder="Optional" value={gym} />
                      <ProfileField label="City / region" onChange={setCity} placeholder="Optional" value={city} />
                      <ProfileField label="Phone" onChange={setPhone} value={phone} />
                      <label className="block sm:col-span-2">
                        <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-zinc-400">Bio</span>
                        <textarea
                          className="min-h-28 w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none ring-red-500/40 transition placeholder:text-zinc-500 focus:ring-4"
                          onChange={(event) => setBio(event.target.value)}
                          value={bio}
                        />
                      </label>
                    </div>
                    {message ? <p className="mt-4 text-sm text-emerald-300">{message}</p> : null}
                    {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
                    <button
                      className="mt-6 inline-flex min-h-12 items-center rounded-full bg-red-600 px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-white"
                      disabled={saving}
                      type="submit"
                    >
                      {saving ? "Saving..." : "Update Credential"}
                    </button>
                  </form>
                </MotionSection>
              ) : null}

              {activeSection === "orders" ? (
                <CommerceSection title="Orders">
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
                              {new Date(order.createdAt).toLocaleDateString()} • {paymentMethodLabels[order.payment.method]}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-display text-2xl text-white">{formatCurrency(order.total)}</p>
                            <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">{orderStatusLabels[order.status]}</p>
                          </div>
                        </div>
                        <ul className="mt-4 space-y-1 text-sm text-zinc-400">
                          {order.items.map((item) => (
                            <li key={item.productSlug}>{item.name} × {item.quantity}</li>
                          ))}
                        </ul>
                        {order.trackingNumber ? (
                          <p className="mt-3 text-xs text-zinc-500">Tracking: {order.trackingNumber}</p>
                        ) : null}
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
                          <p className="mt-2 text-sm text-zinc-400">{fighter.division} • {fighter.record}</p>
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
                          <p className="mt-2 text-sm text-zinc-400">{team.region} • {team.record}</p>
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

              {activeSection === "saved-events" ? (
                <CommerceSection title="Saved Events">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {savedEvents.length === 0 ? (
                      <EmptyPanel href="/events" linkLabel="View Events" message="No saved events yet." />
                    ) : (
                      savedEvents.map((event) => (
                        <div className="glass-panel rounded-[1.5rem] p-5" key={event.slug}>
                          <Link className="font-display text-2xl uppercase text-white" href={`/events/${event.slug}`}>
                            {event.title}
                          </Link>
                          <p className="mt-2 text-sm text-zinc-400">{event.date} • {event.city}</p>
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
            </div>

            <div className="hidden xl:block">
              <ProfileRightRail
                identity={identity}
                membershipTier={userData.membershipTier}
                onCompleteProfile={() => setActiveSection("profile")}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function QuickStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="glass-panel rounded-2xl p-4">
      <p className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500">{label}</p>
      <p className={`mt-2 font-semibold ${accent ? "font-display text-2xl uppercase text-[#FF1010]" : "text-white"}`}>{value}</p>
    </div>
  );
}

function FanProfileOverview({
  user,
  tierLabel,
  joinedDate,
}: {
  user: { email: string; fullName: string };
  tierLabel: string;
  joinedDate: string;
}) {
  return (
    <div className="glass-panel rounded-[1.5rem] p-6 sm:p-8">
      <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-[#FF1010]">Fan Profile</p>
      <h2 className="font-display mt-2 text-4xl uppercase text-white">Community Member</h2>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
        Follow fighters, save events, and manage your JTGC membership. Register for competition to unlock your official
        athlete credential, rankings, and fight history.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <QuickStat label="Email" value={user.email} />
        <QuickStat label="JTGC Tier" value={tierLabel} />
        <QuickStat label="Member Since" value={joinedDate} />
      </div>
      <Link
        className="glass-panel mt-6 flex items-center justify-between rounded-[1.25rem] p-5 transition hover:border-red-500/40"
        href="/registration"
      >
        <span className="font-display text-2xl uppercase text-white">Competition Registration</span>
        <ArrowRight size={18} aria-hidden />
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

function ProfileField({
  label,
  value,
  onChange,
  placeholder,
  readOnly,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-zinc-400">{label}</span>
      <input
        className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none ring-red-500/40 transition placeholder:text-zinc-500 focus:ring-4 disabled:opacity-60"
        disabled={readOnly}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        value={value}
      />
    </label>
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
