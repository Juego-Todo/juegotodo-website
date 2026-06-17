"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth/context";
import { CommerceProvider } from "@/lib/commerce/context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CommerceProvider>{children}</CommerceProvider>
    </AuthProvider>
  );
}
