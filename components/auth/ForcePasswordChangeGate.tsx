"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";

export function ForcePasswordChangeGate() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user?.mustChangePassword) {
      return;
    }

    const allowed = pathname === "/login" || pathname.startsWith("/auth/");
    if (allowed) {
      return;
    }

    router.replace("/login?mode=change-password");
  }, [loading, pathname, router, user?.mustChangePassword]);

  return null;
}
