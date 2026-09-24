"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { MemberBadge } from "@/components/admin/MemberBadge";
import { ProCountdown } from "@/components/pro/ProCountdown";
import type { AdminMemberRecord } from "@/lib/admin/member-directory";
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
import { formatCurrency } from "@/lib/commerce/pricing";
import { formatProExpiryDate } from "@/lib/pro/timer";

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
  const account = member ? resolveAccountBadge(member) : null;
  const access = member ? resolveSystemAccessBadge(member) : null;
  const roles = member ? resolveRoleBadges(member) : [];
  const credentials = member ? resolveCredentialBadges(member) : [];
  const expiry = member ? formatProExpiryDate(member.proExpiresAt) : null;

  return (
    <AnimatePresence>
      {open && member && account && access ? (
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
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#FF1010]">Member</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">
                  {memberDisplayName(member)}
                </h2>
                <p className="mt-1.5 text-sm text-zinc-500">
                  @{member.username !== "—" ? member.username : "no-username"}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <MemberBadge {...account} />
                  {access.variant === "permission" ? <MemberBadge {...access} /> : null}
                  <MemberBadge
                    label={
                      memberHasUnlimitedPlan(member)
                        ? "Unlimited"
                        : member.proEntitled
                          ? "Pro"
                          : "Free"
                    }
                    variant="status"
                  />
                </div>
              </div>
              <button
                className="rounded-lg border border-white/10 p-2 text-zinc-400 transition hover:text-white"
                onClick={onClose}
                type="button"
              >
                <X size={16} aria-hidden />
              </button>
            </div>

            <div className="flex-1 space-y-1 overflow-y-auto px-5 py-5">
              <Section title="Account">
                <div className="flex flex-wrap gap-1.5">
                  <MemberBadge {...account} />
                </div>
                <Field label="Email" value={member.email} />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="City" value={member.city} />
                  <Field label="Gym" value={member.gym} />
                </div>
                <Field label="Member since" value={member.memberSince} />
              </Section>

              <Section title="System access">
                <MemberBadge {...access} />
              </Section>

              <Section title="Membership">
                <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                  {memberHasUnlimitedPlan(member) ? (
                    <>
                      <p className="text-sm font-semibold text-white">Unlimited</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#FFCF6A]">
                        Staff / admin / owner access
                      </p>
                      <p className="mt-3 text-xs leading-relaxed text-zinc-400">
                        No Pro checkout required. License Center stays unlocked for this account.
                      </p>
                    </>
                  ) : (
                    <>
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
                        className="mt-4 inline-flex min-h-9 items-center rounded-lg border border-[#FFCF6A]/35 px-3.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#FFCF6A] transition hover:bg-[#FFCF6A]/10"
                        onClick={onManagePro}
                        type="button"
                      >
                        Manage membership
                      </button>
                    </>
                  )}
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

              <Section title="Credentials">
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

            <div className="space-y-2 border-t border-white/10 px-5 py-4">
              <button
                className="inline-flex min-h-10 w-full items-center justify-center rounded-lg bg-[#FF1010] px-4 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#ff2a2a]"
                onClick={onEdit}
                type="button"
              >
                Edit member
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className="inline-flex min-h-9 items-center justify-center rounded-lg border border-white/12 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-zinc-300"
                  onClick={onReset}
                  type="button"
                >
                  Reset password
                </button>
                <button
                  className="inline-flex min-h-9 items-center justify-center rounded-lg border border-red-500/30 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-red-200"
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
