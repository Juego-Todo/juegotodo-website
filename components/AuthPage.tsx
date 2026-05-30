"use client";

import { motion } from "framer-motion";
import { ArrowRight, Lock, ShieldCheck, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { MotionSection } from "@/components/MotionSection";
import { useAuth } from "@/lib/auth/context";
import { accountTypeLabels, type AccountType } from "@/lib/auth/types";

type AuthMode = "login" | "register";

const accountTypes = Object.keys(accountTypeLabels) as AccountType[];

export function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/profile";
  const { login, register } = useAuth();

  const [mode, setMode] = useState<AuthMode>("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("fan");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (mode === "register") {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }

        await register({ fullName, email, password, accountType });
      } else {
        await login(email, password);
      }

      router.push(nextPath);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="overflow-hidden px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
      <section className="relative mx-auto max-w-6xl py-10 sm:py-14">
        <div className="cinematic-grid absolute inset-0 opacity-30" aria-hidden />
        <div className="relative grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-xs font-black uppercase tracking-[0.28em] text-red-300 sm:text-sm">
              Juego Todo Account
            </p>
            <h1 className="font-display mt-4 text-[clamp(3rem,12vw,5rem)] uppercase leading-[0.9] text-white">
              Register And Access Your Profile
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-zinc-300 sm:text-lg">
              Create a Juego Todo account to manage your profile, track event interest,
              and connect with the official fighter registration funnel when you are ready
              to compete.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <FeatureCard
                icon={<UserPlus aria-hidden size={20} />}
                title="One Account"
                text="Sign up once for rankings updates, seminars, and platform access."
              />
              <FeatureCard
                icon={<ShieldCheck aria-hidden size={20} />}
                title="Profile Ready"
                text="Build your public-facing Juego Todo profile after registration."
              />
            </div>

            <p className="mt-8 text-sm leading-7 text-zinc-500">
              Looking to register as a fighter or gym? After creating your account, use your
              profile to continue into the official{" "}
              <Link className="font-semibold text-red-300 transition hover:text-red-200" href="/registration">
                competition registration
              </Link>
              .
            </p>
          </motion.div>

          <MotionSection>
            <div className="glass-panel rounded-[1.75rem] p-5 sm:p-8">
              <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-black/40 p-1">
                <button
                  className={`rounded-xl px-4 py-3 text-xs font-black uppercase tracking-[0.18em] transition ${
                    mode === "login"
                      ? "bg-red-600 text-white shadow-[0_0_22px_rgba(229,9,20,0.35)]"
                      : "text-zinc-400 hover:text-white"
                  }`}
                  onClick={() => {
                    setMode("login");
                    setError(null);
                  }}
                  type="button"
                >
                  Sign In
                </button>
                <button
                  className={`rounded-xl px-4 py-3 text-xs font-black uppercase tracking-[0.18em] transition ${
                    mode === "register"
                      ? "bg-red-600 text-white shadow-[0_0_22px_rgba(229,9,20,0.35)]"
                      : "text-zinc-400 hover:text-white"
                  }`}
                  onClick={() => {
                    setMode("register");
                    setError(null);
                  }}
                  type="button"
                >
                  Create Account
                </button>
              </div>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                {mode === "register" ? (
                  <>
                    <AuthField
                      label="Full name"
                      onChange={setFullName}
                      placeholder="Your full name"
                      required
                      value={fullName}
                    />
                    <label className="block">
                      <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
                        Account type
                      </span>
                      <select
                        className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none ring-red-500/40 transition focus:ring-4"
                        onChange={(event) => setAccountType(event.target.value as AccountType)}
                        value={accountType}
                      >
                        {accountTypes.map((type) => (
                          <option key={type} value={type}>
                            {accountTypeLabels[type]}
                          </option>
                        ))}
                      </select>
                    </label>
                  </>
                ) : null}

                <AuthField
                  autoComplete="email"
                  label="Email address"
                  onChange={setEmail}
                  placeholder="you@email.com"
                  required
                  type="email"
                  value={email}
                />
                <AuthField
                  autoComplete={mode === "register" ? "new-password" : "current-password"}
                  label="Password"
                  onChange={setPassword}
                  placeholder={mode === "register" ? "At least 8 characters" : "Your password"}
                  required
                  type="password"
                  value={password}
                />

                {mode === "register" ? (
                  <AuthField
                    autoComplete="new-password"
                    label="Confirm password"
                    onChange={setConfirmPassword}
                    placeholder="Repeat your password"
                    required
                    type="password"
                    value={confirmPassword}
                  />
                ) : null}

                {error ? (
                  <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                  </p>
                ) : null}

                <button
                  className="inline-flex w-full items-center justify-center rounded-full bg-red-600 px-6 py-4 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={submitting}
                  type="submit"
                >
                  {submitting ? "Please wait..." : mode === "register" ? "Create Account" : "Sign In"}
                  <ArrowRight className="ml-2" size={18} aria-hidden />
                </button>
              </form>

              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-400">
                <Lock className="mt-0.5 shrink-0 text-red-300" size={16} aria-hidden />
                <p>
                  Accounts are stored locally in this browser preview for now. A secure
                  Supabase auth backend can replace this in production.
                </p>
              </div>
            </div>
          </MotionSection>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="glass-panel rounded-3xl p-5">
      <div className="text-red-400">{icon}</div>
      <h2 className="mt-4 font-bold text-white">{title}</h2>
      <p className="mt-2 text-sm leading-7 text-zinc-400">{text}</p>
    </div>
  );
}

function AuthField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
        {label}
      </span>
      <input
        autoComplete={autoComplete}
        className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none ring-red-500/40 transition placeholder:text-zinc-500 focus:ring-4"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
      />
    </label>
  );
}
