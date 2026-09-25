"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useId, useState, type ReactNode } from "react";
import { legalPages } from "@/data/legal-pages";

export type RegistrationLegalState = {
  accuracyConfirmed: boolean;
  privacyAcknowledged: boolean;
  termsAccepted: boolean;
  marketingOptIn: boolean;
};

export function registrationLegalIsComplete(state: RegistrationLegalState) {
  return state.accuracyConfirmed && state.privacyAcknowledged && state.termsAccepted;
}

const privacySummary = legalPages.privacy.sections
  .filter((section) => section.id !== "overview")
  .map((section) => ({
    id: section.id,
    title: section.title,
    bullets: section.bullets ?? section.paragraphs ?? [],
  }));

const linkClassName =
  "font-medium text-red-200 underline-offset-2 transition hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black";

const checkboxClassName =
  "mt-0.5 h-4 w-4 shrink-0 rounded border-white/25 bg-transparent accent-[#FF1010] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black";

function ConsentRow({
  checked,
  onChange,
  children,
  invalid,
  fieldId,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  invalid?: boolean;
  fieldId: string;
}) {
  const inputId = useId();

  return (
    <div data-auth-field={fieldId}>
      <label
        className={`flex cursor-pointer items-start gap-3 rounded-lg py-1 ${
          invalid ? "text-red-100" : "text-zinc-300"
        }`}
        htmlFor={inputId}
      >
        <input
          aria-invalid={invalid || undefined}
          checked={checked}
          className={checkboxClassName}
          id={inputId}
          onChange={(event) => onChange(event.target.checked)}
          type="checkbox"
        />
        <span className="text-sm leading-6">{children}</span>
      </label>
      {invalid ? (
        <p className="mt-1 pl-7 text-xs text-red-300">This confirmation is required.</p>
      ) : null}
    </div>
  );
}

export function RegistrationLegalAcknowledgments({
  value,
  onChange,
  showValidation,
}: {
  value: RegistrationLegalState;
  onChange: (next: RegistrationLegalState) => void;
  showValidation: boolean;
}) {
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const detailsId = useId();
  const incomplete = showValidation && !registrationLegalIsComplete(value);
  const missingCount = [
    value.accuracyConfirmed,
    value.privacyAcknowledged,
    value.termsAccepted,
  ].filter((entry) => !entry).length;

  function update<K extends keyof RegistrationLegalState>(key: K, nextValue: RegistrationLegalState[K]) {
    onChange({ ...value, [key]: nextValue });
  }

  return (
    <section aria-labelledby="registration-legal-heading" className="space-y-5" data-auth-field="legal">
      <div>
        <h2
          className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-zinc-500"
          id="registration-legal-heading"
        >
          Legal & privacy
        </h2>
        <p className="mt-1.5 text-sm leading-6 text-zinc-500">
          Before creating your account, please review the information below.
        </p>
      </div>

      <div className="space-y-4">
        <ConsentRow
          checked={value.accuracyConfirmed}
          fieldId="accuracyConfirmed"
          invalid={showValidation && !value.accuracyConfirmed}
          onChange={(checked) => update("accuracyConfirmed", checked)}
        >
          I confirm that the information I provide is accurate and complete.
        </ConsentRow>

        <ConsentRow
          checked={value.privacyAcknowledged}
          fieldId="privacyAcknowledged"
          invalid={showValidation && !value.privacyAcknowledged}
          onChange={(checked) => update("privacyAcknowledged", checked)}
        >
          I have read and understood the{" "}
          <Link
            className={linkClassName}
            href="/privacy"
            onClick={(event) => event.stopPropagation()}
            rel="noopener noreferrer"
            target="_blank"
          >
            Privacy Policy
          </Link>{" "}
          and understand how Juego Todo handles my personal information.
        </ConsentRow>

        <ConsentRow
          checked={value.termsAccepted}
          fieldId="termsAccepted"
          invalid={showValidation && !value.termsAccepted}
          onChange={(checked) => update("termsAccepted", checked)}
        >
          I agree to the{" "}
          <Link
            className={linkClassName}
            href="/terms"
            onClick={(event) => event.stopPropagation()}
            rel="noopener noreferrer"
            target="_blank"
          >
            Terms of Service
          </Link>
          .
        </ConsentRow>
      </div>

      <div className="border-t border-white/[0.06] pt-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Communications
          </p>
          <span className="text-[0.58rem] font-medium uppercase tracking-[0.12em] text-zinc-600">
            Optional
          </span>
        </div>
        <ConsentRow
          checked={value.marketingOptIn}
          fieldId="marketingOptIn"
          onChange={(checked) => update("marketingOptIn", checked)}
        >
          I&apos;d like to receive updates about Juego Todo events, competitions, membership and announcements.
        </ConsentRow>
      </div>

      <div>
        <button
          aria-controls={detailsId}
          aria-expanded={privacyOpen}
          className="flex w-full items-center justify-between gap-3 py-1 text-left transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          onClick={() => setPrivacyOpen((open) => !open)}
          type="button"
        >
          <span>
            <span className="block text-sm font-medium text-zinc-300">Your privacy matters</span>
            <span className="mt-0.5 block text-sm text-zinc-500">How we handle your information</span>
          </span>
          <ChevronDown
            aria-hidden
            className={`shrink-0 text-zinc-500 transition ${privacyOpen ? "rotate-180" : ""}`}
            size={16}
          />
        </button>

        {privacyOpen ? (
          <div className="mt-3 space-y-4 border-t border-white/[0.06] pt-4" id={detailsId}>
            {privacySummary.map((section) => (
              <div key={section.id}>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  {section.title}
                </p>
                <ul className="mt-2 space-y-1.5 text-sm leading-6 text-zinc-400">
                  {section.bullets.map((item) => (
                    <li className="flex gap-2" key={item}>
                      <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-zinc-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <p className="text-sm text-zinc-500">
              Full details are in the{" "}
              <Link className={linkClassName} href="/privacy">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
        <Link className={linkClassName} href="/privacy">
          Privacy Policy →
        </Link>
        <Link className={linkClassName} href="/terms">
          Terms of Service →
        </Link>
        <Link className={linkClassName} href="/cookies">
          Cookie Policy →
        </Link>
      </div>

      {incomplete ? (
        <p className="text-sm text-red-300" role="alert">
          Please complete the {missingCount} required confirmation{missingCount === 1 ? "" : "s"} before
          continuing.
        </p>
      ) : null}
    </section>
  );
}
