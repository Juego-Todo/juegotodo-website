"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { UserTypeBadge } from "@/components/profile/UserTypeBadge";
import { ProCountdown } from "@/components/pro/ProCountdown";
import type { AdminMemberRecord } from "@/lib/admin/member-directory";
import {
  credentialLabels,
  isStaffAccount,
  memberDisplayName,
  orgRoleTags,
  proStatusCaption,
} from "@/lib/admin/member-directory-filters";
import { accountTypeLabels } from "@/lib/auth/types";
import { formatCurrency } from "@/lib/commerce/pricing";
import { formatProExpiryDate } from "@/lib/pro/timer";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-white/10 pt-5">
      <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-zinc-500">{title}</p>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.58rem] font-black uppercase tracking-[0.14em] text-zinc-600">{label}</p>
      <p className="mt-1 text-sm text-zinc-200">{value}</p>
    </div>
  );
}

export function AdminMemberDetailDrawer({
  member,
  open,
  onClose,
  onEdit,
  onManagePro,
  onReset,
  onDelete,
}: {
  member: AdminMemberRecord | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onManagePro: () => void;
  onReset: () => void;
  onDelete: () => void;
}) {
  const roles = member ? orgRoleTags(member) : [];
  const credentials = member ? credentialLabels(member) : [];
  const expiry = member ? formatProExpiryDate(member.proExpiresAt) : null;

  return (
    <AnimatePresence>
      {open && member ? (
        <>
          <motion.button
            animate={{ opacity: 1 }}
            aria-label="Close member details"
            className="fixed inset-0 z-[85] bg-black/65 backdrop-blur-sm"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={onClose}
            type="button"
          />
          <motion.aside
            animate={{ x: 0 }}
            className="fixed inset-y-0 right-0 z-[86] flex w-full max-w-md flex-col border-l border-white/10 bg-[#0a0a0a] shadow-2xl"
            exit={{ x: "100%" }}
            initial={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
          >
            <div className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-5">
              <div className="min-w-0">
                <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-[#FF1010]">Member</p>
                <h2 className="font-display mt-1 text-3xl uppercase leading-none text-white">
                  {memberDisplayName(member)}
                </h2>
                <p className="mt-2 text-sm text-zinc-500">
                  @{member.username !== "—" ? member.username : "no-username"}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="rounded-md border border-white/15 bg-white/5 px-2 py-0.5 text-[0.55rem] font-black uppercase tracking-[0.12em] text-zinc-300">
                    {accountTypeLabels[member.accountType]}
                  </span>
                  {member.role === "admin" ? (
                    <span className="rounded-md border border-white/30 bg-white/10 px-2 py-0.5 text-[0.55rem] font-black uppercase tracking-[0.12em] text-white">
                      Admin
                    </span>
                  ) : null}
                  <span
                    className={`rounded-md border px-2 py-0.5 text-[0.55rem] font-black uppercase tracking-[0.12em] ${
                      member.proEntitled
                        ? "border-emerald-400/35 bg-emerald-400/10 text-emerald-200"
                        : "border-white/10 bg-white/[0.04] text-zinc-400"
                    }`}
                  >
                    {member.proEntitled ? "Pro Member" : "Free"}
                  </span>
                </div>
              </div>
              <button
                className="rounded-full border border-white/10 p-2 text-zinc-400 transition hover:text-white"
                onClick={onClose}
                type="button"
              >
                <X size={16} aria-hidden />
              </button>
            </div>

            <div className="flex-1 space-y-1 overflow-y-auto px-5 py-5">
              <Section title="Account">
                <Field label="Email" value={member.email} />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Account type" value={accountTypeLabels[member.accountType]} />
                  <Field label="System access" value={member.role === "admin" ? "Admin" : "User"} />
                  <Field label="City" value={member.city} />
                  <Field label="Gym" value={member.gym} />
                </div>
                <Field label="Member since" value={member.memberSince} />
              </Section>

              <Section title="Membership">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="text-sm font-semibold text-white">JuegoTodo Pro</p>
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
                  <button
                    className="mt-4 inline-flex min-h-10 items-center rounded-full border border-[#FFCF6A]/35 px-4 text-[0.62rem] font-black uppercase tracking-[0.14em] text-[#FFCF6A] transition hover:bg-[#FFCF6A]/10"
                    onClick={onManagePro}
                    type="button"
                  >
                    Manage membership
                  </button>
                </div>
                <p className="text-xs text-zinc-500">
                  Shop tier: {member.membershipTier} (separate from JuegoTodo Pro)
                </p>
              </Section>

              <Section title="Credentials">
                {credentials.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {credentials.map((label) => (
                      <span
                        className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[0.65rem] font-semibold text-zinc-200"
                        key={label}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-400">
                    {member.licenseStatus
                      ? `Application: ${member.licenseStatus}`
                      : "No active credentials"}
                  </p>
                )}
                <Link
                  className="inline-flex text-[0.65rem] font-black uppercase tracking-[0.14em] text-[#FF1010] hover:text-[#ff3a3a]"
                  href="/admin/license-approvals"
                >
                  View license center →
                </Link>
              </Section>

              <Section title="Roles">
                <div className="flex flex-wrap gap-1.5">
                  {isStaffAccount(member) ? (
                    <span className="rounded-md border border-white/15 bg-white/5 px-2 py-1 text-[0.65rem] font-black uppercase tracking-[0.12em] text-zinc-200">
                      Staff
                    </span>
                  ) : (
                    <span className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[0.65rem] font-black uppercase tracking-[0.12em] text-zinc-400">
                      Fan
                    </span>
                  )}
                  {roles.map((tagId) => (
                    <UserTypeBadge key={tagId} tagId={tagId} />
                  ))}
                </div>
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

            <div className="space-y-2 border-t border-white/10 px-5 py-4">
              <button
                className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#FF1010] px-4 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#ff2a2a]"
                onClick={onEdit}
                type="button"
              >
                Edit member
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/15 px-3 text-[0.62rem] font-black uppercase tracking-[0.12em] text-zinc-300"
                  onClick={onReset}
                  type="button"
                >
                  Reset password
                </button>
                <button
                  className="inline-flex min-h-10 items-center justify-center rounded-full border border-red-500/30 px-3 text-[0.62rem] font-black uppercase tracking-[0.12em] text-red-200"
                  onClick={onDelete}
                  type="button"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
