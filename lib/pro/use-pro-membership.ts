"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import type { MembershipStatusDisplay } from "@/components/pro/MembershipStatus";
import type { ProMembershipRow } from "@/lib/supabase/types";

import { hasUnlimitedPlan } from "@/lib/pro/plan";

export function useProMembership() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [entitled, setEntitled] = useState(false);
  const [displayStatus, setDisplayStatus] = useState<MembershipStatusDisplay>("none");
  const [membership, setMembership] = useState<ProMembershipRow | null>(null);
  const [plan, setPlan] = useState<"unlimited" | "pro" | "free">("free");
  const [resolved, setResolved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setEntitled(false);
      setDisplayStatus("none");
      setMembership(null);
      setPlan("free");
      setResolved(true);
      setError(null);
      setLoading(false);
      return;
    }

    if (
      hasUnlimitedPlan({
        email: user.email,
        role: user.role,
        assignedTags: user.assignedTags,
      })
    ) {
      setEntitled(true);
      setDisplayStatus("active");
      setMembership(null);
      setPlan("unlimited");
      setResolved(true);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/pro/status", { cache: "no-store" });
      if (!response.ok) {
        setEntitled(false);
        setDisplayStatus("none");
        setMembership(null);
        setPlan("free");
        setResolved(false);
        setError("Unable to verify Pro membership.");
        return;
      }
      const payload = (await response.json()) as {
        membership: ProMembershipRow | null;
        entitled: boolean;
        displayStatus: MembershipStatusDisplay;
        plan?: "unlimited" | "pro" | "free";
      };
      setMembership(payload.membership);
      setEntitled(payload.entitled);
      setDisplayStatus(payload.displayStatus);
      setPlan(payload.plan ?? (payload.entitled ? "pro" : "free"));
      setResolved(true);
      setError(null);
    } catch {
      setEntitled(false);
      setDisplayStatus("none");
      setMembership(null);
      setPlan("free");
      setResolved(false);
      setError("Unable to verify Pro membership.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [authLoading, refresh]);

  return {
    loading: authLoading || loading,
    entitled,
    displayStatus,
    membership,
    plan,
    /** False when Pro status could not be verified (API failure). Never treat as Free. */
    resolved,
    error,
    refresh,
  };
}
