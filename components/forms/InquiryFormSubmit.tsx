"use client";

import { useState } from "react";
import type { InquiryInput, InquiryType } from "@/lib/platform/inquiries";

type InquiryFormProps = {
  inquiryType: InquiryType;
  subjectDefault?: string;
  organizationLabel?: string;
  submitLabel: string;
  className?: string;
  metadata?: Record<string, unknown>;
  children?: React.ReactNode;
};

export function InquiryFormSubmit({
  inquiryType,
  subjectDefault = "",
  organizationLabel = "Organization",
  submitLabel,
  className = "",
  metadata,
  children,
}: InquiryFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [organization, setOrganization] = useState("");
  const [subject, setSubject] = useState(subjectDefault);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    const payload: InquiryInput = {
      inquiryType,
      fullName,
      email,
      phone,
      organization,
      subject,
      message,
      metadata,
    };

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(body.error || "Unable to submit inquiry.");
      }
      setSuccess("Thank you — your inquiry was received. We will respond shortly.");
      setMessage("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to submit inquiry.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className={className} onSubmit={(event) => void handleSubmit(event)}>
      {children}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-1">
          <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-zinc-400">Full name</span>
          <input
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none ring-red-500/30 focus:ring-2"
            onChange={(event) => setFullName(event.target.value)}
            required
            value={fullName}
          />
        </label>
        <label className="block sm:col-span-1">
          <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-zinc-400">Email</span>
          <input
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none ring-red-500/30 focus:ring-2"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>
        <label className="block sm:col-span-1">
          <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-zinc-400">Phone</span>
          <input
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none ring-red-500/30 focus:ring-2"
            onChange={(event) => setPhone(event.target.value)}
            value={phone}
          />
        </label>
        <label className="block sm:col-span-1">
          <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-zinc-400">{organizationLabel}</span>
          <input
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none ring-red-500/30 focus:ring-2"
            onChange={(event) => setOrganization(event.target.value)}
            value={organization}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-zinc-400">Subject</span>
          <input
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none ring-red-500/30 focus:ring-2"
            onChange={(event) => setSubject(event.target.value)}
            value={subject}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-zinc-400">Message</span>
          <textarea
            className="min-h-32 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none ring-red-500/30 focus:ring-2"
            onChange={(event) => setMessage(event.target.value)}
            required
            value={message}
          />
        </label>
      </div>
      {success ? <p className="mt-4 text-sm text-emerald-300">{success}</p> : null}
      {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
      <button
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#FF1010] px-6 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:bg-[#ff2828] disabled:opacity-60"
        disabled={submitting}
        type="submit"
      >
        {submitting ? "Submitting..." : submitLabel}
      </button>
    </form>
  );
}
