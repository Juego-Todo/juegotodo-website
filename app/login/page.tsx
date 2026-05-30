import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthPage } from "@/components/AuthPage";

export const metadata: Metadata = {
  title: "Register And Sign In",
  description: "Create your Juego Todo account or sign in to access your profile.",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[60vh] items-center justify-center px-4 pt-24">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-zinc-400">
            Loading...
          </p>
        </main>
      }
    >
      <AuthPage />
    </Suspense>
  );
}
