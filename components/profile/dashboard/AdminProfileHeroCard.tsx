"use client";

import { motion } from "framer-motion";
import { Loader2, Pencil, X } from "lucide-react";
import { useState } from "react";
import { ProfileAvatarButton } from "@/components/profile/ProfileAvatarButton";
import { formatLicenseDate, type LicenseApplication } from "@/data/license-applications";
import { adminUpdateMemberProfile } from "@/lib/admin/member-directory";
import { useAuth } from "@/lib/auth/context";
import { accountTypeLabels, type AccountType, type UserProfile } from "@/lib/auth/types";
import { formatUsername } from "@/lib/auth/username";
import type { MemberRecord } from "@/lib/profile/member-record";
import {
  getProfileDateOfBirth,
  resolveProfileDateOfBirth,
  saveProfileDateOfBirth,
} from "@/lib/profile/profile-details-storage";

const accountTypes = Object.keys(accountTypeLabels) as AccountType[];
const fieldClassName =
  "mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none ring-amber-500/30 focus:ring-2";

type AdminProfileForm = {
  fullName: string;
  username: string;
  email: string;
  accountType: AccountType;
  dateOfBirth: string;
};

function buildForm(user: UserProfile, licenseApplication: LicenseApplication | null): AdminProfileForm {
  return {
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    accountType: user.accountType,
    dateOfBirth: resolveProfileDateOfBirth(user.id, licenseApplication?.dateOfBirth),
  };
}

export function AdminProfileHeroCard({
  user,
  memberRecord,
  portraitImage,
  licenseApplication = null,
  onPortraitUpload,
}: {
  user: UserProfile;
  memberRecord: MemberRecord;
  portraitImage?: string;
  licenseApplication?: LicenseApplication | null;
  onPortraitUpload?: (dataUrl: string) => Promise<void> | void;
}) {
  const { refreshUser } = useAuth();
  const role = memberRecord.roleModule;
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedDobOverride, setSavedDobOverride] = useState<string | null>(null);
  const [form, setForm] = useState<AdminProfileForm>(() => buildForm(user, licenseApplication));

  const savedDob = savedDobOverride ?? getProfileDateOfBirth(user.id) ?? "";

  const dateJoined = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(user.createdAt));

  const dateOfBirth = formatLicenseDate(
    savedDob || resolveProfileDateOfBirth(user.id, licenseApplication?.dateOfBirth),
  );
  const accountTypeLabel = accountTypeLabels[user.accountType];

  function startEditing() {
    setForm(buildForm(user, licenseApplication));
    setEditing(true);
  }

  function handleCancel() {
    setEditing(false);
    setError(null);
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await adminUpdateMemberProfile(user.id, {
        fullName: form.fullName,
        username: form.username,
        email: form.email,
        accountType: form.accountType,
        role: user.role,
        gym: user.gym,
        city: user.city,
        bio: user.bio,
      });
      saveProfileDateOfBirth(user.id, form.dateOfBirth || null);
      setSavedDobOverride(form.dateOfBirth);
      await refreshUser();
      setEditing(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-white/10 px-4 py-4 sm:px-5 sm:py-4"
      initial={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${role.bannerClass} opacity-80`} aria-hidden />
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_0%_50%,rgba(255,16,16,0.12),transparent_45%)]"
        aria-hidden
      />

      <div className="relative">
        <form onSubmit={(event) => void handleSave(event)}>
          <div className="flex items-start gap-3.5 sm:items-center sm:gap-4">
            <ProfileAvatarButton
              accent="amber"
              className="h-14 w-14 border-2 text-base sm:h-12 sm:w-12 sm:text-sm"
              displayName={editing ? form.fullName : user.fullName}
              onSave={onPortraitUpload}
              portraitImage={portraitImage}
              size="sm"
            />

            <div className="min-w-0 flex-1">
              {editing ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-[0.55rem] font-black uppercase tracking-[0.14em] text-zinc-500">Full Name</span>
                    <input
                      className={fieldClassName}
                      onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                      required
                      value={form.fullName}
                    />
                  </label>
                  <label className="block">
                    <span className="text-[0.55rem] font-black uppercase tracking-[0.14em] text-zinc-500">Username</span>
                    <input
                      className={fieldClassName}
                      onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                      required
                      value={form.username}
                    />
                  </label>
                </div>
              ) : (
                <div className="min-w-0 pr-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h1 className="font-display truncate text-lg uppercase leading-none text-white sm:text-2xl">
                        {user.fullName}
                      </h1>
                      <p className="mt-1 truncate text-xs font-semibold text-zinc-500">
                        {formatUsername(user.username)}
                      </p>
                    </div>
                    <button
                      aria-label="Edit profile"
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/30 text-zinc-300 transition hover:border-amber-400/40 hover:bg-amber-500/10 hover:text-amber-100 sm:h-9 sm:w-9"
                      onClick={startEditing}
                      type="button"
                    >
                      <Pencil size={15} aria-hidden />
                    </button>
                  </div>
                  <p className="mt-1.5 text-[0.62rem] font-black uppercase tracking-[0.14em] text-amber-200/85">
                    {role.roleTitle}
                  </p>
                  <p className="mt-1.5 text-[0.7rem] leading-5 text-zinc-500 sm:truncate sm:text-xs">
                    <span className="block truncate sm:inline">{user.email}</span>
                    <span className="mx-1.5 hidden text-zinc-700 sm:inline">·</span>
                    <span className="mt-0.5 block sm:mt-0 sm:inline">
                      Joined {dateJoined}
                      <span className="mx-1.5 text-zinc-700">·</span>
                      {accountTypeLabel}
                      {dateOfBirth !== "—" ? (
                        <>
                          <span className="mx-1.5 text-zinc-700">·</span>
                          DOB {dateOfBirth}
                        </>
                      ) : null}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {editing ? (
              <button
                aria-label="Cancel editing profile"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/30 text-zinc-300 transition hover:border-amber-400/40 hover:bg-amber-500/10 hover:text-amber-100 sm:h-9 sm:w-9"
                onClick={handleCancel}
                type="button"
              >
                <X size={15} aria-hidden />
              </button>
            ) : null}
          </div>

          {editing ? (
            <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <label className="block">
                  <span className="text-[0.55rem] font-black uppercase tracking-[0.14em] text-zinc-500">Email</span>
                  <input
                    className={fieldClassName}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    required
                    type="email"
                    value={form.email}
                  />
                </label>
                <label className="block">
                  <span className="text-[0.55rem] font-black uppercase tracking-[0.14em] text-zinc-500">DOB</span>
                  <input
                    className={fieldClassName}
                    onChange={(event) => setForm((current) => ({ ...current, dateOfBirth: event.target.value }))}
                    type="date"
                    value={form.dateOfBirth}
                  />
                </label>
                <div>
                  <p className="text-[0.55rem] font-black uppercase tracking-[0.14em] text-zinc-500">Date Joined</p>
                  <p className="mt-1 text-sm font-semibold text-zinc-400">{dateJoined}</p>
                </div>
                <label className="block">
                  <span className="text-[0.55rem] font-black uppercase tracking-[0.14em] text-zinc-500">Account Type</span>
                  <select
                    className={fieldClassName}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, accountType: event.target.value as AccountType }))
                    }
                    value={form.accountType}
                  >
                    {accountTypes.map((type) => (
                      <option key={type} value={type}>
                        {accountTypeLabels[type]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {error ? <p className="text-sm text-red-300">{error}</p> : null}

              <div className="flex flex-wrap gap-2">
                <button
                  className="inline-flex min-h-9 items-center justify-center rounded-full bg-[#FF1010] px-4 text-[0.62rem] font-black uppercase tracking-[0.14em] text-white transition hover:bg-red-600 disabled:opacity-60"
                  disabled={saving}
                  type="submit"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" size={14} aria-hidden />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
                <button
                  className="inline-flex min-h-9 items-center justify-center rounded-full border border-white/10 px-4 text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-300 transition hover:border-white/20 hover:text-white"
                  disabled={saving}
                  onClick={handleCancel}
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}
        </form>
      </div>
    </motion.section>
  );
}
