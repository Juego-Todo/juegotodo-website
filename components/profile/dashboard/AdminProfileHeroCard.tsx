"use client";

import { motion } from "framer-motion";
import { Camera, Loader2, Pencil, X } from "lucide-react";
import { useRef, useState } from "react";
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
import { readUploadAsDataUrl } from "@/lib/licenses/file-upload";

const accountTypes = Object.keys(accountTypeLabels) as AccountType[];
const fieldClassName =
  "mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none ring-amber-500/30 focus:ring-4";

function buildInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function AdminProfileAvatar({
  displayName,
  portraitImage,
  onUpload,
}: {
  displayName: string;
  portraitImage?: string;
  onUpload?: (dataUrl: string) => Promise<void> | void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const initials = buildInitials(displayName);

  async function handleFile(file: File) {
    if (!onUpload) {
      return;
    }

    setUploading(true);
    try {
      const dataUrl = await readUploadAsDataUrl(file);
      await onUpload(dataUrl);
    } finally {
      setUploading(false);
    }
  }

  const avatarBody = portraitImage ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={`${displayName} profile photo`} className="h-full w-full object-cover object-top" src={portraitImage} />
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_35%_18%,rgba(245,158,11,0.35),transparent_38%),linear-gradient(145deg,#27272a,#050505)] font-display text-3xl text-white sm:text-4xl">
      {initials}
    </div>
  );

  if (!onUpload) {
    return (
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-amber-500/40 bg-black/50 shadow-[0_0_32px_rgba(245,158,11,0.18)] sm:h-28 sm:w-28">
        {avatarBody}
      </div>
    );
  }

  return (
    <div className="relative shrink-0">
      <input
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void handleFile(file);
          }
          event.target.value = "";
        }}
        ref={inputRef}
        type="file"
      />
      <button
        aria-label={portraitImage ? "Change profile photo" : "Add profile photo"}
        className="group relative h-24 w-24 overflow-hidden rounded-full border-4 border-amber-500/40 bg-black/50 shadow-[0_0_32px_rgba(245,158,11,0.18)] transition hover:border-amber-300/60 sm:h-28 sm:w-28"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        type="button"
      >
        {avatarBody}
        <span className="absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
          {uploading ? (
            <Loader2 className="animate-spin text-amber-100" size={22} aria-hidden />
          ) : (
            <Camera className="text-amber-100" size={22} aria-hidden />
          )}
        </span>
      </button>
    </div>
  );
}

function AdminUserInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-white">{value}</dd>
    </div>
  );
}

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
      className="relative overflow-hidden rounded-[2rem] px-6 py-8 sm:px-10 sm:py-10"
      initial={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${role.bannerClass}`} aria-hidden />
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,16,16,0.18),transparent_40%)]"
        aria-hidden
      />

      <div className="relative">
        <button
          aria-label={editing ? "Cancel editing profile" : "Edit profile"}
          className="absolute right-0 top-0 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/30 text-zinc-300 transition hover:border-amber-400/40 hover:bg-amber-500/10 hover:text-amber-100"
          onClick={() => (editing ? handleCancel() : startEditing())}
          type="button"
        >
          {editing ? <X size={16} aria-hidden /> : <Pencil size={16} aria-hidden />}
        </button>

        <form onSubmit={(event) => void handleSave(event)}>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <AdminProfileAvatar
              displayName={editing ? form.fullName : user.fullName}
              onUpload={onPortraitUpload}
              portraitImage={portraitImage}
            />
            <div className="min-w-0 flex-1 space-y-2 pr-12 sm:pr-14">
              {editing ? (
                <>
                  <label className="block">
                    <span className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">Full Name</span>
                    <input
                      className={`${fieldClassName} font-display text-2xl uppercase sm:text-3xl`}
                      onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                      required
                      value={form.fullName}
                    />
                  </label>
                  <label className="block">
                    <span className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">Username</span>
                    <input
                      className={fieldClassName}
                      onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                      required
                      value={form.username}
                    />
                  </label>
                </>
              ) : (
                <>
                  <h1 className="font-display text-5xl uppercase leading-[0.92] text-white sm:text-7xl">{user.fullName}</h1>
                  <p className="text-sm font-semibold tracking-[0.08em] text-zinc-400">{formatUsername(user.username)}</p>
                </>
              )}
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-300">{role.roleTitle}</p>
            </div>
          </div>

          <div className="mt-8 border-t border-white/10 pt-6">
            <p className="text-[0.58rem] font-black uppercase tracking-[0.18em] text-zinc-500">User Information</p>

            {editing ? (
              <div className="mt-4 space-y-4">
                <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <label className="block">
                    <span className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">Email</span>
                    <input
                      className={fieldClassName}
                      onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                      required
                      type="email"
                      value={form.email}
                    />
                  </label>
                  <label className="block">
                    <span className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">DOB</span>
                    <input
                      className={fieldClassName}
                      onChange={(event) => setForm((current) => ({ ...current, dateOfBirth: event.target.value }))}
                      type="date"
                      value={form.dateOfBirth}
                    />
                  </label>
                  <div>
                    <dt className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">Date Joined</dt>
                    <dd className="mt-1 text-sm font-semibold text-zinc-400">{dateJoined}</dd>
                  </div>
                  <label className="block">
                    <span className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">Account Type</span>
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
                </dl>

                {error ? <p className="text-sm text-red-300">{error}</p> : null}

                <div className="flex flex-wrap gap-3">
                  <button
                    className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#FF1010] px-5 text-[0.62rem] font-black uppercase tracking-[0.14em] text-white transition hover:bg-red-600 disabled:opacity-60"
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
                    className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/10 px-5 text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-300 transition hover:border-white/20 hover:text-white"
                    disabled={saving}
                    onClick={handleCancel}
                    type="button"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <dl className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <AdminUserInfoRow label="Email" value={user.email} />
                <AdminUserInfoRow label="DOB" value={dateOfBirth} />
                <AdminUserInfoRow label="Date Joined" value={dateJoined} />
                <AdminUserInfoRow label="Account Type" value={accountTypeLabel} />
              </dl>
            )}
          </div>
        </form>
      </div>
    </motion.section>
  );
}
