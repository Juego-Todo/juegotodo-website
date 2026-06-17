"use client";

import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Lock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { MotionSection } from "@/components/MotionSection";
import { PageNavigation } from "@/components/PageNavigation";
import { useAuth } from "@/lib/auth/context";
import {
  clearRememberedEmail,
  getPendingPasswordResetEmail,
  getRememberedEmail,
  setRememberedEmail,
} from "@/lib/auth/storage";

type AuthMode = "login" | "register" | "forgot" | "reset";

function resolveAuthMode(value: string | null): AuthMode {
  if (value === "register") {
    return "register";
  }
  if (value === "forgot") {
    return "forgot";
  }
  if (value === "reset") {
    return "reset";
  }
  return "login";
}

export function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/profile";
  const mode = resolveAuthMode(searchParams.get("mode"));
  const { user, login, register, requestPasswordReset, updatePassword, usesSupabase } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(() => {
    const pendingResetEmail = getPendingPasswordResetEmail();
    if (pendingResetEmail) {
      return pendingResetEmail;
    }
    return getRememberedEmail() ?? "";
  });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(() => {
    if (getPendingPasswordResetEmail()) {
      return false;
    }
    return Boolean(getRememberedEmail());
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const resolvedEmail = mode === "reset" && user?.email ? user.email : email;

  function switchMode(nextMode: AuthMode) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextMode === "login") {
      params.delete("mode");
    } else {
      params.set("mode", nextMode);
    }
    const query = params.toString();
    router.replace(query ? `/login?${query}` : "/login", { scroll: false });
    setError(null);
    setSuccess(null);
    setPassword("");
    setConfirmPassword("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      if (mode === "register") {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }

        await register({ fullName, email, password, accountType: "fan" });
        router.push(nextPath);
        return;
      }

      if (mode === "forgot") {
        const result = await requestPasswordReset(email);

        if (result.delivery === "email") {
          setSuccess("Password reset link sent. Check your email to continue.");
          return;
        }

        const pendingResetEmail = getPendingPasswordResetEmail();
        if (pendingResetEmail) {
          setSuccess("Demo mode: account found. Set your new password below.");
          switchMode("reset");
          return;
        }

        setSuccess("If an account exists for that email, reset instructions have been sent.");
        return;
      }

      if (mode === "reset") {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }

        await updatePassword(resolvedEmail, password);

        if (usesSupabase) {
          router.push("/profile");
          return;
        }

        setSuccess("Password updated successfully. You can now sign in.");
        switchMode("login");
        return;
      }

      await login(email, password);

      if (rememberMe) {
        setRememberedEmail(email);
      } else {
        clearRememberedEmail();
      }

      router.push(nextPath);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  const heading =
    mode === "register"
      ? "Create Your Account"
      : mode === "forgot"
        ? "Reset Your Password"
        : mode === "reset"
          ? "Choose A New Password"
          : "Sign In To Your Account";

  const description =
    mode === "register"
      ? "Create a Juego Todo account to manage your profile, save fighters and events, and shop official JTGC gear."
      : mode === "forgot"
        ? "Enter the email tied to your JTGC account and we will send password reset instructions."
        : mode === "reset"
          ? "Create a new password for your account. Use at least 8 characters."
          : "Sign in to access your profile, orders, saved fighters, and league updates.";

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
              {heading}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-zinc-300 sm:text-lg">{description}</p>
          </motion.div>

          <MotionSection>
            <div className="glass-panel rounded-[1.75rem] p-5 sm:p-8">
              {mode === "login" || mode === "register" ? (
                <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-black/40 p-1">
                  <button
                    className={`rounded-xl px-4 py-3 text-xs font-black uppercase tracking-[0.18em] transition ${
                      mode === "login"
                        ? "bg-red-600 text-white shadow-[0_0_22px_rgba(229,9,20,0.35)]"
                        : "text-zinc-400 hover:text-white"
                    }`}
                    onClick={() => switchMode("login")}
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
                    onClick={() => switchMode("register")}
                    type="button"
                  >
                    Create Account
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">
                    {mode === "forgot" ? "Forgot Password" : "Password Recovery"}
                  </p>
                  <button
                    className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-400 transition hover:text-white"
                    onClick={() => switchMode("login")}
                    type="button"
                  >
                    ← Back to sign in
                  </button>
                </div>
              )}

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
                  onChange={mode === "reset" && user?.email ? () => undefined : setEmail}
                  placeholder="you@email.com"
                  readOnly={mode === "reset" && Boolean(user?.email || getPendingPasswordResetEmail())}
                  required
                  type="email"
                  value={resolvedEmail}
                />

                {mode === "login" || mode === "register" || mode === "reset" ? (
                  <AuthPasswordField
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    label={mode === "reset" ? "New password" : "Password"}
                    onChange={setPassword}
                    onToggleVisibility={() => setShowPassword((value) => !value)}
                    placeholder={mode === "login" ? "Your password" : "At least 8 characters"}
                    required
                    showPassword={showPassword}
                    value={password}
                  />
                ) : null}

                {mode === "register" || mode === "reset" ? (
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
                  <div className="flex items-center justify-between gap-3">
                    <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                      <input
                        checked={rememberMe}
                        className="h-4 w-4 rounded border-white/20 bg-black text-red-600 focus:ring-red-500/40"
                        onChange={(event) => setRememberMe(event.target.checked)}
                        type="checkbox"
                      />
                      <span className="text-sm text-zinc-300">Remember me on this device</span>
                    </label>
                    <button
                      className="text-xs font-black uppercase tracking-[0.16em] text-red-200 transition hover:text-white"
                      onClick={() => switchMode("forgot")}
                      type="button"
                    >
                      Forgot password?
                    </button>
                  </div>
                ) : null}

                {success ? (
                  <p className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                    {success}
                  </p>
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
                  {submitting
                    ? "Please wait..."
                    : mode === "register"
                      ? "Create Account"
                      : mode === "forgot"
                        ? "Send Reset Link"
                        : mode === "reset"
                          ? "Update Password"
                          : "Sign In"}
                  <ArrowRight className="ml-2" size={18} aria-hidden />
                </button>
              </form>

              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-400">
                <Lock className="mt-0.5 shrink-0 text-red-300" size={16} aria-hidden />
                <p>
                  {mode === "forgot" || mode === "reset"
                    ? usesSupabase
                      ? "Password reset links are sent by email and expire after a short period for security."
                      : "Demo mode stores reset requests locally until Supabase email auth is configured."
                    : usesSupabase
                      ? "Accounts, profiles, orders, and saved data are backed by Supabase with row-level security."
                      : "Supabase is not configured yet. Add your project keys to .env.local to enable cloud auth and persistence."}
                </p>
              </div>
            </div>
          </MotionSection>
        </div>
      </section>
    </main>
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
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  readOnly?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
        {label}
      </span>
      <input
        autoComplete={autoComplete}
        className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none ring-red-500/40 transition placeholder:text-zinc-500 focus:ring-4 disabled:opacity-70"
        disabled={readOnly}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
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
