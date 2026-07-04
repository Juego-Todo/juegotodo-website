"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminAccountTagEditor } from "@/components/profile/AdminAccountTagEditor";
import { accountTypeLabels, type AccountType, type AdminUserUpdateInput, type UserRole } from "@/lib/auth/types";
import {
  adminDeleteMemberAccount,
  adminResetMemberPassword,
  adminUpdateMemberProfile,
  type AdminMemberRecord,
} from "@/lib/admin/member-directory";

type ManageMode = "edit" | "reset" | "delete" | "tags";

const fieldClassName =
  "mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none ring-red-500/40 focus:ring-4";

export function AdminMemberManageModal({
  member,
  mode,
  onClose,
  onSaved,
}: {
  member: AdminMemberRecord | null;
  mode: ManageMode | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [form, setForm] = useState<AdminUserUpdateInput>({
    fullName: "",
    username: "",
    email: "",
    accountType: "fan",
    role: "user",
    gym: "",
    city: "",
    bio: "",
    phone: "",
    country: "",
  });

  useEffect(() => {
    if (!member) {
      return;
    }

    setError("");
    setPassword("");
    setConfirmPassword("");
    setForm({
      fullName: member.fullName,
      username: member.username === "—" ? "" : member.username,
      email: member.email,
      accountType: member.accountType,
      role: member.role,
      gym: member.gym === "—" ? "" : member.gym,
      city: member.city === "—" ? "" : member.city,
      bio: member.bio === "—" ? "" : member.bio,
      phone: member.phone === "—" ? "" : member.phone,
      country: member.country === "—" ? "" : member.country,
    });
  }, [member, mode]);

  if (!member || !mode) {
    return null;
  }

  const titles: Record<ManageMode, string> = {
    edit: "Edit Profile",
    reset: "Reset Password",
    delete: "Delete Profile",
    tags: "Manage Tags",
  };

  async function handleEditSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      await adminUpdateMemberProfile(member!.userId, form);
      onSaved();
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to update profile.");
    } finally {
      setBusy(false);
    }
  }

  async function handleResetSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setBusy(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setBusy(false);
      return;
    }

    try {
      await adminResetMemberPassword(member!.userId, password);
      onSaved();
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to reset password.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteConfirm() {
    setBusy(true);
    setError("");

    try {
      await adminDeleteMemberAccount(member!.userId);
      onSaved();
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to delete profile.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.button
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm"
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        onClick={onClose}
        type="button"
        aria-label="Close dialog"
      />
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="fixed inset-x-4 top-[8vh] z-[71] mx-auto max-h-[84vh] w-full max-w-2xl overflow-y-auto rounded-[1.5rem] border border-white/10 bg-[#0a0a0a] shadow-2xl sm:inset-x-auto"
        exit={{ opacity: 0, y: 16 }}
        initial={{ opacity: 0, y: 16 }}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between border-b border-white/10 px-5 py-4 sm:px-6">
          <div>
            <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-[#FF1010]">Member Directory</p>
            <h2 className="font-display text-2xl uppercase text-white">{titles[mode]}</h2>
            <p className="mt-1 text-sm text-zinc-400">
              {member.firstName} {member.lastName} • {member.email}
            </p>
          </div>
          <button
            className="rounded-full border border-white/10 p-2 text-zinc-400 transition hover:text-white"
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-5 sm:px-6">
          {error ? (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          {mode === "edit" ? (
            <form className="space-y-4" onSubmit={handleEditSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-xs font-black uppercase tracking-[0.14em] text-zinc-500">
                  Full Name
                  <input
                    className={fieldClassName}
                    onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                    required
                    value={form.fullName}
                  />
                </label>
                <label className="block text-xs font-black uppercase tracking-[0.14em] text-zinc-500">
                  Username
                  <input
                    className={fieldClassName}
                    onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                    required
                    value={form.username}
                  />
                </label>
                <label className="block text-xs font-black uppercase tracking-[0.14em] text-zinc-500">
                  Email
                  <input
                    className={fieldClassName}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    required
                    type="email"
                    value={form.email}
                  />
                </label>
                <label className="block text-xs font-black uppercase tracking-[0.14em] text-zinc-500">
                  Phone
                  <input
                    className={fieldClassName}
                    onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                    value={form.phone ?? ""}
                  />
                </label>
                <label className="block text-xs font-black uppercase tracking-[0.14em] text-zinc-500">
                  Country
                  <input
                    className={fieldClassName}
                    onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))}
                    value={form.country ?? ""}
                  />
                </label>
                <label className="block text-xs font-black uppercase tracking-[0.14em] text-zinc-500">
                  City
                  <input
                    className={fieldClassName}
                    onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
                    value={form.city}
                  />
                </label>
                <label className="block text-xs font-black uppercase tracking-[0.14em] text-zinc-500">
                  Gym
                  <input
                    className={fieldClassName}
                    onChange={(event) => setForm((current) => ({ ...current, gym: event.target.value }))}
                    value={form.gym}
                  />
                </label>
                <label className="block text-xs font-black uppercase tracking-[0.14em] text-zinc-500">
                  Account Type
                  <select
                    className={fieldClassName}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, accountType: event.target.value as AccountType }))
                    }
                    value={form.accountType}
                  >
                    {Object.entries(accountTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-xs font-black uppercase tracking-[0.14em] text-zinc-500">
                  Role
                  <select
                    className={fieldClassName}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, role: event.target.value as UserRole }))
                    }
                    value={form.role}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>
              </div>
              <label className="block text-xs font-black uppercase tracking-[0.14em] text-zinc-500">
                Bio
                <textarea
                  className={`${fieldClassName} min-h-24`}
                  onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
                  value={form.bio}
                />
              </label>
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  className="rounded-full bg-[#FF1010] px-5 py-2.5 text-xs font-black uppercase tracking-[0.16em] text-white disabled:opacity-60"
                  disabled={busy}
                  type="submit"
                >
                  Save Changes
                </button>
                <button
                  className="rounded-full border border-white/10 px-5 py-2.5 text-xs font-black uppercase tracking-[0.16em] text-zinc-300"
                  onClick={onClose}
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : null}

          {mode === "reset" ? (
            <form className="space-y-4" onSubmit={handleResetSubmit}>
              <p className="text-sm leading-7 text-zinc-400">
                Set a new password for this account. The member will need to use this password on their next sign-in.
              </p>
              <label className="block text-xs font-black uppercase tracking-[0.14em] text-zinc-500">
                New Password
                <input
                  className={fieldClassName}
                  minLength={8}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  type="password"
                  value={password}
                />
              </label>
              <label className="block text-xs font-black uppercase tracking-[0.14em] text-zinc-500">
                Confirm Password
                <input
                  className={fieldClassName}
                  minLength={8}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  type="password"
                  value={confirmPassword}
                />
              </label>
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  className="rounded-full bg-[#FF1010] px-5 py-2.5 text-xs font-black uppercase tracking-[0.16em] text-white disabled:opacity-60"
                  disabled={busy}
                  type="submit"
                >
                  Reset Password
                </button>
                <button
                  className="rounded-full border border-white/10 px-5 py-2.5 text-xs font-black uppercase tracking-[0.16em] text-zinc-300"
                  onClick={onClose}
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : null}

          {mode === "delete" ? (
            <div className="space-y-4">
              <p className="text-sm leading-7 text-zinc-400">
                This permanently removes the account, commerce profile, license applications, and assigned tags for{" "}
                <span className="text-white">{member.email}</span>. This action cannot be undone.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  className="rounded-full border border-red-500/40 bg-red-500/15 px-5 py-2.5 text-xs font-black uppercase tracking-[0.16em] text-red-200 disabled:opacity-60"
                  disabled={busy}
                  onClick={handleDeleteConfirm}
                  type="button"
                >
                  Delete Profile
                </button>
                <button
                  className="rounded-full border border-white/10 px-5 py-2.5 text-xs font-black uppercase tracking-[0.16em] text-zinc-300"
                  onClick={onClose}
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}

          {mode === "tags" ? (
            <AdminAccountTagEditor
              compact
              initialTags={member.tags}
              onChange={() => onSaved()}
              userId={member.userId}
            />
          ) : null}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
