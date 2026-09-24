"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import type { MembershipStatusDisplay } from "@/components/pro/MembershipStatus";
import type { ProMembershipRow } from "@/lib/supabase/types";

export function useProMembership() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [entitled, setEntitled] = useState(false);
  const [displayStatus, setDisplayStatus] = useState<MembershipStatusDisplay>("none");
  const [membership, setMembership] = useState<ProMembershipRow | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setEntitled(false);
      setDisplayStatus("none");
      setMembership(null);
      setLoading(false);
      return;
    }

    // Admins always pass client gates; server still enforces for non-admins.
    if (user.role === "admin") {
      setEntitled(true);
      setDisplayStatus("active");
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
        return;
      }
      const payload = (await response.json()) as {
        membership: ProMembershipRow | null;
        entitled: boolean;
        displayStatus: MembershipStatusDisplay;
      };
      setMembership(payload.membership);
      setEntitled(payload.entitled);
      setDisplayStatus(payload.displayStatus);
    } catch {
      setEntitled(false);
      setDisplayStatus("none");
      setMembership(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    void refresh();
  }, [authLoading, refresh]);

  return {
    loading: authLoading || loading,
    entitled,
    displayStatus,
    membership,
    refresh,
  };
}
