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

  const refresh = useCallback(async () => {
    if (!user) {
      setEntitled(false);
      setDisplayStatus("none");
      setMembership(null);
      setPlan("free");
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
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/pro/status", { cache: "no-store" });
      if (!response.ok) {
        setEntitled(false);
        setDisplayStatus("none");
        setMembership(null);
        setPlan("free");
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
    } catch {
      setEntitled(false);
      setDisplayStatus("none");
      setMembership(null);
      setPlan("free");
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
    refresh,
  };
}
