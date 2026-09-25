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
  "font-semibold text-red-200 underline-offset-2 transition hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black";

const checkboxClassName =
  "mt-0.5 h-4 w-4 shrink-0 rounded border-white/25 bg-black/60 accent-[#FF1010] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black";

function LegalCheckbox({
  checked,
  onChange,
  title,
  children,
  invalid,
  optional,
  fieldId,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  children: ReactNode;
  invalid?: boolean;
  optional?: boolean;
  fieldId: string;
}) {
  const inputId = useId();

  return (
    <div
      className={`rounded-2xl border px-4 py-3.5 transition ${
        invalid
          ? "border-red-500/50 bg-red-500/10 ring-2 ring-red-500/25"
          : "border-white/[0.08] bg-black/35"
      }`}
      data-auth-field={fieldId}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-zinc-500">{title}</p>
        {optional ? (
          <span className="text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-zinc-600">
            Optional
          </span>
        ) : null}
      </div>
      <label className="flex cursor-pointer items-start gap-3" htmlFor={inputId}>
        <input
          aria-invalid={invalid || undefined}
          checked={checked}
          className={checkboxClassName}
          id={inputId}
          onChange={(event) => onChange(event.target.checked)}
          type="checkbox"
        />
        <span className="text-sm leading-6 text-zinc-300">{children}</span>
      </label>
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

  function update<K extends keyof RegistrationLegalState>(key: K, nextValue: RegistrationLegalState[K]) {
    onChange({ ...value, [key]: nextValue });
  }

  return (
    <section aria-labelledby="registration-legal-heading" className="space-y-4" data-auth-field="legal">
      <div>
        <p
          className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-zinc-500"
          id="registration-legal-heading"
        >
          Before you continue
        </p>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Make sure your information is accurate and review how your account information is handled.
        </p>
      </div>

      <div className="space-y-3">
        <LegalCheckbox
          checked={value.accuracyConfirmed}
          fieldId="accuracyConfirmed"
          invalid={showValidation && !value.accuracyConfirmed}
          onChange={(checked) => update("accuracyConfirmed", checked)}
          title="Information accuracy"
        >
          I confirm that the information I provide is accurate and complete.
        </LegalCheckbox>

        <LegalCheckbox
          checked={value.privacyAcknowledged}
          fieldId="privacyAcknowledged"
          invalid={showValidation && !value.privacyAcknowledged}
          onChange={(checked) => update("privacyAcknowledged", checked)}
          title="Privacy"
        >
          I have read and understood the{" "}
          <Link
            className={linkClassName}
            href="/privacy"
            onClick={(event) => event.stopPropagation()}
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </Link>{" "}
          and understand how Juego Todo handles my personal information.
        </LegalCheckbox>

        <LegalCheckbox
          checked={value.termsAccepted}
          fieldId="termsAccepted"
          invalid={showValidation && !value.termsAccepted}
          onChange={(checked) => update("termsAccepted", checked)}
          title="Terms"
        >
          I agree to the{" "}
          <Link
            className={linkClassName}
            href="/terms"
            onClick={(event) => event.stopPropagation()}
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms of Service
          </Link>
          .
        </LegalCheckbox>
      </div>

      <div className="border-t border-white/[0.06] pt-4">
        <LegalCheckbox
          checked={value.marketingOptIn}
          fieldId="marketingOptIn"
          onChange={(checked) => update("marketingOptIn", checked)}
          optional
          title="Communications"
        >
          I&apos;d like to receive updates about Juego Todo events, competitions, membership and announcements.
        </LegalCheckbox>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-black/25">
        <button
          aria-controls={detailsId}
          aria-expanded={privacyOpen}
          className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition hover:bg-white/[0.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-500/40"
          onClick={() => setPrivacyOpen((open) => !open)}
          type="button"
        >
          <span>
            <span className="block text-[0.62rem] font-black uppercase tracking-[0.18em] text-zinc-500">
              Your privacy matters
            </span>
            <span className="mt-1 block text-sm text-zinc-300">How we handle your information</span>
          </span>
          <ChevronDown
            aria-hidden
            className={`shrink-0 text-zinc-500 transition ${privacyOpen ? "rotate-180" : ""}`}
            size={18}
          />
        </button>

        {privacyOpen ? (
          <div className="space-y-4 border-t border-white/[0.06] px-4 py-4" id={detailsId}>
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

      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
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
        <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200" role="alert">
          Please complete the required confirmations before continuing.
        </p>
      ) : null}
    </section>
  );
}
