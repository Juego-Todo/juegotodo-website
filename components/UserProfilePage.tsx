"use client";

import { ArrowRight, CalendarDays, LogOut, MapPin, Shield, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MotionSection } from "@/components/MotionSection";
import { useAuth } from "@/lib/auth/context";
import { accountTypeLabels, type AccountType } from "@/lib/auth/types";

const accountTypes = Object.keys(accountTypeLabels) as AccountType[];

export function UserProfilePage() {
  const router = useRouter();
  const { user, loading, logout, updateProfile } = useAuth();

  const [fullName, setFullName] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("fan");
  const [gym, setGym] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
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
    setAccountType(user.accountType);
    setGym(user.gym);
    setCity(user.city);
    setBio(user.bio);
  }, [user]);

  if (loading || !user) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4 pt-24">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-zinc-400">
          Loading profile...
        </p>
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

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      await updateProfile({ fullName, accountType, gym, city, bio });
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
      <section className="relative mx-auto max-w-6xl py-10 sm:py-14">
        <div className="cinematic-grid absolute inset-0 opacity-30" aria-hidden />
        <div className="relative">
          <div className="glass-panel overflow-hidden rounded-[1.75rem]">
            <div className="bg-[radial-gradient(circle_at_80%_0%,rgba(229,9,20,0.35),transparent_28rem),linear-gradient(135deg,#120305,#050506)] p-6 sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex items-center gap-5">
                  <div className="flex h-20 w-20 items-center justify-center rounded-[1.5rem] border border-white/10 bg-black/40 text-2xl font-black text-white shadow-[0_0_40px_rgba(229,9,20,0.25)]">
                    {initials || "JT"}
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.28em] text-red-300">
                      Juego Todo Profile
                    </p>
                    <h1 className="font-display mt-2 text-4xl uppercase leading-none text-white sm:text-6xl">
                      {user.fullName}
                    </h1>
                    <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-300">
                      {accountTypeLabels[user.accountType]} • {user.email}
                    </p>
                  </div>
                </div>
                <button
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 bg-black/40 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:border-red-500/40 hover:bg-white/10"
                  onClick={handleLogout}
                  type="button"
                >
                  <LogOut className="mr-2" size={16} aria-hidden />
                  Sign Out
                </button>
              </div>
            </div>

            <div className="grid gap-4 border-t border-white/10 p-6 sm:grid-cols-3 sm:p-8">
              <ProfileStat icon={<UserRound aria-hidden size={18} />} label="Account Type" value={accountTypeLabels[user.accountType]} />
              <ProfileStat icon={<CalendarDays aria-hidden size={18} />} label="Member Since" value={joinedDate} />
              <ProfileStat icon={<Shield aria-hidden size={18} />} label="Status" value="Active Member" />
            </div>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <MotionSection>
              <form className="glass-panel rounded-[1.75rem] p-5 sm:p-8" onSubmit={handleSave}>
                <h2 className="font-display text-4xl uppercase text-white sm:text-5xl">
                  Edit Profile
                </h2>
                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  Update your public-facing Juego Todo account details.
                </p>

                <div className="mt-6 grid gap-4">
                  <ProfileField label="Full name" onChange={setFullName} value={fullName} />
                  <label className="block">
                    <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
                      Account type
                    </span>
                    <select
                      className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none ring-red-500/40 transition focus:ring-4"
                      onChange={(event) => setAccountType(event.target.value as AccountType)}
                      value={accountType}
                    >
                      {accountTypes.map((type) => (
                        <option key={type} value={type}>
                          {accountTypeLabels[type]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <ProfileField label="Gym / affiliation" onChange={setGym} placeholder="Optional" value={gym} />
                  <ProfileField label="City" onChange={setCity} placeholder="Optional" value={city} />
                  <label className="block">
                    <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
                      Bio
                    </span>
                    <textarea
                      className="min-h-32 w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none ring-red-500/40 transition placeholder:text-zinc-500 focus:ring-4"
                      onChange={(event) => setBio(event.target.value)}
                      placeholder="Tell the community about your role in Filipino combat sports."
                      value={bio}
                    />
                  </label>
                </div>

                {message ? (
                  <p className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                    {message}
                  </p>
                ) : null}
                {error ? (
                  <p className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                  </p>
                ) : null}

                <button
                  className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-red-600 px-6 py-4 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  disabled={saving}
                  type="submit"
                >
                  {saving ? "Saving..." : "Save Profile"}
                  <ArrowRight className="ml-2" size={18} aria-hidden />
                </button>
              </form>
            </MotionSection>

            <MotionSection className="space-y-5">
              <div className="glass-panel rounded-[1.75rem] p-6">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">
                  Next Steps
                </p>
                <h2 className="font-display mt-3 text-3xl uppercase leading-none text-white">
                  Official Registration
                </h2>
                <p className="mt-4 text-sm leading-7 text-zinc-400">
                  Ready to register as a fighter, gym, official, or media applicant? Continue
                  through the official Juego Todo intake funnel.
                </p>
                <Link
                  className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:border-red-500/40 hover:bg-white/10"
                  href="/registration"
                >
                  Open Competition Registration
                  <ArrowRight className="ml-2" size={16} aria-hidden />
                </Link>
              </div>

              <div className="glass-panel rounded-[1.75rem] p-6">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">
                  Account Snapshot
                </p>
                <div className="mt-4 space-y-3 text-sm text-zinc-400">
                  <p className="flex items-center gap-2">
                    <MapPin className="text-red-300" size={16} aria-hidden />
                    {city || "City not set yet"}
                  </p>
                  <p>{gym ? `Affiliated with ${gym}` : "No gym affiliation added yet"}</p>
                  <p>{bio || "Add a short bio to personalize your Juego Todo profile."}</p>
                </div>
              </div>
            </MotionSection>
          </div>
        </div>
      </section>
    </main>
  );
}

function ProfileStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
        {label}
      </span>
      <input
        className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none ring-red-500/40 transition placeholder:text-zinc-500 focus:ring-4"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  );
}
