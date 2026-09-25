"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MoreHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { MemberBadge } from "@/components/admin/MemberBadge";
import { AdminAccountTagEditor } from "@/components/profile/AdminAccountTagEditor";
import { ProCountdown } from "@/components/pro/ProCountdown";
import { userTypeTags, type UserTypeTagId } from "@/data/user-type-tags";
import {
  adminDeleteMemberAccount,
  adminResetMemberPassword,
  adminUpdateMemberProfile,
  type AdminMemberRecord,
} from "@/lib/admin/member-directory";
import {
  resolveAccountBadge,
  resolveCredentialBadges,
  resolveRoleBadges,
  resolveSystemAccessBadge,
} from "@/lib/admin/member-badges";
import {
  isPendingCredential,
  memberDisplayName,
  memberHasUnlimitedPlan,
  proStatusCaption,
} from "@/lib/admin/member-directory-filters";
import { adminFetch } from "@/lib/auth/admin-fetch";
import { accountTypeLabels, type AccountType, type AdminUserUpdateInput, type UserRole } from "@/lib/auth/types";
import { formatCurrency } from "@/lib/commerce/pricing";
import { formatProExpiryDate } from "@/lib/pro/timer";

export type MemberProfileMode = "view" | "edit" | "pro" | "tags";

const fieldClassName =
  "mt-1.5 w-full rounded-lg border border-white/[0.08] bg-zinc-950/80 px-3.5 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-white/20 focus:ring-2 focus:ring-white/10";

const labelClassName = "block text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-zinc-500";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-white/10 pt-5">
      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-zinc-500">{title}</p>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-zinc-600">{label}</p>
      <p className="mt-1 text-sm text-zinc-200">{value}</p>
    </div>
  );
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

function planBadgeLabel(member: AdminMemberRecord) {
  if (memberHasUnlimitedPlan(member)) return "Unlimited";
  if (!member.proResolved) return "Unknown";
  if (member.proEntitled) return "Pro";
  return "Free";
}

function TagList({ tags }: { tags: UserTypeTagId[] }) {
  if (tags.length === 0) {
    return <p className="text-sm text-zinc-500">—</p>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <MemberBadge
          key={tag}
          label={userTypeTags[tag]?.label ?? tag}
          fullLabel={userTypeTags[tag]?.label ?? tag}
          variant="role"
        />
      ))}
    </div>
  );
}

export function AdminMemberDetailDrawer({
  member,
  open,
  mode,
  onModeChange,
  onClose,
  onSaved,
  onReset,
  onDelete,
}: {
  member: AdminMemberRecord | null;
  open: boolean;
  mode: MemberProfileMode;
  onModeChange: (mode: MemberProfileMode) => void;
  onClose: () => void;
  onSaved: () => void;
  onReset: () => void;
  onDelete: () => void;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [proAction, setProAction] = useState<"grant" | "extend" | "cancel" | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement | null>(null);
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

  const syncKey = member ? `${member.userId}:${mode}:${member.fullName}:${member.email}` : null;
  const [lastSyncKey, setLastSyncKey] = useState<string | null>(null);

  if (syncKey && syncKey !== lastSyncKey) {
    setLastSyncKey(syncKey);
    setError("");
    setProAction(null);
    setMoreOpen(false);
    if (member) setForm(memberToForm(member));
  }

  useEffect(() => {
    if (!moreOpen) return;
    function handlePointer(event: MouseEvent) {
      if (moreRef.current?.contains(event.target as Node)) return;
      setMoreOpen(false);
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMoreOpen(false);
    }
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [moreOpen]);

  useEffect(() => {
    if (!open) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (moreOpen) {
        setMoreOpen(false);
        return;
      }
      if (mode !== "view") {
        onModeChange("view");
        return;
      }
      onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, mode, moreOpen, onClose, onModeChange]);

  const account = member ? resolveAccountBadge(member) : null;
  const access = member ? resolveSystemAccessBadge(member) : null;
  const roles = member ? resolveRoleBadges(member) : [];
  const credentials = member ? resolveCredentialBadges(member) : [];
  const expiry = member ? formatProExpiryDate(member.proExpiresAt) : null;
  const unlimited = member ? memberHasUnlimitedPlan(member) : false;

  const modeTitle: Record<MemberProfileMode, string> = {
    view: "Member",
    edit: "Edit member",
    pro: unlimited ? "Plan · Unlimited" : "Manage membership",
    tags: "Manage tags",
  };

  async function handleEditSubmit(event: FormEvent) {
    event.preventDefault();
    if (!member || busy) return;
    setBusy(true);
    setError("");
    try {
      await adminUpdateMemberProfile(member.userId, form);
      onSaved();
      onModeChange("view");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to update profile.");
    } finally {
      setBusy(false);
    }
  }

  async function handleProAction(action: "grant" | "extend" | "cancel") {
    if (!member || busy) return;
    setBusy(true);
    setProAction(action);
    setError("");
    try {
      const response = await adminFetch(`/api/admin/pro/${member.userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      let payload: { error?: string } = {};
      try {
        payload = (await response.json()) as { error?: string };
      } catch {
        // non-JSON
      }
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("Unable to update Pro membership. Admin authentication failed.");
        }
        throw new Error(payload.error || "Unable to update Pro membership.");
      }
      onSaved();
      onModeChange("view");
    } catch (proError) {
      setError(proError instanceof Error ? proError.message : "Unable to update Pro membership.");
    } finally {
      setBusy(false);
      setProAction(null);
    }
  }

  return (
    <AnimatePresence>
      {open && member && account && access ? (
        <>
          <motion.button
            animate={{ opacity: 1 }}
            aria-label="Close member profile"
            className="fixed inset-0 z-[100] bg-black/65 backdrop-blur-sm"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={() => {
              if (mode !== "view") onModeChange("view");
              else onClose();
            }}
            type="button"
          />
          <motion.aside
            animate={{ x: 0 }}
            aria-modal="true"
            className="fixed inset-y-0 right-0 z-[101] flex w-full max-w-[28rem] flex-col border-l border-white/10 bg-[#0a0a0a] shadow-2xl sm:max-w-[30rem]"
            exit={{ x: "100%" }}
            initial={{ x: "100%" }}
            role="dialog"
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
          >
            <div className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-5">
              <div className="min-w-0">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#FF1010]">
                  {modeTitle[mode]}
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">
                  {memberDisplayName(member)}
                </h2>
                <p className="mt-1.5 text-sm text-zinc-500">
                  @{member.username !== "—" ? member.username : "no-username"}
                </p>
                {mode === "view" ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <MemberBadge {...account} />
                    <MemberBadge label={planBadgeLabel(member)} variant="status" />
                  </div>
                ) : (
                  <p className="mt-1.5 truncate text-sm text-zinc-400">{member.email}</p>
                )}
              </div>
              <button
                aria-label="Close"
                className="rounded-lg border border-white/10 p-2 text-zinc-400 transition hover:text-white"
                onClick={() => {
                  if (mode !== "view") onModeChange("view");
                  else onClose();
                }}
                type="button"
              >
                <X size={16} aria-hidden />
              </button>
            </div>

            {error ? (
              <div className="mx-5 mt-4 rounded-lg border border-red-500/25 bg-red-500/[0.08] px-3.5 py-2.5 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            {mode === "view" ? (
              <>
                <div className="flex-1 space-y-1 overflow-y-auto px-5 py-5">
                  <Section title="Identity">
                    <Field label="Full name" value={memberDisplayName(member)} />
                    <Field
                      label="Username"
                      value={member.username !== "—" ? `@${member.username}` : "—"}
                    />
                    <Field label="Bio" value={member.bio} />
                  </Section>

                  <Section title="Contact">
                    <Field label="Email" value={member.email} />
                    <Field label="Phone" value={member.phone} />
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Country" value={member.country} />
                      <Field label="City" value={member.city} />
                    </div>
                    <Field label="Gym" value={member.gym} />
                  </Section>

                  <Section title="Account">
                    <div className="flex flex-wrap gap-1.5">
                      <MemberBadge {...account} />
                      <MemberBadge {...access} />
                    </div>
                  </Section>

                  <Section title="Membership">
                    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                      {unlimited ? (
                        <>
                          <p className="text-sm font-semibold text-white">Unlimited</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#FFCF6A]">
                            Staff / admin / owner access
                          </p>
                          <p className="mt-3 text-xs leading-relaxed text-zinc-400">
                            No Pro checkout required. License Center stays unlocked for this account.
                          </p>
                        </>
                      ) : !member.proResolved ? (
                        <>
                          <p className="text-sm font-semibold text-white">JuegoTodo Pro</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.12em] text-amber-200/90">
                            Unable to determine status
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-semibold text-white">
                            {member.proEntitled ? "JuegoTodo Pro" : "Free"}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-[0.12em] text-zinc-400">
                            {proStatusCaption(member.proStatus, member.proEntitled)}
                          </p>
                          {member.proMembershipId ? (
                            <p className="mt-2 font-mono text-xs text-zinc-500">{member.proMembershipId}</p>
                          ) : null}
                          {member.proExpiresAt ? (
                            <div className="mt-3">
                              <ProCountdown entitled={member.proEntitled} expiresAt={member.proExpiresAt} />
                            </div>
                          ) : expiry ? (
                            <p className="mt-2 text-xs text-zinc-500">Until {expiry}</p>
                          ) : null}
                        </>
                      )}
                      {!unlimited ? (
                        <button
                          className="mt-4 inline-flex min-h-9 items-center rounded-lg border border-[#FFCF6A]/35 px-3.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#FFCF6A] transition hover:bg-[#FFCF6A]/10"
                          onClick={() => onModeChange("pro")}
                          type="button"
                        >
                          Manage membership
                        </button>
                      ) : null}
                    </div>
                    <p className="text-xs text-zinc-500">
                      Shop tier: {member.membershipTier} (separate from JuegoTodo Pro / Unlimited)
                    </p>
                  </Section>

                  <Section title="Roles">
                    {roles.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {roles.map((role) => (
                          <MemberBadge
                            fullLabel={role.fullLabel}
                            key={role.id}
                            label={role.fullLabel}
                            variant={role.variant}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-500">None</p>
                    )}
                  </Section>

                  <Section title="Tags">
                    <TagList tags={member.tags} />
                    <button
                      className="inline-flex text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-zinc-400 transition hover:text-white"
                      onClick={() => onModeChange("tags")}
                      type="button"
                    >
                      Manage tags →
                    </button>
                  </Section>

                  <Section title="Credentials / Licenses">
                    {credentials.length > 0 ? (
                      <ul className="space-y-1.5">
                        {credentials.map((item) => (
                          <li className="flex items-center gap-2 text-sm text-zinc-200" key={item.id}>
                            <MemberBadge label={item.label} variant="credential" />
                            <span>{item.fullLabel}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-zinc-400">
                        {member.licenseStatus && isPendingCredential(member)
                          ? `Application: ${member.licenseStatus}`
                          : "No active credentials"}
                      </p>
                    )}
                    <Link
                      className="inline-flex text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#FF1010] hover:text-[#ff3a3a]"
                      href="/admin/license-approvals"
                    >
                      View license center →
                    </Link>
                  </Section>

                  <Section title="Activity">
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Joined" value={member.memberSince} />
                      <Field
                        label="Shop activity"
                        value={`${member.orders} orders · ${formatCurrency(member.lifetimeSpent)}`}
                      />
                    </div>
                  </Section>
                </div>

                <div className="flex items-center gap-2 border-t border-white/10 px-5 py-4">
                  <button
                    className="inline-flex min-h-10 flex-1 items-center justify-center rounded-lg bg-[#FF1010] px-4 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#ff2a2a]"
                    onClick={() => onModeChange("edit")}
                    type="button"
                  >
                    Edit member
                  </button>
                  <div className="relative" ref={moreRef}>
                    <button
                      aria-expanded={moreOpen}
                      aria-haspopup="menu"
                      aria-label="More actions"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/12 text-zinc-300 transition hover:border-white/25 hover:text-white"
                      onClick={() => setMoreOpen((current) => !current)}
                      type="button"
                    >
                      <MoreHorizontal size={16} aria-hidden />
                    </button>
                    {moreOpen ? (
                      <div
                        className="absolute bottom-full right-0 z-10 mb-2 w-44 overflow-hidden rounded-xl border border-white/10 bg-[#111] py-1 shadow-2xl"
                        role="menu"
                      >
                        <button
                          className="block w-full px-3 py-2 text-left text-xs text-zinc-300 transition hover:bg-white/5 hover:text-white"
                          onClick={() => {
                            setMoreOpen(false);
                            onReset();
                          }}
                          role="menuitem"
                          type="button"
                        >
                          Reset password
                        </button>
                        <div className="my-1 border-t border-white/10" />
                        <button
                          className="block w-full px-3 py-2 text-left text-xs text-red-300 transition hover:bg-red-500/10"
                          onClick={() => {
                            setMoreOpen(false);
                            onDelete();
                          }}
                          role="menuitem"
                          type="button"
                        >
                          Delete account
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </>
            ) : null}

            {mode === "edit" ? (
              <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleEditSubmit}>
                <div className="min-h-0 flex-1 space-y-8 overflow-y-auto px-5 py-5">
                  <FormSection description="Name and public identity on the platform." title="Identity">
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
                    <label className={labelClassName}>
                      Gym
                      <input
                        className={fieldClassName}
                        onChange={(event) => setForm((current) => ({ ...current, gym: event.target.value }))}
                        placeholder="Optional"
                        value={form.gym}
                      />
                    </label>
                  </FormSection>

                  <FormSection description="Account classification and system privileges." title="Access">
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
                  </FormSection>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2 border-t border-white/10 px-5 py-4">
                  <button
                    className="rounded-lg border border-white/10 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400 transition hover:border-white/20 hover:text-zinc-200"
                    onClick={() => onModeChange("view")}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    className="rounded-lg bg-[#FF1010] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#e60e0e] disabled:opacity-60"
                    disabled={busy}
                    type="submit"
                  >
                    {busy ? "Saving…" : "Save changes"}
                  </button>
                </div>
              </form>
            ) : null}

            {mode === "pro" ? (
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
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
                      {!member.proResolved ? (
                        <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.08] px-4 py-3 text-sm text-amber-50">
                          <p className="font-semibold">Unable to determine current Pro status.</p>
                          <p className="mt-1 text-amber-50/70">
                            You can still upgrade; refresh afterward to sync the directory.
                          </p>
                        </div>
                      ) : null}
                      <div className="rounded-xl border border-white/[0.08] bg-zinc-950/50 px-4 py-4">
                        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                          Current plan
                        </p>
                        <p className="mt-2 text-lg font-semibold text-white">
                          {!member.proResolved
                            ? "Unknown"
                            : member.proEntitled
                              ? "JuegoTodo Pro"
                              : "Free"}
                        </p>
                        <p className="mt-1 text-sm capitalize text-zinc-400">
                          {!member.proResolved
                            ? "Status unavailable"
                            : member.proEntitled
                              ? member.proStatus === "active"
                                ? "Active"
                                : member.proStatus === "cancelled"
                                  ? "Until expiry"
                                  : member.proStatus
                              : "No active Pro membership"}
                        </p>
                        {member.proMembershipId ? (
                          <p className="mt-2 font-mono text-xs text-zinc-500">{member.proMembershipId}</p>
                        ) : null}
                        {member.proExpiresAt ? (
                          <div className="mt-3">
                            <ProCountdown entitled={member.proEntitled} expiresAt={member.proExpiresAt} />
                          </div>
                        ) : null}
                      </div>
                      <div className="rounded-xl border border-white/10 px-4 py-4">
                        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#FFCF6A]">
                          JuegoTodo Pro
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                          Annual membership. Unlocks License Center access and Pro member benefits. Does not approve
                          licenses.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="rounded-lg bg-[#FFCF6A] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-black transition hover:bg-[#ffd98a] disabled:opacity-60"
                          disabled={busy}
                          onClick={() => void handleProAction("grant")}
                          type="button"
                        >
                          {proAction === "grant"
                            ? member.proEntitled
                              ? "Renewing..."
                              : "Upgrading..."
                            : member.proEntitled
                              ? "Renew +12 months"
                              : "Upgrade to Pro"}
                        </button>
                        <button
                          className="rounded-lg border border-white/12 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-200 transition hover:border-white/25 disabled:opacity-60"
                          disabled={busy || !member.proResolved || !member.proEntitled}
                          onClick={() => void handleProAction("extend")}
                          type="button"
                        >
                          {proAction === "extend" ? "Extending..." : "Extend membership"}
                        </button>
                        <button
                          className="rounded-lg border border-red-500/25 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-red-200 transition hover:bg-red-500/10 disabled:opacity-60"
                          disabled={
                            busy ||
                            !member.proResolved ||
                            member.proStatus === "none" ||
                            member.proStatus === "cancelled"
                          }
                          onClick={() => void handleProAction("cancel")}
                          type="button"
                        >
                          {proAction === "cancel" ? "Cancelling..." : "Cancel Pro"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex justify-end border-t border-white/10 px-5 py-4">
                  <button
                    className="rounded-lg border border-white/10 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400 transition hover:border-white/20 hover:text-zinc-200"
                    onClick={() => onModeChange("view")}
                    type="button"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : null}

            {mode === "tags" ? (
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
                  <p className="mb-4 text-sm leading-relaxed text-zinc-400">
                    Account tags classify organizational roles and team types. They are not licenses.
                  </p>
                  <AdminAccountTagEditor
                    compact
                    initialTags={member.tags}
                    onChange={() => onSaved()}
                    userId={member.userId}
                  />
                </div>
                <div className="flex justify-end border-t border-white/10 px-5 py-4">
                  <button
                    className="rounded-lg border border-white/10 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400 transition hover:border-white/20 hover:text-zinc-200"
                    onClick={() => onModeChange("view")}
                    type="button"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : null}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

/** Centered confirmation for reset password / delete — portal above the profile drawer. */
export function AdminMemberConfirmDialog({
  member,
  mode,
  onClose,
  onSaved,
  onDeleted,
}: {
  member: AdminMemberRecord | null;
  mode: "reset" | "delete" | null;
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const syncKey = member && mode ? `${member.userId}:${mode}` : null;
  const [lastSyncKey, setLastSyncKey] = useState<string | null>(null);

  if (syncKey && syncKey !== lastSyncKey) {
    setLastSyncKey(syncKey);
    setError("");
    setPassword("");
    setConfirmPassword("");
    setBusy(false);
  }

  useEffect(() => {
    if (!mode) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [mode, busy, onClose]);

  if (!member || !mode || typeof document === "undefined") {
    return null;
  }

  const displayName = memberDisplayName(member);

  async function handleResetSubmit(event: FormEvent) {
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
      onDeleted();
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to delete profile.");
    } finally {
      setBusy(false);
    }
  }

  return createPortal(
    <AnimatePresence>
      <motion.button
        animate={{ opacity: 1 }}
        aria-label="Close dialog"
        className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-[2px]"
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        onClick={() => {
          if (!busy) onClose();
        }}
        type="button"
      />
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        aria-modal="true"
        className="fixed left-1/2 top-1/2 z-[201] w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c0c] shadow-[0_24px_80px_rgba(0,0,0,0.65)]"
        exit={{ opacity: 0, y: 12 }}
        initial={{ opacity: 0, y: 12 }}
        role="dialog"
      >
        <header className="border-b border-white/[0.06] px-5 py-4">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-zinc-500">
            {mode === "delete" ? "Delete member" : "Reset password"}
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">{displayName}</h2>
          <p className="mt-1 truncate text-sm text-zinc-400">
            @{member.username !== "—" ? member.username : "no-username"}
            <span className="text-zinc-600"> · </span>
            {member.email}
          </p>
        </header>

        {error ? (
          <div className="mx-5 mt-4 rounded-lg border border-red-500/25 bg-red-500/[0.08] px-3.5 py-2.5 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {mode === "reset" ? (
          <form onSubmit={handleResetSubmit}>
            <div className="space-y-4 px-5 py-5">
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
            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-white/[0.06] px-5 py-4">
              <button
                className="rounded-lg border border-white/10 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400"
                onClick={onClose}
                type="button"
              >
                Cancel
              </button>
              <button
                className="rounded-lg bg-[#FF1010] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-white disabled:opacity-60"
                disabled={busy}
                type="submit"
              >
                {busy ? "Working…" : "Reset password"}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="space-y-4 px-5 py-5">
              <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3.5">
                <p className="text-sm font-medium text-red-100">This action cannot be undone</p>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
                  Permanently removes the member account and associated data according to the existing deletion
                  behavior for <span className="text-zinc-200">{member.email}</span>.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-white/[0.06] px-5 py-4">
              <button
                className="rounded-lg border border-white/10 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400"
                disabled={busy}
                onClick={onClose}
                type="button"
              >
                Cancel
              </button>
              <button
                className="rounded-lg border border-red-500/40 bg-red-500/15 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-red-200 transition hover:bg-red-500/25 disabled:opacity-60"
                disabled={busy}
                onClick={() => void handleDeleteConfirm()}
                type="button"
              >
                {busy ? "Working…" : "Delete member"}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
