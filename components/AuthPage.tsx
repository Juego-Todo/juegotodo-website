"use client";

import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Lock, ShieldCheck, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MotionSection } from "@/components/MotionSection";
import { PageNavigation } from "@/components/PageNavigation";
import { useAuth } from "@/lib/auth/context";
import {
  clearRememberedEmail,
  getRememberedEmail,
  setRememberedEmail,
} from "@/lib/auth/storage";

type AuthMode = "login" | "register";

function resolveAuthMode(value: string | null): AuthMode {
  return value === "register" ? "register" : "login";
}

export function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/profile";
  const { login, register } = useAuth();

  const [mode, setMode] = useState<AuthMode>(() => resolveAuthMode(searchParams.get("mode")));
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMode(resolveAuthMode(searchParams.get("mode")));
  }, [searchParams]);

  useEffect(() => {
    const rememberedEmail = getRememberedEmail();
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (mode === "register") {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }

        await register({ fullName, email, password, accountType: "fan" });
      } else {
        await login(email, password);

        if (rememberMe) {
          setRememberedEmail(email);
        } else {
          clearRememberedEmail();
        }
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
            <PageNavigation currentLabel="Register & Sign In" />
            <h1 className="font-display mt-3 text-[clamp(3rem,12vw,5rem)] uppercase leading-[0.9] text-white sm:mt-4">
              {mode === "register" ? "Create Your Account" : "Sign In To Your Account"}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-zinc-300 sm:text-lg">
              {mode === "register"
                ? "Create a Juego Todo account to manage your profile, save fighters and events, and shop official JTGC gear."
                : "Sign in to access your profile, orders, saved fighters, and league updates."}
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
                  <AuthField
                    label="Full name"
                    onChange={setFullName}
                    placeholder="Your full name"
                    required
                    value={fullName}
                  />
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
                <AuthPasswordField
                  autoComplete={mode === "register" ? "new-password" : "current-password"}
                  label="Password"
                  onChange={setPassword}
                  onToggleVisibility={() => setShowPassword((value) => !value)}
                  placeholder={mode === "register" ? "At least 8 characters" : "Your password"}
                  required
                  showPassword={showPassword}
                  value={password}
                />

                {mode === "register" ? (
                  <AuthPasswordField
                    autoComplete="new-password"
                    label="Confirm password"
                    onChange={setConfirmPassword}
                    onToggleVisibility={() => setShowConfirmPassword((value) => !value)}
                    placeholder="Repeat your password"
                    required
                    showPassword={showConfirmPassword}
                    value={confirmPassword}
                  />
                ) : null}

                {mode === "login" ? (
                  <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                    <input
                      checked={rememberMe}
                      className="h-4 w-4 rounded border-white/20 bg-black text-red-600 focus:ring-red-500/40"
                      onChange={(event) => setRememberMe(event.target.checked)}
                      type="checkbox"
                    />
                    <span className="text-sm text-zinc-300">Remember me on this device</span>
                  </label>
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

function AuthPasswordField({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  autoComplete,
  showPassword,
  onToggleVisibility,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  autoComplete?: string;
  showPassword: boolean;
  onToggleVisibility: () => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
        {label}
      </span>
      <div className="relative">
        <input
          autoComplete={autoComplete}
          className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 pr-12 text-white outline-none ring-red-500/40 transition placeholder:text-zinc-500 focus:ring-4"
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          type={showPassword ? "text" : "password"}
          value={value}
        />
        <button
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-zinc-400 transition hover:text-white"
          onClick={onToggleVisibility}
          type="button"
        >
          {showPassword ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
        </button>
      </div>
    </label>
  );
}
