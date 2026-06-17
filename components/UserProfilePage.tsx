"use client";

import {
  ArrowRight,
  Bell,
  CalendarDays,
  Heart,
  LogOut,
  Package,
  Settings,
  Shield,
  ShoppingBag,
  Star,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MotionSection } from "@/components/MotionSection";
import { PageNavigation } from "@/components/PageNavigation";
import { events, fighters, getShopProduct } from "@/data/site";
import { teams } from "@/data/teams";
import { useAuth } from "@/lib/auth/context";
import { useCommerce } from "@/lib/commerce/context";
import { isAdminUser } from "@/lib/commerce/storage";
import { formatCurrency } from "@/lib/commerce/pricing";
import {
  membershipTierLabels,
  orderStatusLabels,
  paymentMethodLabels,
  type MembershipTier,
} from "@/lib/commerce/types";

const membershipTiers = Object.keys(membershipTierLabels) as MembershipTier[];

const tabs = [
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "orders", label: "Orders", icon: Package },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "fighters", label: "Saved Fighters", icon: Star },
  { id: "teams", label: "Saved Teams", icon: Shield },
  { id: "events", label: "Saved Events", icon: CalendarDays },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function UserProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as TabId | null) ?? "profile";
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

  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
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

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?next=/profile");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) {
      return;
    }
    setFullName(user.fullName);
    setGym(user.gym);
    setCity(user.city);
    setBio(user.bio);
    setPhone(userData.phone);
    setCountry(userData.country);
    setMembershipTier(userData.membershipTier);
  }, [user, userData]);

  if (loading || !user) {
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
  const isAdmin = isAdminUser(user.email, user.accountType);
  const unreadCount = userData.notifications.filter((entry) => !entry.read).length;

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
    logout();
    router.push("/login");
  }

  return (
    <main className="overflow-hidden px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
      <section className="relative mx-auto max-w-7xl py-10 sm:py-14">
        <div className="cinematic-grid absolute inset-0 opacity-30" aria-hidden />
        <div className="relative">
          <PageNavigation currentLabel="Your Profile" />

          <div className="glass-panel mt-4 overflow-hidden rounded-[1.75rem] sm:mt-6">
            <div className="bg-[radial-gradient(circle_at_80%_0%,rgba(229,9,20,0.35),transparent_28rem),linear-gradient(135deg,#120305,#050506)] p-6 sm:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex items-center gap-5">
                  <div className="flex h-20 w-20 items-center justify-center rounded-[1.5rem] border border-white/10 bg-black/40 text-2xl font-black text-white shadow-[0_0_40px_rgba(229,9,20,0.25)]">
                    {initials || "JT"}
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.28em] text-red-300">
                      {membershipTierLabels[userData.membershipTier]}
                    </p>
                    <h1 className="font-display mt-2 text-4xl uppercase leading-none text-white sm:text-6xl">
                      {user.fullName}
                    </h1>
                    <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-300">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {isAdmin ? (
                    <Link
                      className="inline-flex min-h-12 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-amber-200"
                      href="/admin"
                    >
                      Admin Dashboard
                    </Link>
                  ) : null}
                  <Link
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 bg-black/40 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:border-red-500/40"
                    href="/cart"
                  >
                    <ShoppingBag className="mr-2" size={16} aria-hidden />
                    Cart
                  </Link>
                  <button
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 bg-black/40 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:border-red-500/40"
                    onClick={handleLogout}
                    type="button"
                  >
                    <LogOut className="mr-2" size={16} aria-hidden />
                    Logout
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-4 border-t border-white/10 p-6 sm:grid-cols-4 sm:p-8">
              <ProfileStat icon={<UserRound size={18} aria-hidden />} label="Email" value={user.email} />
              <ProfileStat icon={<CalendarDays size={18} aria-hidden />} label="Member Since" value={joinedDate} />
              <ProfileStat icon={<Shield size={18} aria-hidden />} label="Membership" value={membershipTierLabels[userData.membershipTier]} />
              <ProfileStat icon={<Package size={18} aria-hidden />} label="Orders" value={`${orders.length}`} />
            </div>
          </div>

          <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-xs font-black uppercase tracking-[0.16em] transition ${
                    active ? "bg-red-600 text-white" : "border border-white/10 text-zinc-300 hover:text-white"
                  }`}
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  type="button"
                >
                  <Icon size={14} aria-hidden />
                  {tab.label}
                  {tab.id === "notifications" && unreadCount > 0 ? (
                    <span className="rounded-full bg-white px-1.5 py-0.5 text-[0.6rem] text-black">{unreadCount}</span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {activeTab === "profile" ? (
            <div className="mt-6 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <MotionSection>
                <form className="glass-panel rounded-[1.75rem] p-5 sm:p-8" onSubmit={handleSaveProfile}>
                  <h2 className="font-display text-4xl uppercase text-white sm:text-5xl">Identity</h2>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <ProfileField label="Full name" onChange={setFullName} value={fullName} />
                    <ProfileField label="Email" onChange={() => undefined} readOnly value={user.email} />
                    <ProfileField label="Phone" onChange={setPhone} value={phone} />
                    <ProfileField label="Country" onChange={setCountry} value={country} />
                    <ProfileField label="Gym / affiliation" onChange={setGym} placeholder="Optional" value={gym} />
                    <ProfileField label="City" onChange={setCity} placeholder="Optional" value={city} />
                    <label className="block sm:col-span-2">
                      <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-zinc-400">Bio</span>
                      <textarea
                        className="min-h-32 w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none ring-red-500/40 transition placeholder:text-zinc-500 focus:ring-4"
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
                    {saving ? "Saving..." : "Save Profile"}
                  </button>
                </form>
              </MotionSection>

              <MotionSection className="space-y-5">
                {user.accountType === "athlete" ? (
                  <div className="glass-panel rounded-[1.75rem] p-6">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">Athlete Member Perks</p>
                    <ul className="mt-4 space-y-2 text-sm text-zinc-300">
                      <li>10% athlete gear discount at checkout</li>
                      <li>Competition registration access</li>
                      <li>Rankings profile linkage</li>
                      <li>Seminar registration priority</li>
                    </ul>
                  </div>
                ) : null}
                <div className="glass-panel rounded-[1.75rem] p-6">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">JTGC Membership Tiers</p>
                  <div className="mt-4 space-y-3 text-sm text-zinc-400">
                    <p><strong className="text-white">Free</strong> — Basic profile, shop access, news</p>
                    <p><strong className="text-white">Pro</strong> — Exclusive content, early tickets, discounts</p>
                    <p><strong className="text-white">Elite</strong> — VIP seating, seminars, exclusive merch</p>
                  </div>
                </div>
                <Link
                  className="glass-panel flex items-center justify-between rounded-[1.75rem] p-6 transition hover:border-red-500/40"
                  href="/registration"
                >
                  <span className="font-display text-2xl uppercase text-white">Competition Registration</span>
                  <ArrowRight size={18} aria-hidden />
                </Link>
              </MotionSection>
            </div>
          ) : null}

          {activeTab === "orders" ? (
            <div className="mt-6 space-y-4">
              <div className="flex justify-end">
                <Link className="text-xs font-black uppercase tracking-[0.16em] text-red-200" href="/orders">
                  Full Order History
                </Link>
              </div>
              {orders.length === 0 ? (
                <EmptyPanel message="No orders yet." href="/shop" linkLabel="Browse Shop" />
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
            </div>
          ) : null}

          {activeTab === "wishlist" ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {wishlistProducts.length === 0 ? (
                <div className="sm:col-span-2 lg:col-span-3">
                  <EmptyPanel message="Your wishlist is empty." href="/shop" linkLabel="Explore Gear" />
                </div>
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
          ) : null}

          {activeTab === "fighters" ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {savedFighters.length === 0 ? (
                <div className="sm:col-span-2 lg:col-span-3">
                  <EmptyPanel message="No saved fighters yet." href="/fighters" linkLabel="Browse Fighter Database" />
                </div>
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
          ) : null}

          {activeTab === "teams" ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {savedTeamsList.length === 0 ? (
                <div className="sm:col-span-2 lg:col-span-3">
                  <EmptyPanel message="No saved teams yet." href="/teams" linkLabel="Browse Teams" />
                </div>
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
          ) : null}

          {activeTab === "events" ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {savedEvents.length === 0 ? (
                <div className="sm:col-span-2">
                  <EmptyPanel message="No saved events yet." href="/events" linkLabel="View Events" />
                </div>
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
          ) : null}

          {activeTab === "notifications" ? (
            <div className="mt-6 space-y-3">
              {userData.notifications.length === 0 ? (
                <EmptyPanel message="No notifications yet." href="/shop" linkLabel="Shop Now" />
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
                    <p className="mt-2 text-xs text-zinc-500">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </button>
                ))
              )}
            </div>
          ) : null}

          {activeTab === "settings" ? (
            <form
              className="glass-panel mt-6 max-w-2xl rounded-[1.75rem] p-5 sm:p-8"
              onSubmit={handleSaveProfile}
            >
              <h2 className="font-display text-4xl uppercase text-white">Settings</h2>
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
                      {membershipTierLabels[tier]}
                    </option>
                  ))}
                </select>
              </label>
              <ProfileField className="mt-4" label="Phone" onChange={setPhone} value={phone} />
              <ProfileField className="mt-4" label="Country" onChange={setCountry} value={country} />
              <button
                className="mt-6 inline-flex min-h-12 items-center rounded-full bg-red-600 px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-white"
                disabled={saving}
                type="submit"
              >
                Save Settings
              </button>
            </form>
          ) : null}
        </div>
      </section>
    </main>
  );
}

function ProfileStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center gap-2 text-red-300">{icon}</div>
      <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
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
