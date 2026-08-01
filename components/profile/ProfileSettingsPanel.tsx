"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";
import { MotionSection } from "@/components/MotionSection";
import { useAuth } from "@/lib/auth/context";
import { formatUsername } from "@/lib/auth/username";

type ProfileSettingsPanelProps = {
  accountTypeLabel: string;
  onLogout: () => void | Promise<void>;
};

export function ProfileSettingsPanel({
  accountTypeLabel,
  onLogout,
}: ProfileSettingsPanelProps) {
  const { user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [city, setCity] = useState(user?.city ?? "");
  const [gym, setGym] = useState(user?.gym ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const profileSyncKey = user
    ? `${user.id}|${user.fullName}|${user.city}|${user.gym}|${user.bio}`
    : "";
  const [lastProfileSyncKey, setLastProfileSyncKey] = useState(profileSyncKey);

  if (user && profileSyncKey !== lastProfileSyncKey) {
    setLastProfileSyncKey(profileSyncKey);
    setFullName(user.fullName);
    setCity(user.city);
    setGym(user.gym);
    setBio(user.bio);
  }

  if (!user) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) {
      return;
    }

    const currentUser = user;
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      await updateProfile({
        fullName: fullName.trim() || currentUser.fullName,
        accountType: currentUser.accountType,
        gym: gym.trim(),
        city: city.trim(),
        bio: bio.trim(),
      });
      setMessage("Settings saved.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <MotionSection>
      <form
        className="rounded-[1.75rem] border border-white/10 bg-white/[0.02] p-5 sm:p-8"
        onSubmit={(event) => void handleSubmit(event)}
      >
        <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-[#FF1010]">Account</p>
        <h2 className="font-display mt-2 text-4xl uppercase text-white sm:text-5xl">Settings</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
          Manage your profile details. The same settings are available for every member role.
        </p>

        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
            <dt className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">Email</dt>
            <dd className="mt-2 text-sm font-semibold text-white">{user.email}</dd>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
            <dt className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">Username</dt>
            <dd className="mt-2 text-sm font-semibold text-white">
              {user.username ? formatUsername(user.username) : "—"}
            </dd>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/35 p-4 sm:col-span-2 sm:max-w-sm">
            <dt className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">Account Type</dt>
            <dd className="mt-2 text-sm font-semibold text-white">{accountTypeLabel}</dd>
          </div>
        </dl>

        <div className="mt-8 space-y-4 border-t border-white/10 pt-6">
          <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-zinc-500">Profile Details</p>
          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-zinc-400">Full name</span>
            <input
              className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none ring-red-500/40 focus:ring-4"
              onChange={(event) => setFullName(event.target.value)}
              value={fullName}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-zinc-400">City</span>
            <input
              className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none ring-red-500/40 focus:ring-4"
              onChange={(event) => setCity(event.target.value)}
              value={city}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-zinc-400">Gym / Club</span>
            <input
              className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none ring-red-500/40 focus:ring-4"
              onChange={(event) => setGym(event.target.value)}
              value={gym}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-zinc-400">Bio</span>
            <textarea
              className="min-h-28 w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none ring-red-500/40 focus:ring-4"
              onChange={(event) => setBio(event.target.value)}
              value={bio}
            />
          </label>
        </div>

        {message ? <p className="mt-4 text-sm text-emerald-300">{message}</p> : null}
        {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}

        <button
          className="mt-6 inline-flex min-h-12 items-center rounded-full bg-red-600 px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:bg-red-500 disabled:opacity-60"
          disabled={saving}
          type="submit"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>

        <div className="mt-8 border-t border-white/10 pt-6">
          <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-zinc-500">Session</p>
          <p className="mt-2 text-sm text-zinc-400">Sign out of your JTGC account on this device.</p>
          <button
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 bg-black/40 px-5 py-2.5 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:border-red-500/40"
            onClick={() => void onLogout()}
            type="button"
          >
            <LogOut className="mr-2" size={16} aria-hidden />
            Logout
          </button>
        </div>
      </form>
    </MotionSection>
  );
}
