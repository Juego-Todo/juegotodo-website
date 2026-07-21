"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check, Eye, EyeOff, Loader2, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { MotionSection } from "@/components/MotionSection";
import { PageNavigation } from "@/components/PageNavigation";
import { useAuth } from "@/lib/auth/context";
import { defaultRegistrationCountry, registrationCountryNames } from "@/data/countries";
import {
  getLatestAllowedBirthDate,
  getEarliestAllowedBirthDate,
  registerGenderOptions,
  validateDateOfBirth,
} from "@/lib/auth/name";
import { getPhoneDialCode, getPhonePlaceholder, validateRegistrationPhone } from "@/lib/auth/phone";
import {
  checkUsernameAvailability,
  clearPendingPasswordResetEmail,
  clearRememberedEmail,
  getPendingPasswordResetEmail,
  getRememberedEmail,
  setRememberedEmail,
} from "@/lib/auth/storage";
import { getUsernameValidationError, normalizeUsername, validateUsername } from "@/lib/auth/username";

type AuthMode = "login" | "register" | "forgot" | "reset";
type UsernameCheckStatus = "idle" | "checking" | "available" | "taken" | "invalid" | "error";

const authInputClassName =
  "w-full rounded-2xl border border-white/[0.08] bg-black/55 px-4 py-3.5 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500/40 focus:bg-black/70 focus:ring-4 focus:ring-red-500/15 disabled:opacity-70";

const authLabelClassName = "mb-2.5 block text-[0.68rem] font-black uppercase tracking-[0.2em] text-zinc-500";

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

function resolveSafeNextPath(value: string | null) {
  const next = value ?? "/profile";
  return next.startsWith("/") && !next.startsWith("//") && !next.includes("\\")
    ? next
    : "/profile";
}

export function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = resolveSafeNextPath(searchParams.get("next"));
  const mode = resolveAuthMode(searchParams.get("mode"));
  const { user, login, register, requestPasswordReset, updatePassword, usesSupabase } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [username, setUsername] = useState("");
  const [usernameAvailabilityStatus, setUsernameAvailabilityStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "error"
  >("idle");
  const [usernameAvailabilityMessage, setUsernameAvailabilityMessage] = useState("");
  const usernameCheckRequestRef = useRef(0);
  const [email, setEmail] = useState(() => {
    const pendingResetEmail = getPendingPasswordResetEmail();
    if (pendingResetEmail) {
      return pendingResetEmail;
    }
    return getRememberedEmail();
  });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState(defaultRegistrationCountry.name);
  const [city, setCity] = useState("");
  const [rememberMe, setRememberMe] = useState(() => {
    if (getPendingPasswordResetEmail()) {
      return false;
    }
    return Boolean(getRememberedEmail());
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedAccountTerms, setAcceptedAccountTerms] = useState(false);
  const [error, setError] = useState<string | null>(() => searchParams.get("authError"));
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const resolvedEmail = mode === "reset" && user?.email ? user.email : email;

  const usernameValidationError =
    mode === "register" && username.trim() ? getUsernameValidationError(username) : null;

  const runUsernameAvailabilityCheck = useCallback(async (value: string) => {
    const validationError = getUsernameValidationError(value);
    if (validationError) {
      return;
    }

    const requestId = ++usernameCheckRequestRef.current;
    setUsernameAvailabilityStatus("checking");
    setUsernameAvailabilityMessage("Checking availability...");

    try {
      const result = await checkUsernameAvailability(value);

      if (requestId !== usernameCheckRequestRef.current) {
        return;
      }

      setUsernameAvailabilityStatus(result.available ? "available" : "taken");
      setUsernameAvailabilityMessage(result.message);
    } catch (caught) {
      if (requestId !== usernameCheckRequestRef.current) {
        return;
      }

      setUsernameAvailabilityStatus("error");
      setUsernameAvailabilityMessage(
        `${
          caught instanceof Error ? caught.message : "Unable to check username."
        } You can still submit; availability will be validated during account creation.`,
      );
    }
  }, []);

  useEffect(() => {
    if (mode !== "register" || !username.trim() || usernameValidationError) {
      return;
    }

    const timer = window.setTimeout(() => {
      void runUsernameAvailabilityCheck(username);
    }, 450);

    return () => window.clearTimeout(timer);
  }, [mode, runUsernameAvailabilityCheck, username, usernameValidationError]);

  function handleUsernameChange(value: string) {
    const normalized = normalizeUsername(value);
    setUsername(normalized);
    setUsernameAvailabilityStatus("idle");
    setUsernameAvailabilityMessage("");
  }

  const usernameIsPendingCheck =
    mode === "register" &&
    Boolean(username.trim()) &&
    !usernameValidationError &&
    usernameAvailabilityStatus === "idle";

  const usernameCheckStatus: UsernameCheckStatus = !username.trim()
    ? "idle"
    : usernameValidationError
      ? "invalid"
      : usernameIsPendingCheck
        ? "checking"
        : usernameAvailabilityStatus;

  const usernameCheckMessage =
    usernameValidationError ??
    usernameAvailabilityMessage ??
    (usernameIsPendingCheck
      ? "Checking availability..."
      : username.trim()
        ? ""
        : "Choose your handle first. Usernames must be respectful and are checked automatically.");

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
    if (nextMode !== "register") {
      setFirstName("");
      setMiddleName("");
      setLastName("");
      setGender("");
      setDateOfBirth("");
      setUsername("");
      setUsernameAvailabilityStatus("idle");
      setUsernameAvailabilityMessage("");
      setPhone("");
      setCountry(defaultRegistrationCountry.name);
      setCity("");
      setAcceptedAccountTerms(false);
    }
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

        if (!acceptedAccountTerms) {
          throw new Error("Please confirm your information and agree to account data protection terms.");
        }

        if (!firstName.trim()) {
          throw new Error("First name is required.");
        }

        if (!lastName.trim()) {
          throw new Error("Last name is required.");
        }

        if (!gender) {
          throw new Error("Please select a gender.");
        }

        const normalizedDateOfBirth = validateDateOfBirth(dateOfBirth);
        const normalizedPhone = validateRegistrationPhone(country, phone);

        if (usernameCheckStatus !== "available" && usernameCheckStatus !== "error") {
          const result = await checkUsernameAvailability(username);
          if (!result.available) {
            throw new Error(result.message);
          }
        }

        await register({
          firstName: firstName.trim(),
          middleName: middleName.trim(),
          lastName: lastName.trim(),
          gender,
          dateOfBirth: normalizedDateOfBirth,
          username: validateUsername(username),
          email,
          password,
          accountType: "fan",
          phone: normalizedPhone,
          country,
          city,
        });
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
          switchMode("reset");
          setSuccess("If an account exists for that email, you can set a new password below.");
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
        clearPendingPasswordResetEmail();

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
      const message = caught instanceof Error ? caught.message : "Something went wrong.";
      if (message.startsWith("Account created.")) {
        switchMode("login");
        setSuccess(message);
        return;
      }
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  const isCheckoutReturn = nextPath.startsWith("/checkout");

  const heading =
    mode === "register"
      ? isCheckoutReturn
        ? "Create Account To Checkout"
        : "Create Your Account"
      : mode === "forgot"
        ? "Reset Your Password"
        : mode === "reset"
          ? "Choose A New Password"
          : isCheckoutReturn
            ? "Login To Checkout"
            : "Login To Your Account";

  const description =
    mode === "register"
      ? isCheckoutReturn
        ? "Create your Juego Todo account to continue checkout. Your cart will stay saved while you register."
        : ""
      : mode === "forgot"
        ? "Enter the email tied to your JTGC account and we will send password reset instructions."
        : mode === "reset"
          ? "Create a new password for your account. Use at least 8 characters."
          : isCheckoutReturn
            ? "Sign in to continue checkout. Your cart items will still be there."
            : "";

  const usernameBlocksSubmit =
    mode === "register" &&
    (usernameCheckStatus === "checking" ||
      usernameCheckStatus === "taken" ||
      usernameCheckStatus === "invalid" ||
      !username.trim());

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
            <PageNavigation currentLabel="Register & Login" />
            <h1 className="font-display mt-3 text-[clamp(3rem,12vw,5rem)] uppercase leading-[0.9] text-white sm:mt-4">
              {heading}
            </h1>
            {description ? (
              <p className="mt-5 max-w-xl text-base leading-7 text-zinc-300 sm:text-lg">{description}</p>
            ) : null}
          </motion.div>

          <MotionSection>
            <div className="glass-panel relative overflow-hidden rounded-[1.75rem] border border-white/[0.08] p-6 sm:p-8">
              <div
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF1010]/70 to-transparent"
                aria-hidden
              />

              {mode === "login" || mode === "register" ? (
                <AuthModeToggle
                  mode={mode}
                  onLogin={() => switchMode("login")}
                  onRegister={() => switchMode("register")}
                />
              ) : (
                <div className="rounded-2xl border border-white/[0.08] bg-black/45 px-4 py-3.5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">
                    {mode === "forgot" ? "Forgot Password" : "Password Recovery"}
                  </p>
                  <button
                    className="mt-2 text-xs font-semibold text-zinc-400 transition hover:text-white"
                    onClick={() => switchMode("login")}
                    type="button"
                  >
                    ← Back to login
                  </button>
                </div>
              )}

              <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
                {mode === "register" ? (
                  <>
                    <AuthUsernameField
                      message={usernameCheckMessage}
                      onChange={handleUsernameChange}
                      status={usernameCheckStatus}
                      value={username}
                    />
                    <div className="grid gap-4 sm:grid-cols-3">
                      <AuthField
                        autoComplete="given-name"
                        label="First name"
                        onChange={setFirstName}
                        placeholder="First name"
                        required
                        value={firstName}
                      />
                      <AuthField
                        autoComplete="additional-name"
                        label="Middle name"
                        onChange={setMiddleName}
                        placeholder="Optional"
                        value={middleName}
                      />
                      <AuthField
                        autoComplete="family-name"
                        label="Last name"
                        onChange={setLastName}
                        placeholder="Last name"
                        required
                        value={lastName}
                      />
                    </div>
                    <AuthGenderChoiceField
                      label="Gender"
                      onChange={setGender}
                      options={registerGenderOptions}
                      required
                      value={gender}
                    />
                    <AuthField
                      autoComplete="bday"
                      label="Date of birth"
                      max={getLatestAllowedBirthDate()}
                      min={getEarliestAllowedBirthDate()}
                      onChange={setDateOfBirth}
                      required
                      type="date"
                      value={dateOfBirth}
                    />
                    <AuthCountrySelectField
                      label="Country"
                      onChange={setCountry}
                      options={registrationCountryNames}
                      required
                      value={country}
                    />
                    <AuthPhoneField
                      country={country}
                      label="Phone"
                      onChange={setPhone}
                      value={phone}
                    />
                    <AuthField
                      label="City / region"
                      onChange={setCity}
                      placeholder="Optional"
                      value={city}
                    />
                  </>
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
                  <div className="flex flex-col gap-3 border-t border-white/[0.06] pt-1 sm:flex-row sm:items-center sm:justify-between">
                    <label className="flex min-h-11 cursor-pointer items-center gap-2.5">
                      <input
                        checked={rememberMe}
                        className="h-4 w-4 rounded border-white/20 bg-transparent accent-[#FF1010] focus:ring-red-500/40"
                        onChange={(event) => {
                          const checked = event.target.checked;
                          setRememberMe(checked);
                          if (!checked) {
                            clearRememberedEmail();
                          }
                        }}
                        type="checkbox"
                      />
                      <span className="text-sm text-zinc-400">Remember my email on this device</span>
                    </label>
                    <button
                      className="inline-flex min-h-11 items-center text-left text-sm font-semibold text-red-300 transition hover:text-white sm:text-right"
                      onClick={() => switchMode("forgot")}
                      type="button"
                    >
                      Forgot password?
                    </button>
                  </div>
                ) : null}

                {mode === "register" ? (
                  <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                    <input
                      checked={acceptedAccountTerms}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-black text-red-600 focus:ring-red-500/40"
                      onChange={(event) => setAcceptedAccountTerms(event.target.checked)}
                      required
                      type="checkbox"
                    />
                    <span className="text-sm leading-6 text-zinc-300">
                      I confirm that the information I provide is accurate and complete, and I agree to Juego
                      Todo&apos;s handling of my account data in accordance with the{" "}
                      <Link className="font-semibold text-red-200 underline-offset-2 hover:text-white hover:underline" href="/privacy">
                        Privacy Policy
                      </Link>
                      .
                    </span>
                  </label>
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
                  className="group inline-flex min-h-[3.25rem] w-full items-center justify-center rounded-full bg-gradient-to-r from-[#FF1010] to-red-600 px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-white shadow-[0_12px_32px_rgba(255,16,16,0.22)] transition hover:from-red-500 hover:to-[#ff2828] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={
                    submitting ||
                    (mode === "register" && !acceptedAccountTerms) ||
                    usernameBlocksSubmit
                  }
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
                          : "Login"}
                  <ArrowRight
                    className="ml-2 transition group-hover:translate-x-0.5"
                    size={18}
                    aria-hidden
                  />
                </button>
              </form>
            </div>
          </MotionSection>
        </div>
      </section>
    </main>
  );
}

function AuthModeToggle({
  mode,
  onLogin,
  onRegister,
}: {
  mode: AuthMode;
  onLogin: () => void;
  onRegister: () => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-2xl border border-white/[0.08] bg-black/45 p-1">
      <button
        className={`min-h-11 rounded-[0.85rem] px-3 py-2.5 text-[0.68rem] font-black uppercase tracking-[0.16em] transition sm:text-xs sm:tracking-[0.18em] ${
          mode === "login"
            ? "bg-[#FF1010] text-white shadow-[0_8px_24px_rgba(255,16,16,0.28)]"
            : "text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-200"
        }`}
        onClick={onLogin}
        type="button"
      >
        Login
      </button>
      <button
        className={`min-h-11 rounded-[0.85rem] px-3 py-2.5 text-[0.68rem] font-black uppercase tracking-[0.16em] transition sm:text-xs sm:tracking-[0.18em] ${
          mode === "register"
            ? "bg-[#FF1010] text-white shadow-[0_8px_24px_rgba(255,16,16,0.28)]"
            : "text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-200"
        }`}
        onClick={onRegister}
        type="button"
      >
        <span className="sm:hidden">Register</span>
        <span className="hidden sm:inline">Create Account</span>
      </button>
    </div>
  );
}

function AuthUsernameField({
  value,
  onChange,
  status,
  message,
}: {
  value: string;
  onChange: (value: string) => void;
  status: UsernameCheckStatus;
  message: string;
}) {
  const statusClassName =
    status === "available"
      ? "text-emerald-300"
      : status === "taken" || status === "invalid" || status === "error"
        ? "text-red-300"
        : "text-zinc-500";

  return (
    <div className="block">
      <span className={authLabelClassName}>Username</span>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-zinc-500">
          @
        </span>
        <input
          autoComplete="username"
          className={`${authInputClassName} pl-8 ${
            status === "available"
              ? "border-emerald-500/40"
              : status === "taken" || status === "invalid" || status === "error"
                ? "border-red-500/40"
                : ""
          }`}
          onChange={(event) => onChange(event.target.value)}
          placeholder="yourname"
          required
          value={value}
        />
      </div>
      <div className="mt-2 flex items-start gap-2">
        {status === "checking" ? <Loader2 className="mt-0.5 shrink-0 animate-spin text-zinc-400" size={14} aria-hidden /> : null}
        {status === "available" ? <Check className="mt-0.5 shrink-0 text-emerald-300" size={14} aria-hidden /> : null}
        {status === "taken" || status === "invalid" || status === "error" ? (
          <X className="mt-0.5 shrink-0 text-red-300" size={14} aria-hidden />
        ) : null}
        <p className={`text-xs leading-5 ${statusClassName}`}>
          {message ||
            "6–20 characters. Letters, numbers, and underscores only. Availability is checked automatically."}
        </p>
      </div>
    </div>
  );
}

function AuthCountrySelectField({
  label,
  value,
  onChange,
  options,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className={authLabelClassName}>{label}</span>
      <select
        className={`${authInputClassName} [color-scheme:dark] [&>option]:bg-[#120305] [&>option]:text-white`}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        value={value}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function AuthPhoneField({
  label,
  country,
  value,
  onChange,
}: {
  label: string;
  country: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const dialCode = getPhoneDialCode(country);
  const placeholder = getPhonePlaceholder(country);

  return (
    <label className="block">
      <span className={authLabelClassName}>{label}</span>
      <div className="flex gap-2">
        <div className="flex min-w-[4.75rem] shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] bg-black/55 px-3 py-3.5 text-sm font-semibold text-zinc-200">
          {dialCode}
        </div>
        <input
          autoComplete="tel-national"
          className={authInputClassName}
          inputMode="tel"
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          type="tel"
          value={value}
        />
      </div>
      <p className="mt-2 text-xs text-zinc-600">Country code is added automatically from your selected country.</p>
    </label>
  );
}

function AuthGenderChoiceField({
  label,
  value,
  onChange,
  options,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  required?: boolean;
}) {
  return (
    <fieldset className="block">
      <legend className={authLabelClassName}>{label}</legend>
      <div aria-label={label} className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-2.5" role="radiogroup">
        {options.map((option) => {
          const selected = value === option;

          return (
            <button
              aria-checked={selected}
              className={`min-h-11 rounded-2xl border px-3 py-3.5 text-center text-sm font-semibold leading-snug transition ${
                selected
                  ? "border-red-500/45 bg-red-500/10 text-white shadow-[0_0_18px_rgba(229,9,20,0.12)]"
                  : "border-white/10 bg-black/50 text-zinc-300 hover:border-white/20 hover:bg-white/[0.04] hover:text-white"
              }`}
              key={option}
              onClick={() => onChange(option)}
              role="radio"
              type="button"
            >
              {option}
            </button>
          );
        })}
      </div>
      {required ? (
        <input
          aria-hidden
          className="sr-only"
          readOnly
          required
          tabIndex={-1}
          value={value}
        />
      ) : null}
    </fieldset>
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
  min,
  max,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  readOnly?: boolean;
  min?: string;
  max?: string;
}) {
  return (
    <label className="block">
      <span className={authLabelClassName}>{label}</span>
      <input
        autoComplete={autoComplete}
        className={`${authInputClassName}${type === "date" ? " [color-scheme:dark]" : ""}`}
        disabled={readOnly}
        max={max}
        min={min}
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
      <span className={authLabelClassName}>{label}</span>
      <div className="relative">
        <input
          autoComplete={autoComplete}
          className={`${authInputClassName} pr-12`}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          type={showPassword ? "text" : "password"}
          value={value}
        />
        <button
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-zinc-500 transition hover:bg-white/[0.06] hover:text-white"
          onClick={onToggleVisibility}
          type="button"
        >
          {showPassword ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
        </button>
      </div>
    </label>
  );
}
