"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { AdminAccountTagEditor } from "@/components/profile/AdminAccountTagEditor";
import { accountTypeLabels, type AccountType, type AdminUserUpdateInput, type UserRole } from "@/lib/auth/types";
import {
  adminDeleteMemberAccount,
  adminResetMemberPassword,
  adminUpdateMemberProfile,
  type AdminMemberRecord,
} from "@/lib/admin/member-directory";
import { memberHasUnlimitedPlan, proStatusCaption } from "@/lib/admin/member-directory-filters";
import { ProCountdown } from "@/components/pro/ProCountdown";

type ManageMode = "edit" | "reset" | "delete" | "tags" | "pro";

const fieldClassName =
  "mt-1.5 w-full rounded-lg border border-white/[0.08] bg-zinc-950/80 px-3.5 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-white/20 focus:ring-2 focus:ring-white/10";

const labelClassName = "block text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-zinc-500";

function memberToForm(member: AdminMemberRecord): AdminUserUpdateInput {
  return {
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
  };
}

function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <div className="border-b border-white/[0.06] pb-2">
        <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
        {description ? <p className="mt-0.5 text-xs text-zinc-500">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function FooterActions({
  primaryLabel,
  primaryType = "button",
  primaryDanger,
  busy,
  onCancel,
  onPrimary,
}: {
  primaryLabel: string;
  primaryType?: "button" | "submit";
  primaryDanger?: boolean;
  busy: boolean;
  onCancel: () => void;
  onPrimary?: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2 border-t border-white/[0.06] bg-zinc-950/40 px-5 py-4 sm:px-6">
      <button
        className="rounded-lg border border-white/10 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400 transition hover:border-white/20 hover:text-zinc-200"
        onClick={onCancel}
        type="button"
      >
        Cancel
      </button>
      <button
        className={
          primaryDanger
            ? "rounded-lg border border-red-500/40 bg-red-500/15 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-red-200 transition hover:bg-red-500/25 disabled:opacity-60"
            : "rounded-lg bg-[#FF1010] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#e60e0e] disabled:opacity-60"
        }
        disabled={busy}
        onClick={onPrimary}
        type={primaryType}
      >
        {busy ? "Working…" : primaryLabel}
      </button>
    </div>
  );
}

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
  const [form, setForm] = useState<AdminUserUpdateInput>(() =>
    member
      ? memberToForm(member)
      : {
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
        },
  );

  const memberSyncKey = member && mode ? `${member.userId}:${mode}` : null;
  const [lastMemberSyncKey, setLastMemberSyncKey] = useState<string | null>(null);

  if (memberSyncKey && memberSyncKey !== lastMemberSyncKey) {
    setLastMemberSyncKey(memberSyncKey);
    setError("");
    setPassword("");
    setConfirmPassword("");
    setForm(memberToForm(member!));
  }

  if (!member || !mode) {
    return null;
  }

  const unlimited = memberHasUnlimitedPlan(member);
  const displayName = [member.firstName, member.lastName].filter(Boolean).join(" ") || member.fullName;

  const titles: Record<ManageMode, string> = {
    edit: "Edit member",
    reset: "Reset password",
    delete: "Delete member",
    tags: "Manage tags",
    pro: unlimited ? "Plan · Unlimited" : "Manage Pro",
  };

  const proExpiryLabel = member.proExpiresAt
    ? new Date(member.proExpiresAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

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

  async function handleProAction(action: "grant" | "extend" | "cancel") {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/pro/${member!.userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Unable to update Pro membership.");
      }
      onSaved();
      if (mode === "pro") {
        onClose();
      }
    } catch (proError) {
      setError(proError instanceof Error ? proError.message : "Unable to update Pro membership.");
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
        aria-label="Close dialog"
        className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-[2px]"
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        onClick={onClose}
        type="button"
      />
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        aria-modal="true"
        className="fixed inset-x-3 top-[5vh] z-[71] mx-auto flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c0c] shadow-[0_24px_80px_rgba(0,0,0,0.65)] sm:inset-x-auto"
        exit={{ opacity: 0, y: 12 }}
        initial={{ opacity: 0, y: 12 }}
        role="dialog"
      >
        <header className="shrink-0 border-b border-white/[0.06] px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                Member directory
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">{titles[mode]}</h2>
              <p className="mt-1 truncate text-sm text-zinc-400">
                {displayName}
                <span className="text-zinc-600"> · </span>
                {member.email}
              </p>
            </div>
            <button
              aria-label="Close"
              className="shrink-0 rounded-lg border border-white/10 p-2 text-zinc-500 transition hover:border-white/20 hover:text-white"
              onClick={onClose}
              type="button"
            >
              <X size={16} />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {error ? (
            <div className="mx-5 mt-4 rounded-lg border border-red-500/25 bg-red-500/[0.08] px-3.5 py-2.5 text-sm text-red-200 sm:mx-6">
              {error}
            </div>
          ) : null}

          {mode === "edit" ? (
            <form className="flex flex-col" id="admin-member-edit-form" onSubmit={handleEditSubmit}>
              <div className="space-y-8 px-5 py-5 sm:px-6">
                <FormSection description="Name and public identity on the platform." title="Identity">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className={labelClassName}>
                      Full name
                      <input
                        className={fieldClassName}
                        onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                        required
                        value={form.fullName}
                      />
                    </label>
                    <label className={labelClassName}>
                      Username
                      <input
                        className={fieldClassName}
                        onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                        required
                        value={form.username}
                      />
                    </label>
                  </div>
                  <label className={labelClassName}>
                    Bio
                    <textarea
                      className={`${fieldClassName} min-h-[5.5rem] resize-y`}
                      onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
                      placeholder="Optional"
                      value={form.bio}
                    />
                  </label>
                </FormSection>

                <FormSection description="How admins and the member can be reached." title="Contact & location">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className={labelClassName}>
                      Email
                      <input
                        className={fieldClassName}
                        onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                        required
                        type="email"
                        value={form.email}
                      />
                    </label>
                    <label className={labelClassName}>
                      Phone
                      <input
                        className={fieldClassName}
                        onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                        placeholder="Optional"
                        value={form.phone ?? ""}
                      />
                    </label>
                    <label className={labelClassName}>
                      Country
                      <input
                        className={fieldClassName}
                        onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))}
                        value={form.country ?? ""}
                      />
                    </label>
                    <label className={labelClassName}>
                      City
                      <input
                        className={fieldClassName}
                        onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
                        value={form.city}
                      />
                    </label>
                    <label className={`sm:col-span-2 ${labelClassName}`}>
                      Gym
                      <input
                        className={fieldClassName}
                        onChange={(event) => setForm((current) => ({ ...current, gym: event.target.value }))}
                        placeholder="Optional"
                        value={form.gym}
                      />
                    </label>
                  </div>
                </FormSection>

                <FormSection description="Account classification and system privileges." title="Access">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className={labelClassName}>
                      Account type
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
                    <label className={labelClassName}>
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
                </FormSection>

                <div className="rounded-xl border border-white/[0.08] bg-zinc-950/50 px-4 py-3.5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-zinc-500">Plan</p>
                      <p className="mt-1 text-sm font-medium text-white">
                        {unlimited
                          ? "Unlimited"
                          : member.proEntitled
                            ? `Pro · ${proStatusCaption(member.proStatus, member.proEntitled)}`
                            : "Free"}
                      </p>
                      <p className="mt-1 max-w-sm text-xs leading-relaxed text-zinc-500">
                        {unlimited
                          ? "Staff, admin, and owner accounts include Unlimited access."
                          : proExpiryLabel
                            ? `${member.proEntitled ? "Expires" : "Ended"} ${proExpiryLabel}. Manage from the Plan action.`
                            : "Use Manage Plan from the member row to grant or adjust Pro."}
                      </p>
                    </div>
                    <span
                      className={
                        unlimited
                          ? "rounded-md border border-[#FFCF6A]/30 bg-[#FFCF6A]/10 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-[#FFCF6A]"
                          : member.proEntitled
                            ? "rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-emerald-300"
                            : "rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-zinc-400"
                      }
                    >
                      {unlimited ? "Unlimited" : member.proEntitled ? "Pro" : "Free"}
                    </span>
                  </div>
                </div>
              </div>

              <FooterActions busy={busy} onCancel={onClose} primaryLabel="Save changes" primaryType="submit" />
            </form>
          ) : null}

          {mode === "reset" ? (
            <form className="flex flex-col" onSubmit={handleResetSubmit}>
              <div className="space-y-5 px-5 py-5 sm:px-6">
                <p className="text-sm leading-relaxed text-zinc-400">
                  Set a temporary password for this account. The member will use it on their next sign-in.
                </p>
                <label className={labelClassName}>
                  New password
                  <input
                    className={fieldClassName}
                    minLength={8}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    type="password"
                    value={password}
                  />
                </label>
                <label className={labelClassName}>
                  Confirm password
                  <input
                    className={fieldClassName}
                    minLength={8}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                    type="password"
                    value={confirmPassword}
                  />
                </label>
              </div>
              <FooterActions busy={busy} onCancel={onClose} primaryLabel="Reset password" primaryType="submit" />
            </form>
          ) : null}

          {mode === "delete" ? (
            <div className="flex flex-col">
              <div className="space-y-4 px-5 py-5 sm:px-6">
                <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3.5">
                  <p className="text-sm font-medium text-red-100">This cannot be undone</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
                    Permanently removes the account, commerce profile, license applications, and tags for{" "}
                    <span className="text-zinc-200">{member.email}</span>.
                  </p>
                </div>
              </div>
              <FooterActions
                busy={busy}
                onCancel={onClose}
                onPrimary={() => void handleDeleteConfirm()}
                primaryDanger
                primaryLabel="Delete member"
              />
            </div>
          ) : null}

          {mode === "pro" ? (
            <div className="flex flex-col">
              <div className="space-y-5 px-5 py-5 sm:px-6">
                {unlimited ? (
                  <div className="rounded-xl border border-[#FFCF6A]/20 bg-[#FFCF6A]/[0.06] px-4 py-4">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#FFCF6A]">
                      Current plan
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">Unlimited</p>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                      Staff, admin, and owner accounts already have Unlimited access. License Center stays unlocked
                      without a Pro membership.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="rounded-xl border border-white/[0.08] bg-zinc-950/50 px-4 py-4">
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                        Current status
                      </p>
                      <p className="mt-2 text-lg font-semibold capitalize text-white">
                        {member.proEntitled
                          ? member.proStatus === "active"
                            ? "Active"
                            : member.proStatus
                          : member.proStatus === "none"
                            ? "Inactive"
                            : member.proStatus}
                      </p>
                      {member.proMembershipId ? (
                        <p className="mt-1 font-mono text-xs text-zinc-500">{member.proMembershipId}</p>
                      ) : (
                        <p className="mt-1 text-sm text-zinc-500">No Pro membership yet</p>
                      )}
                      {member.proExpiresAt ? (
                        <div className="mt-3">
                          <ProCountdown entitled={member.proEntitled} expiresAt={member.proExpiresAt} />
                        </div>
                      ) : null}
                      {member.proPaymentStatus ? (
                        <p className="mt-2 text-xs uppercase tracking-[0.1em] text-zinc-500">
                          Payment: {member.proPaymentStatus}
                        </p>
                      ) : null}
                    </div>
                    <p className="text-sm leading-relaxed text-zinc-400">
                      Comp annual Pro access for this member. Unlocks License Center only — does not approve
                      licenses.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="rounded-lg bg-[#FFCF6A] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-black transition hover:bg-[#ffd98a] disabled:opacity-60"
                        disabled={busy}
                        onClick={() => void handleProAction("grant")}
                        type="button"
                      >
                        {member.proEntitled ? "Renew +12 months" : "Upgrade to Pro"}
                      </button>
                      <button
                        className="rounded-lg border border-white/12 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-200 transition hover:border-white/25 disabled:opacity-60"
                        disabled={busy || !member.proEntitled}
                        onClick={() => void handleProAction("extend")}
                        type="button"
                      >
                        Extend from expiry
                      </button>
                      <button
                        className="rounded-lg border border-red-500/25 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-red-200 transition hover:bg-red-500/10 disabled:opacity-60"
                        disabled={busy || member.proStatus === "none" || member.proStatus === "cancelled"}
                        onClick={() => void handleProAction("cancel")}
                        type="button"
                      >
                        Cancel Pro
                      </button>
                    </div>
                  </>
                )}
              </div>
              <div className="flex justify-end border-t border-white/[0.06] px-5 py-4 sm:px-6">
                <button
                  className="rounded-lg border border-white/10 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400 transition hover:border-white/20 hover:text-zinc-200"
                  onClick={onClose}
                  type="button"
                >
                  Close
                </button>
              </div>
            </div>
          ) : null}

          {mode === "tags" ? (
            <div className="px-5 py-5 sm:px-6">
              <AdminAccountTagEditor
                compact
                initialTags={member.tags}
                onChange={() => onSaved()}
                userId={member.userId}
              />
            </div>
          ) : null}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
