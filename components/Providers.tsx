"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth/context";
import { CartAddedToast } from "@/components/commerce/CartAddedToast";
import { CartDrawer } from "@/components/commerce/CartDrawer";
import { FloatingCartBar } from "@/components/commerce/FloatingCartBar";
import { UndoSnackbar } from "@/components/commerce/UndoSnackbar";
import { CommerceProvider } from "@/lib/commerce/context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CommerceProvider>
        {children}
        <CartAddedToast />
        <FloatingCartBar />
        <UndoSnackbar />
        <CartDrawer />
      </CommerceProvider>
    </AuthProvider>
  );
}
