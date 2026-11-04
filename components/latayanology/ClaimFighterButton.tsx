"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth/context";

type ClaimFighterButtonProps = {
  fighterId: string;
  fighterName: string;
  slug: string;
  isMinor: boolean;
  inviteToken?: string;
};

export function ClaimFighterButton({ fighterId, fighterName, slug, isMinor, inviteToken = "" }: ClaimFighterButtonProps) {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const returnPath = `/latayanology/fighters/${slug}`;

  if (loading) {
    return <div className="h-11 w-36 animate-pulse rounded-full bg-white/5" />;
  }

  if (!user) {
    return (
      <Link
        className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#FF1010] px-5 text-[0.68rem] font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#ff2828]"
        href={`/login?next=${encodeURIComponent(returnPath)}`}
      >
        This is me
      </Link>
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const response = await fetch(`/api/fighters/${fighterId}/claims`, {
      method: "POST",
      body: formData,
    });
    const payload = (await response.json().catch(() => null)) as { error?: string; message?: string } | null;
    setSubmitting(false);
    if (!response.ok) {
      setError(payload?.error || "Unable to submit.");
      return;
    }
    setMessage(payload?.message || "Submitted for review.");
    setOpen(false);
  }

  if (message) {
    return <p className="max-w-md text-sm leading-6 text-emerald-200">{message}</p>;
  }

  return (
    <div className="space-y-3">
      <button
        className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#FF1010] px-5 text-[0.68rem] font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#ff2828]"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        This is me
      </button>
      {open ? (
        <form className="glass-panel max-w-xl space-y-3 rounded-[1.25rem] p-4" onSubmit={onSubmit}>
          <p className="text-sm leading-6 text-zinc-300">
            {isMinor
              ? `${fighterName} is a youth athlete. A direct claim is not available. Submit a guardian request with your relationship and proof.`
              : `Upload evidence that the ${fighterName} record belongs to you. An admin will review it.`}
          </p>
          {inviteToken ? <input name="inviteToken" type="hidden" value={inviteToken} /> : null}
          {isMinor ? (
            <label className="block text-sm text-zinc-300">
              Relationship
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-white outline-none ring-[#FF1010]/30 focus:ring-2"
                name="relationship"
                placeholder="Parent or legal guardian"
                required
              />
            </label>
          ) : null}
          <label className="block text-sm text-zinc-300">
            {isMinor ? "Proof" : "Evidence"}
            <input
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="mt-2 block w-full text-sm text-zinc-300 file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-xs file:font-black file:uppercase file:tracking-[0.12em] file:text-white"
              name="file"
              required
              type="file"
            />
          </label>
          {error ? <p className="text-sm text-red-200">{error}</p> : null}
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#FF1010]/40 px-5 text-[0.68rem] font-black uppercase tracking-[0.16em] text-white disabled:opacity-60"
            disabled={submitting}
            type="submit"
          >
            {submitting ? "Submitting..." : isMinor ? "Submit guardian request" : "Submit claim"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
