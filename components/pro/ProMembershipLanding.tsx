"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, Lock, Sparkles } from "lucide-react";
import { MotionSection } from "@/components/MotionSection";
import { MembershipStatus, type MembershipStatusDisplay } from "@/components/pro/MembershipStatus";
import { ProBadge } from "@/components/pro/ProBadge";
import {
  PRO_ANNUAL_PRICE_PHP,
  PRO_BENEFITS,
  PRO_DURATION_MONTHS,
  PRO_PRODUCT_NAME,
} from "@/data/pro-membership";
import { useAuth } from "@/lib/auth/context";
import type { ProMembershipRow } from "@/lib/supabase/types";

type StatusResponse = {
  membership: ProMembershipRow | null;
  entitled: boolean;
  displayStatus: MembershipStatusDisplay;
  error?: string;
};

export function ProMembershipLanding() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const paid = searchParams.get("paid") === "1";
  const cancelled = searchParams.get("cancelled") === "1";

  const [statusLoading, setStatusLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayStatus, setDisplayStatus] = useState<MembershipStatusDisplay>("none");
  const [membership, setMembership] = useState<ProMembershipRow | null>(null);
  const [entitled, setEntitled] = useState(false);

  const loadStatus = useCallback(async () => {
    if (!user) {
      setStatusLoading(false);
      setDisplayStatus("none");
      setMembership(null);
      setEntitled(false);
      return;
    }

    setStatusLoading(true);
    try {
      const response = await fetch("/api/pro/status", { cache: "no-store" });
      const payload = (await response.json()) as StatusResponse;
      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to load Pro status.");
      }
      setMembership(payload.membership);
      setEntitled(payload.entitled);
      setDisplayStatus(payload.displayStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load Pro status.");
    } finally {
      setStatusLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    if (!paid || !user) return;
    const timer = window.setTimeout(() => {
      void loadStatus();
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [paid, user, loadStatus]);

  async function startCheckout() {
    if (!user) {
      window.location.href = `/login?next=${encodeURIComponent("/pro")}`;
      return;
    }

    setCheckoutLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/pro/checkout", { method: "POST" });
      const payload = (await response.json()) as {
        checkoutUrl?: string;
        error?: string;
        redirectTo?: string;
      };
      if (!response.ok || !payload.checkoutUrl) {
        throw new Error(payload.error ?? "Unable to start checkout.");
      }
      window.location.href = payload.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start checkout.");
      setCheckoutLoading(false);
    }
  }

  const priceLabel = `₱${PRO_ANNUAL_PRICE_PHP.toLocaleString("en-PH")}`;

  return (
    <main className="overflow-hidden px-4 pb-20 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
      <section className="relative mx-auto max-w-5xl">
        <MotionSection>
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#1a0a0a] via-[#0d0d0d] to-[#0a0a12] px-6 py-10 sm:px-10 sm:py-14">
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#FFCF6A]/10 blur-3xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-[#FF1010]/15 blur-3xl"
              aria-hidden
            />

            <ProBadge label="ANNUAL MEMBERSHIP" />
            <h1 className="font-display mt-4 text-5xl uppercase leading-none text-white sm:text-7xl">
              {PRO_PRODUCT_NAME}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base">
              Unlock the License Center and apply for fighter, coach, official, and council credentials.
              Separate from JT1 Local Membership.
            </p>

            <div className="mt-8 flex flex-wrap items-end gap-4">
              <p className="font-display text-4xl text-[#FFCF6A] sm:text-5xl">{priceLabel}</p>
              <p className="pb-1 text-xs uppercase tracking-[0.16em] text-zinc-500">
                / {PRO_DURATION_MONTHS} months
              </p>
            </div>

            {paid ? (
              <p className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                Payment received. Activating your Pro membership…
              </p>
            ) : null}
            {cancelled ? (
              <p className="mt-4 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-zinc-300">
                Checkout was cancelled. You can try again anytime.
              </p>
            ) : null}
            {error ? (
              <p className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                {error}
              </p>
            ) : null}

            <div className="mt-8 flex flex-wrap gap-3">
              {entitled ? (
                <Link
                  href="/register-for-license"
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#FF1010] px-7 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#ff2a2a]"
                >
                  Open License Center
                </Link>
              ) : (
                <button
                  type="button"
                  disabled={checkoutLoading || authLoading || statusLoading}
                  onClick={() => void startCheckout()}
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#FF1010] px-7 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#ff2a2a] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {checkoutLoading ? "Starting checkout…" : "Become a Pro Member"}
                </button>
              )}
              <Link
                href="/membership"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 px-6 text-xs font-black uppercase tracking-[0.16em] text-zinc-300 transition hover:border-white/30"
              >
                JT1 Local Membership
              </Link>
            </div>
          </div>
        </MotionSection>

        {user ? (
          <div className="mt-8">
            {statusLoading ? (
              <p className="text-sm text-zinc-500">Loading membership status…</p>
            ) : (
              <MembershipStatus
                status={displayStatus}
                membershipId={membership?.membership_id}
                expiresAt={membership?.expires_at}
              />
            )}
          </div>
        ) : null}

        <MotionSection className="mt-12">
          <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-[#FF1010]">Benefits</p>
          <h2 className="font-display mt-2 text-3xl uppercase text-white sm:text-4xl">What Pro unlocks</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {PRO_BENEFITS.map((benefit) => (
              <article
                key={benefit.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#FFCF6A]/25 bg-[#FFCF6A]/10 text-[#FFCF6A]">
                  <Sparkles size={16} aria-hidden />
                </span>
                <h3 className="mt-4 text-sm font-bold uppercase tracking-[0.12em] text-white">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{benefit.description}</p>
              </article>
            ))}
          </div>
        </MotionSection>

        <MotionSection className="mt-12">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <Lock className="mt-0.5 shrink-0 text-zinc-500" size={18} aria-hidden />
              <div>
                <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-white">
                  Separate from JT1 Local Membership
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  JT1 Local Membership is your member ID card via the Membership Portal. JuegoTodo Pro is the
                  annual entitlement that unlocks role license applications. Pro never auto-approves a license.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-zinc-400">
                  <li className="flex gap-2">
                    <Check className="mt-0.5 shrink-0 text-emerald-400" size={14} aria-hidden />
                    Active Pro required for License Center submissions
                  </li>
                  <li className="flex gap-2">
                    <Check className="mt-0.5 shrink-0 text-emerald-400" size={14} aria-hidden />
                    Individual licenses still reviewed by administrators
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </MotionSection>
      </section>
    </main>
  );
}
