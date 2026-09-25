"use client";

import { ArrowRight, Check, Eye, EyeOff, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { MotionSection } from "@/components/MotionSection";
import { PageNavigation } from "@/components/PageNavigation";
import {
  RegistrationLegalAcknowledgments,
  registrationLegalIsComplete,
  type RegistrationLegalState,
} from "@/components/auth/RegistrationLegalAcknowledgments";
import { useAuth } from "@/lib/auth/context";
import { defaultRegistrationCountry, registrationCountryNames } from "@/data/countries";
import {
  getLatestAllowedBirthDate,
  getEarliestAllowedBirthDate,
  buildFullName,
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

type AuthMode = "login" | "register" | "forgot" | "reset" | "change-password";
type UsernameCheckStatus = "idle" | "checking" | "available" | "taken" | "invalid" | "error";
type RegisterStep = 1 | 2 | 3 | 4;

const REGISTER_STEPS = [
  { id: 1 as const, label: "Account", short: "Account" },
  { id: 2 as const, label: "About You", short: "About" },
  { id: 3 as const, label: "Contact", short: "Contact" },
  { id: 4 as const, label: "Review", short: "Review" },
];

const authInputClassName =
  "w-full rounded-xl border border-white/[0.08] bg-black/40 px-4 py-3.5 text-[0.95rem] text-white outline-none transition placeholder:text-zinc-600 hover:border-white/15 focus:border-red-500/45 focus:bg-black/55 focus:ring-2 focus:ring-red-500/15 disabled:opacity-70";

const authLabelClassName = "mb-1.5 block text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-zinc-500";

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
  if (value === "change-password") {
    return "change-password";
  }
  return "login";
}

function resolveSafeNextPath(value: string | null) {
  const next = (value ?? "/profile").trim() || "/profile";
  if (next === "/welcome" || next.startsWith("/welcome?")) {
    return "/profile";
  }
  return next.startsWith("/") && !next.startsWith("//") && !next.includes("\\")
    ? next
    : "/profile";
}

export function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = resolveSafeNextPath(searchParams.get("next"));
  const mode = resolveAuthMode(searchParams.get("mode"));
  const { user, login, register, requestPasswordReset, updatePassword, logout, usesSupabase } = useAuth();

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
  const [acceptedLegal, setAcceptedLegal] = useState<RegistrationLegalState>({
    accuracyConfirmed: false,
    privacyAcknowledged: false,
    termsAccepted: false,
    marketingOptIn: false,
  });
  const [showLegalValidation, setShowLegalValidation] = useState(false);
  const [registerStep, setRegisterStep] = useState<RegisterStep>(1);
  const [error, setError] = useState<string | null>(() => searchParams.get("authError"));
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [invalidField, setInvalidField] = useState<string | null>(null);
  const resolvedEmail = (mode === "reset" || mode === "change-password") && user?.email ? user.email : email;

  function markInvalidField(field: string) {
    setInvalidField(field);
    requestAnimationFrame(() => {
      const target = document.querySelector<HTMLElement>(`[data-auth-field="${field}"]`);
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
      const focusable = target?.querySelector<HTMLElement>("button, input, select, textarea");
      focusable?.focus();
    });
  }

  const usernameValidationError =
    mode === "register" && username.trim() ? getUsernameValidationError(username) : null;

  const runUsernameAvailabilityCheck = useCallback(async (value: string) => {
    const validationError = getUsernameValidationError(value);
    if (validationError) {
      return;
    }

    const requestId = ++usernameCheckRequestRef.current;
    setUsernameAvailabilityStatus("checking");
    setUsernameAvailabilityMessage("Checking…");

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
    if (user?.mustChangePassword && mode !== "change-password") {
      switchMode("change-password");
    }
    // Intentionally omit switchMode: it resets form state and should only run on this gate.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- switchMode would re-run on every render
  }, [mode, user?.mustChangePassword]);

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
    (usernameIsPendingCheck ? "Checking…" : "");

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
      setAcceptedLegal({
        accuracyConfirmed: false,
        privacyAcknowledged: false,
        termsAccepted: false,
        marketingOptIn: false,
      });
      setShowLegalValidation(false);
      setRegisterStep(1);
    }
    if (nextMode === "register") {
      setRegisterStep(1);
    }
  }

  function validateRegisterStep(step: RegisterStep): string | null {
    setInvalidField(null);
    setError(null);

    if (step === 1) {
      if (!username.trim()) {
        markInvalidField("username");
        return "Choose a username to continue.";
      }
      const usernameError = getUsernameValidationError(username);
      if (usernameError) {
        markInvalidField("username");
        return usernameError;
      }
      if (usernameCheckStatus === "checking") {
        return "Please wait while we check username availability.";
      }
      if (usernameCheckStatus === "taken") {
        markInvalidField("username");
        return "Username is already taken. Try another.";
      }
      if (!email.trim()) {
        return "Email address is required.";
      }
      if (password.length < 8) {
        return "Password must be at least 8 characters.";
      }
      if (password !== confirmPassword) {
        markInvalidField("confirmPassword");
        return "Passwords do not match.";
      }
      return null;
    }

    if (step === 2) {
      if (!firstName.trim()) {
        markInvalidField("firstName");
        return "First name is required.";
      }
      if (!lastName.trim()) {
        markInvalidField("lastName");
        return "Last name is required.";
      }
      if (!gender) {
        markInvalidField("gender");
        return "Please select a gender.";
      }
      try {
        validateDateOfBirth(dateOfBirth);
      } catch (caught) {
        return caught instanceof Error ? caught.message : "Enter a valid date of birth.";
      }
      return null;
    }

    if (step === 3) {
      if (!country.trim()) {
        return "Country is required.";
      }
      try {
        validateRegistrationPhone(country, phone);
      } catch (caught) {
        return caught instanceof Error ? caught.message : "Enter a valid phone number.";
      }
      return null;
    }

    return null;
  }

  function goToRegisterStep(step: RegisterStep) {
    setError(null);
    setInvalidField(null);
    setRegisterStep(step);
  }

  function continueRegisterStep() {
    const message = validateRegisterStep(registerStep);
    if (message) {
      setError(message);
      return;
    }
    if (registerStep < 4) {
      setRegisterStep((current) => (current + 1) as RegisterStep);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setInvalidField(null);

    if (mode === "register" && registerStep !== 4) {
      continueRegisterStep();
      return;
    }

    setSubmitting(true);

    try {
      if (mode === "register") {
        if (password !== confirmPassword) {
          markInvalidField("confirmPassword");
          throw new Error("Passwords do not match.");
        }

        if (!registrationLegalIsComplete(acceptedLegal)) {
          setShowLegalValidation(true);
          markInvalidField("legal");
          throw new Error("Please complete the required confirmations before continuing.");
        }

        if (!firstName.trim()) {
          markInvalidField("firstName");
          throw new Error("First name is required.");
        }

        if (!lastName.trim()) {
          markInvalidField("lastName");
          throw new Error("Last name is required.");
        }

        if (!gender) {
          markInvalidField("gender");
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

        const consentPayload = {
          accuracyConfirmed: acceptedLegal.accuracyConfirmed === true,
          privacyAcknowledged: acceptedLegal.privacyAcknowledged === true,
          termsAccepted: acceptedLegal.termsAccepted === true,
          marketingOptIn: acceptedLegal.marketingOptIn === true,
        };

        if (
          !consentPayload.accuracyConfirmed ||
          !consentPayload.privacyAcknowledged ||
          !consentPayload.termsAccepted
        ) {
          setShowLegalValidation(true);
          markInvalidField("legal");
          throw new Error("Please complete the required confirmations before continuing.");
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
          ...consentPayload,
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

      if (mode === "reset" || mode === "change-password") {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }

        if (mode === "change-password" && password === "JuegoTodo2026!") {
          throw new Error("Choose a new password. You cannot reuse the temporary password.");
        }

        await updatePassword(resolvedEmail, password);
        clearPendingPasswordResetEmail();

        if (usesSupabase || mode === "change-password") {
          router.push("/profile");
          return;
        }

        setSuccess("Password updated successfully. You can now sign in.");
        switchMode("login");
        return;
      }

      const profile = await login(email, password);

      if (rememberMe) {
        setRememberedEmail(email);
      } else {
        clearRememberedEmail();
      }

      if (profile.mustChangePassword) {
        switchMode("change-password");
        setSuccess("Please choose a new password before continuing.");
        return;
      }

      router.push(nextPath);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Something went wrong.";
      if (message.startsWith("Account created.")) {
        switchMode("login");
        setSuccess(message);
        return;
      }
      if (
        mode === "register" &&
        (/Privacy Policy/i.test(message) ||
          /Terms of Service/i.test(message) ||
          /required confirmation/i.test(message) ||
          /information accuracy/i.test(message))
      ) {
        setShowLegalValidation(true);
        markInvalidField("legal");
      }
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  const isCheckoutReturn = nextPath.startsWith("/checkout");

  const registerHeadings: Record<RegisterStep, { title: string; subtitle: string }> = {
    1: {
      title: isCheckoutReturn ? "Create account to checkout" : "Create your account",
      subtitle: isCheckoutReturn
        ? "Start with your login details. Your cart will stay saved."
        : "Start with your login details.",
    },
    2: {
      title: "Tell us about yourself",
      subtitle: "Create your member profile.",
    },
    3: {
      title: "Where can we reach you?",
      subtitle: "Keep your contact and location information up to date.",
    },
    4: {
      title: "Review your account",
      subtitle: "You're almost ready to join Juego Todo.",
    },
  };

  const heading =
    mode === "register"
      ? registerHeadings[registerStep].title
      : mode === "forgot"
        ? "Reset your password"
        : mode === "reset" || mode === "change-password"
          ? "Choose a new password"
          : isCheckoutReturn
            ? "Login to checkout"
            : "Welcome back";

  const description =
    mode === "register"
      ? registerHeadings[registerStep].subtitle
      : mode === "forgot"
        ? "Enter the email tied to your JTGC account and we will send password reset instructions."
        : mode === "change-password"
          ? "Your account was created with a temporary password. Choose a new password to continue."
          : mode === "reset"
            ? "Create a new password for your account. Use at least 8 characters."
            : isCheckoutReturn
              ? "Sign in to continue checkout. Your cart items will still be there."
              : "Sign in to access your profile, tickets, and membership.";

  const usernameBlocksContinue =
    usernameCheckStatus === "checking" ||
    usernameCheckStatus === "taken" ||
    usernameCheckStatus === "invalid" ||
    !username.trim();

  const reviewFullName = buildFullName({
    firstName: firstName.trim() || "—",
    middleName: middleName.trim(),
    lastName: lastName.trim() || "—",
  });
  const reviewPhone = phone.trim()
    ? `${getPhoneDialCode(country)} ${phone.trim()}`
    : "—";

  return (
    <main className="px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
      <section className="relative mx-auto max-w-6xl py-8 sm:py-12">
        <PageNavigation currentLabel="Register & Login" />

        <div className="mt-6 grid items-stretch gap-5 lg:grid-cols-[minmax(0,34rem)_minmax(0,1fr)] lg:gap-6">
          <MotionSection>
            <div className="relative overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-[#0a0a0a]/90 p-5 sm:p-7">
              {/* Mobile visual strip */}
              <div className="relative mb-5 aspect-[2.2/1] overflow-hidden rounded-xl lg:hidden">
                <Image
                  alt="Juego Todo fighters in competition"
                  className="object-cover object-[center_30%]"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 0px"
                  src="/auth-fighters-background.png"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/20 to-transparent" />
              </div>
            {mode === "login" || mode === "register" ? (
              <AuthModeToggle
                mode={mode}
                onLogin={() => switchMode("login")}
                onRegister={() => switchMode("register")}
              />
            ) : (
              <div className="rounded-xl border border-white/[0.08] bg-black/30 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-300">
                  {mode === "forgot"
                    ? "Forgot Password"
                    : mode === "change-password"
                      ? "First Login"
                      : "Password Recovery"}
                </p>
                {mode === "change-password" ? (
                  <button
                    className="mt-2 text-xs font-medium text-zinc-400 transition hover:text-white"
                    onClick={() => void logout()}
                    type="button"
                  >
                    Sign out
                  </button>
                ) : (
                  <button
                    className="mt-2 text-xs font-medium text-zinc-400 transition hover:text-white"
                    onClick={() => switchMode("login")}
                    type="button"
                  >
                    ← Back to login
                  </button>
                )}
              </div>
            )}

            {mode === "register" ? (
              <>
                <RegistrationProgress current={registerStep} />
                <p className="mt-3 text-xs font-medium uppercase tracking-[0.14em] text-zinc-500 sm:hidden">
                  Step {registerStep} of 4
                </p>
              </>
            ) : null}

            <div className="mt-6">
              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-[1.75rem]">
                {heading}
              </h1>
              {description ? (
                <p className="mt-2 text-sm leading-6 text-zinc-400 sm:text-[0.95rem]">{description}</p>
              ) : null}
            </div>

            <form className="mt-8" onSubmit={handleSubmit}>
              {mode === "register" ? (
                <div className="space-y-5">
                  {registerStep === 1 ? (
                    <>
                      <AuthUsernameField
                        message={usernameCheckMessage}
                        onChange={handleUsernameChange}
                        status={usernameCheckStatus}
                        value={username}
                      />
                      <AuthField
                        autoComplete="email"
                        label="Email address"
                        onChange={setEmail}
                        placeholder="you@email.com"
                        required
                        type="email"
                        value={resolvedEmail}
                      />
                      <AuthPasswordField
                        autoComplete="new-password"
                        label="Password"
                        onChange={setPassword}
                        onToggleVisibility={() => setShowPassword((value) => !value)}
                        placeholder="At least 8 characters"
                        required
                        showPassword={showPassword}
                        value={password}
                      />
                      <AuthPasswordField
                        autoComplete="new-password"
                        fieldId="confirmPassword"
                        invalid={invalidField === "confirmPassword"}
                        label="Confirm password"
                        onChange={(value) => {
                          setConfirmPassword(value);
                          if (invalidField === "confirmPassword") setInvalidField(null);
                        }}
                        onToggleVisibility={() => setShowConfirmPassword((value) => !value)}
                        placeholder="Repeat your password"
                        required
                        showPassword={showConfirmPassword}
                        value={confirmPassword}
                      />
                    </>
                  ) : null}

                  {registerStep === 2 ? (
                    <>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <AuthField
                          autoComplete="given-name"
                          fieldId="firstName"
                          invalid={invalidField === "firstName"}
                          label="First name"
                          onChange={(value) => {
                            setFirstName(value);
                            if (invalidField === "firstName") setInvalidField(null);
                          }}
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
                          fieldId="lastName"
                          invalid={invalidField === "lastName"}
                          label="Last name"
                          onChange={(value) => {
                            setLastName(value);
                            if (invalidField === "lastName") setInvalidField(null);
                          }}
                          placeholder="Last name"
                          required
                          value={lastName}
                        />
                      </div>
                      <AuthGenderChoiceField
                        invalid={invalidField === "gender"}
                        label="Gender"
                        onChange={(value) => {
                          setGender(value);
                          if (invalidField === "gender") setInvalidField(null);
                        }}
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
                    </>
                  ) : null}

                  {registerStep === 3 ? (
                    <>
                      <AuthCountrySelectField
                        label="Country"
                        onChange={setCountry}
                        options={registrationCountryNames}
                        required
                        value={country}
                      />
                      <AuthPhoneField country={country} label="Phone" onChange={setPhone} value={phone} />
                      <AuthField
                        label="City / region"
                        onChange={setCity}
                        placeholder="Optional"
                        value={city}
                      />
                    </>
                  ) : null}

                  {registerStep === 4 ? (
                    <>
                      <ReviewGroup
                        onEdit={() => goToRegisterStep(1)}
                        rows={[
                          { label: "Username", value: username ? `@${username}` : "—" },
                          { label: "Email", value: email || "—" },
                        ]}
                        title="Account"
                      />
                      <ReviewGroup
                        onEdit={() => goToRegisterStep(2)}
                        rows={[
                          { label: "Name", value: reviewFullName },
                          { label: "Gender", value: gender || "—" },
                          { label: "Date of birth", value: dateOfBirth || "—" },
                        ]}
                        title="Profile"
                      />
                      <ReviewGroup
                        onEdit={() => goToRegisterStep(3)}
                        rows={[
                          { label: "Country", value: country || "—" },
                          { label: "Phone", value: reviewPhone },
                          { label: "City / region", value: city.trim() || "—" },
                        ]}
                        title="Contact"
                      />
                      <div className="border-t border-white/[0.06] pt-6">
                        <RegistrationLegalAcknowledgments
                          onChange={(next) => {
                            setAcceptedLegal(next);
                            if (registrationLegalIsComplete(next)) {
                              setShowLegalValidation(false);
                              if (invalidField === "legal") setInvalidField(null);
                            }
                          }}
                          showValidation={showLegalValidation}
                          value={acceptedLegal}
                        />
                      </div>
                    </>
                  ) : null}
                </div>
              ) : (
                <div className="space-y-4">
                  <AuthField
                    autoComplete="email"
                    label="Email address"
                    onChange={
                      (mode === "reset" || mode === "change-password") && user?.email
                        ? () => undefined
                        : setEmail
                    }
                    placeholder="you@email.com"
                    readOnly={
                      (mode === "reset" || mode === "change-password") &&
                      Boolean(user?.email || getPendingPasswordResetEmail())
                    }
                    required
                    type="email"
                    value={resolvedEmail}
                  />

                  {mode === "login" || mode === "reset" || mode === "change-password" ? (
                    <AuthPasswordField
                      autoComplete={mode === "login" ? "current-password" : "new-password"}
                      label={mode === "reset" || mode === "change-password" ? "New password" : "Password"}
                      onChange={setPassword}
                      onToggleVisibility={() => setShowPassword((value) => !value)}
                      placeholder={mode === "login" ? "Your password" : "At least 8 characters"}
                      required
                      showPassword={showPassword}
                      value={password}
                    />
                  ) : null}

                  {mode === "reset" || mode === "change-password" ? (
                    <AuthPasswordField
                      autoComplete="new-password"
                      fieldId="confirmPassword"
                      invalid={invalidField === "confirmPassword"}
                      label="Confirm password"
                      onChange={(value) => {
                        setConfirmPassword(value);
                        if (invalidField === "confirmPassword") setInvalidField(null);
                      }}
                      onToggleVisibility={() => setShowConfirmPassword((value) => !value)}
                      placeholder="Repeat your password"
                      required
                      showPassword={showConfirmPassword}
                      value={confirmPassword}
                    />
                  ) : null}

                  {mode === "login" ? (
                    <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
                      <label className="flex min-h-11 cursor-pointer items-center gap-2.5">
                        <input
                          checked={rememberMe}
                          className="h-4 w-4 rounded border-white/20 bg-transparent accent-[#FF1010] focus:ring-red-500/40"
                          onChange={(event) => {
                            const checked = event.target.checked;
                            setRememberMe(checked);
                            if (!checked) clearRememberedEmail();
                          }}
                          type="checkbox"
                        />
                        <span className="text-sm text-zinc-400">Remember my email on this device</span>
                      </label>
                      <button
                        className="inline-flex min-h-11 items-center text-left text-sm font-medium text-red-300 transition hover:text-white sm:text-right"
                        onClick={() => switchMode("forgot")}
                        type="button"
                      >
                        Forgot password?
                      </button>
                    </div>
                  ) : null}
                </div>
              )}

              {success ? (
                <p className="mt-6 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.08] px-4 py-3 text-sm text-emerald-200">
                  {success}
                </p>
              ) : null}
              {error ? (
                <p className="mt-6 rounded-xl border border-red-500/25 bg-red-500/[0.08] px-4 py-3 text-sm text-red-200">
                  {error}
                </p>
              ) : null}

              {mode === "register" ? (
                <div className="mt-8 space-y-3">
                  {registerStep < 4 ? (
                    <button
                      className="group inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#FF1010] px-6 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#ff2a2a] disabled:cursor-not-allowed disabled:opacity-55"
                      disabled={registerStep === 1 && usernameBlocksContinue}
                      onClick={continueRegisterStep}
                      type="button"
                    >
                      Continue
                      <ArrowRight className="ml-2 transition group-hover:translate-x-0.5" size={16} aria-hidden />
                    </button>
                  ) : (
                    <button
                      className="group inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#FF1010] px-6 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#ff2a2a] disabled:cursor-not-allowed disabled:opacity-55"
                      disabled={submitting || !registrationLegalIsComplete(acceptedLegal)}
                      type="submit"
                    >
                      {submitting ? "Please wait..." : "Create Account"}
                      <ArrowRight className="ml-2 transition group-hover:translate-x-0.5" size={16} aria-hidden />
                    </button>
                  )}

                  {registerStep > 1 ? (
                    <button
                      className="inline-flex min-h-11 w-full items-center justify-center text-sm font-medium text-zinc-400 transition hover:text-white"
                      onClick={() => goToRegisterStep((registerStep - 1) as RegisterStep)}
                      type="button"
                    >
                      ← Back
                    </button>
                  ) : (
                    <p className="text-center text-sm text-zinc-500">
                      Already have an account?{" "}
                      <button
                        className="font-medium text-red-200 transition hover:text-white"
                        onClick={() => switchMode("login")}
                        type="button"
                      >
                        Log in
                      </button>
                    </p>
                  )}
                </div>
              ) : (
                <button
                  className="group mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#FF1010] px-6 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#ff2a2a] disabled:cursor-not-allowed disabled:opacity-55"
                  disabled={submitting}
                  type="submit"
                >
                  {submitting
                    ? "Please wait..."
                    : mode === "forgot"
                      ? "Send Reset Link"
                      : mode === "reset" || mode === "change-password"
                        ? "Update Password"
                        : "Login"}
                  <ArrowRight className="ml-2 transition group-hover:translate-x-0.5" size={16} aria-hidden />
                </button>
              )}
            </form>
          </div>
          </MotionSection>

          <aside className="relative hidden min-h-[36rem] overflow-hidden rounded-[1.5rem] border border-white/[0.08] lg:block">
            <Image
              alt="Juego Todo fighters in competition"
              className="object-cover object-[center_35%]"
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 0px"
              src="/auth-fighters-background.png"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/30" />
            <div className="absolute inset-x-0 bottom-0 p-7">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#FF1010]">
                Juego Todo
              </p>
              <p className="mt-2 max-w-sm text-2xl font-semibold leading-tight tracking-tight text-white">
                The evolution of Filipino combat sports.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function RegistrationProgress({ current }: { current: RegisterStep }) {
  return (
    <nav aria-label="Registration progress" className="mt-5 hidden sm:block">
      <ol className="flex items-center gap-2">
        {REGISTER_STEPS.map((step, index) => {
          const active = step.id === current;
          const complete = step.id < current;
          return (
            <li className="flex min-w-0 flex-1 items-center gap-2" key={step.id}>
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.65rem] font-semibold ${
                    active
                      ? "bg-[#FF1010] text-white"
                      : complete
                        ? "bg-white/15 text-white"
                        : "bg-white/[0.06] text-zinc-500"
                  }`}
                >
                  {complete ? <Check size={12} aria-hidden /> : step.id}
                </span>
                <span
                  className={`truncate text-xs font-medium ${
                    active ? "text-white" : complete ? "text-zinc-300" : "text-zinc-500"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < REGISTER_STEPS.length - 1 ? (
                <span className="h-px flex-1 bg-white/10" aria-hidden />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function ReviewGroup({
  title,
  rows,
  onEdit,
}: {
  title: string;
  rows: Array<{ label: string; value: string }>;
  onEdit: () => void;
}) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-black/25 px-4 py-3.5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-zinc-500">{title}</p>
        <button
          className="text-xs font-medium text-red-200 transition hover:text-white"
          onClick={onEdit}
          type="button"
        >
          Edit
        </button>
      </div>
      <dl className="space-y-2">
        {rows.map((row) => (
          <div className="flex items-start justify-between gap-4" key={row.label}>
            <dt className="text-sm text-zinc-500">{row.label}</dt>
            <dd className="text-right text-sm text-zinc-200">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
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
    <div className="grid grid-cols-2 gap-1 rounded-xl border border-white/[0.08] bg-black/30 p-1">
      <button
        className={`min-h-10 rounded-lg px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] transition ${
          mode === "login"
            ? "bg-[#FF1010] text-white"
            : "text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-200"
        }`}
        onClick={onLogin}
        type="button"
      >
        Login
      </button>
      <button
        className={`min-h-10 rounded-lg px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] transition ${
          mode === "register"
            ? "bg-[#FF1010] text-white"
            : "text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-200"
        }`}
        onClick={onRegister}
        type="button"
      >
        Create Account
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
  const inputId = "auth-username";
  const statusId = "auth-username-status";
  const helpId = "auth-username-help";

  const statusTone =
    status === "available"
      ? "text-emerald-300"
      : status === "taken" || status === "invalid" || status === "error"
        ? "text-red-300"
        : "text-zinc-500";

  const borderTone =
    status === "available"
      ? "border-emerald-500/35 focus-within:border-emerald-500/50 focus-within:ring-emerald-500/15"
      : status === "taken" || status === "invalid" || status === "error"
        ? "border-red-500/40 focus-within:border-red-500/50 focus-within:ring-red-500/15"
        : "border-white/[0.08] focus-within:border-red-500/40 focus-within:ring-red-500/15";

  const displayMessage =
    status === "available"
      ? "Username is available"
      : status === "taken"
        ? "Username is already taken. Try another."
        : status === "checking"
          ? "Checking…"
          : status === "invalid" || status === "error"
            ? message
            : "";

  const statusLabel =
    status === "available"
      ? "Username is available"
      : status === "taken"
        ? "Username is unavailable"
        : status === "checking"
          ? "Checking username availability"
          : status === "invalid" || status === "error"
            ? message || "Username is invalid"
            : undefined;

  return (
    <div className="block" data-auth-field="username">
      <label className={authLabelClassName} htmlFor={inputId}>
        Username
      </label>
      <p className="mb-2 text-sm text-zinc-400">
        Choose your unique username. This is how people will find you on Juego Todo.
      </p>

      <div
        className={`flex min-h-12 items-center gap-2.5 rounded-xl border bg-black/40 px-4 transition focus-within:bg-black/55 focus-within:ring-2 ${borderTone}`}
      >
        <span aria-hidden className="select-none text-base font-medium text-zinc-500">
          @
        </span>
        <input
          aria-describedby={`${helpId}${displayMessage ? ` ${statusId}` : ""}`}
          aria-invalid={status === "taken" || status === "invalid" || status === "error" || undefined}
          autoComplete="username"
          className="min-w-0 flex-1 bg-transparent py-3 text-[0.95rem] text-white outline-none placeholder:text-zinc-600"
          id={inputId}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Arnisador"
          required
          spellCheck={false}
          value={value}
        />
        <span
          aria-hidden={status === "idle"}
          aria-label={statusLabel}
          className={`inline-flex min-w-[1.25rem] shrink-0 items-center justify-end transition-opacity duration-200 ${
            status === "idle" ? "opacity-0" : "opacity-100"
          }`}
          role={status === "idle" ? undefined : "status"}
        >
          {status === "checking" ? (
            <Loader2 className="animate-spin text-zinc-400" size={16} />
          ) : null}
          {status === "available" ? <Check className="text-emerald-300" size={16} /> : null}
          {status === "taken" || status === "invalid" || status === "error" ? (
            <X className="text-red-300" size={16} />
          ) : null}
        </span>
      </div>

      <div className="mt-2 space-y-1" aria-live="polite">
        {displayMessage ? (
          <p className={`text-sm leading-5 ${statusTone}`} id={statusId}>
            {displayMessage}
          </p>
        ) : null}
        <p className="text-xs leading-5 text-zinc-500" id={helpId}>
          6–20 characters · Letters, numbers, and underscores
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
        <div className="flex min-w-[4.75rem] shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-black/40 px-3 py-3.5 text-sm font-medium text-zinc-200">
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
      <p className="mt-2 text-xs text-zinc-500">Country code is added automatically from your selected country.</p>
    </label>
  );
}

function AuthGenderChoiceField({
  label,
  value,
  onChange,
  options,
  required = false,
  invalid = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  required?: boolean;
  invalid?: boolean;
}) {
  return (
    <fieldset
      className={`block ${invalid ? "rounded-xl ring-2 ring-red-500/35" : ""}`}
      data-auth-field="gender"
    >
      <legend className={authLabelClassName}>
        {label}
        {required ? <span className="text-red-400"> *</span> : null}
      </legend>
      <div
        aria-label={label}
        className="grid grid-cols-1 gap-2 sm:grid-cols-3"
        role="radiogroup"
      >
        {options.map((option) => {
          const selected = value === option;

          return (
            <button
              aria-checked={selected}
              className={`min-h-11 rounded-xl border px-3 py-3 text-center text-sm font-medium leading-snug transition ${
                selected
                  ? "border-[#FF1010]/50 bg-[#FF1010]/10 text-white"
                  : invalid
                    ? "border-red-500/30 bg-transparent text-zinc-300 hover:border-red-400/45"
                    : "border-white/10 bg-transparent text-zinc-300 hover:border-white/20 hover:text-white"
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
      {invalid ? (
        <p className="mt-2 text-xs text-red-300">Select Male, Female, or Prefer not to say.</p>
      ) : null}
      {required ? (
        <input aria-hidden className="sr-only" readOnly required tabIndex={-1} value={value} />
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
  fieldId,
  invalid = false,
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
  fieldId?: string;
  invalid?: boolean;
}) {
  return (
    <label className="block" data-auth-field={fieldId}>
      <span className={authLabelClassName}>{label}</span>
      <input
        autoComplete={autoComplete}
        className={`${authInputClassName}${type === "date" ? " [color-scheme:dark]" : ""}${
          invalid ? " border-red-500/50 ring-2 ring-red-500/25" : ""
        }`}
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
  fieldId,
  invalid = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  autoComplete?: string;
  showPassword: boolean;
  onToggleVisibility: () => void;
  fieldId?: string;
  invalid?: boolean;
}) {
  return (
    <label className="block" data-auth-field={fieldId}>
      <span className={authLabelClassName}>{label}</span>
      <div className="relative">
        <input
          autoComplete={autoComplete}
          className={`${authInputClassName} pr-12${invalid ? " border-red-500/50 ring-2 ring-red-500/25" : ""}`}
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
