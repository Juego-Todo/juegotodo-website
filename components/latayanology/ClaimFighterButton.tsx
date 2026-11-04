"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth/context";

type ClaimFighterButtonProps = {
  fighterId: string;
  fighterName: string;
  slug: string;
  isMinor: boolean;
  inviteToken?: string;
  acceptIntent?: boolean;
};

type InvitePreview = {
  invitedEmail: string;
  expiresAt: string;
  used: boolean;
  expired: boolean;
  isMinor: boolean;
  valid: boolean;
  claimStatus: string;
};

function emailsMatch(a: string | null | undefined, b: string | null | undefined) {
  return Boolean(a && b && a.trim().toLowerCase() === b.trim().toLowerCase());
}

export function ClaimFighterButton({
  fighterId,
  fighterName,
  slug,
  isMinor,
  inviteToken = "",
  acceptIntent = false,
}: ClaimFighterButtonProps) {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [invitePreview, setInvitePreview] = useState<InvitePreview | null>(null);
  const [inviteLoading, setInviteLoading] = useState(Boolean(inviteToken));

  const returnPath = inviteToken
    ? `/latayanology/fighters/${slug}?invite=${encodeURIComponent(inviteToken)}&accept=1`
    : `/latayanology/fighters/${slug}`;

  useEffect(() => {
    if (!inviteToken) {
      setInvitePreview(null);
      setInviteLoading(false);
      return;
    }

    let active = true;
    setInviteLoading(true);
    void fetch(`/api/fighters/${fighterId}/claim-invites?token=${encodeURIComponent(inviteToken)}`)
      .then(async (response) => {
        const payload = (await response.json().catch(() => null)) as
          | (InvitePreview & { error?: string })
          | null;
        if (!active) return;
        if (!response.ok || !payload?.invitedEmail) {
          setInvitePreview(null);
          setError(payload?.error || "This invite link is invalid.");
          return;
        }
        setInvitePreview(payload);
        setError("");
      })
      .catch(() => {
        if (active) {
          setInvitePreview(null);
          setError("Unable to load this invite.");
        }
      })
      .finally(() => {
        if (active) setInviteLoading(false);
      });

    return () => {
      active = false;
    };
  }, [fighterId, inviteToken]);

  async function acceptInvite() {
    if (!inviteToken) return;
    setSubmitting(true);
    setError("");
    const response = await fetch(`/api/fighters/${fighterId}/claim-invites/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: inviteToken }),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string; message?: string } | null;
    setSubmitting(false);
    if (!response.ok) {
      setError(payload?.error || "Unable to accept invite.");
      return;
    }
    setMessage(payload?.message || "Claim accepted. Your Latayanology profile is linked.");
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

  if (loading || inviteLoading) {
    return <div className="h-11 w-36 animate-pulse rounded-full bg-white/5" />;
  }

  if (message) {
    return <p className="max-w-md text-sm leading-6 text-emerald-200">{message}</p>;
  }

  const inviteEmail = invitePreview?.invitedEmail ?? "";
  const inviteValid = Boolean(invitePreview?.valid);
  const matchingEmail = emailsMatch(user?.email, inviteEmail);
  const showInviteAccept = Boolean(inviteToken && inviteValid && !isMinor);
  const showInviteGuardian = Boolean(inviteToken && inviteValid && isMinor && matchingEmail);

  if (inviteToken && invitePreview && !inviteValid) {
    return (
      <p className="max-w-md text-sm leading-6 text-amber-200">
        {invitePreview.used
          ? "This invite has already been used."
          : invitePreview.expired
            ? "This invite has expired. Ask an admin to resend it."
            : "This fighter is no longer available to claim with this invite."}
      </p>
    );
  }

  if (inviteToken && !user) {
    return (
      <div className="space-y-3">
        <p className="max-w-md text-sm leading-6 text-zinc-300">
          {inviteEmail
            ? `You were invited to claim ${fighterName}. Sign in or create an account with ${inviteEmail}.`
            : `You were invited to claim ${fighterName}. Sign in or create an account to continue.`}
        </p>
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#FF1010] px-5 text-[0.68rem] font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#ff2828]"
          href={`/login?next=${encodeURIComponent(returnPath)}`}
        >
          Sign in to accept
        </Link>
        {error ? <p className="text-sm text-red-200">{error}</p> : null}
      </div>
    );
  }

  if (inviteToken && inviteValid && user && !matchingEmail) {
    return (
      <div className="space-y-3">
        <p className="max-w-md text-sm leading-6 text-amber-100">
          This invite is for {inviteEmail}. You are signed in as {user.email}. Switch accounts to accept.
        </p>
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/10 px-5 text-[0.68rem] font-black uppercase tracking-[0.16em] text-zinc-200"
          href={`/login?next=${encodeURIComponent(returnPath)}`}
        >
          Switch account
        </Link>
      </div>
    );
  }

  if (showInviteAccept && user && matchingEmail) {
    return (
      <div className="space-y-3">
        <p className="max-w-md text-sm leading-6 text-zinc-300">
          {acceptIntent
            ? `Accept the invitation to link ${fighterName} to your account.`
            : `You have a claim invitation for ${fighterName}. Accept to link this Latayanology record.`}
        </p>
        {error ? <p className="text-sm text-red-200">{error}</p> : null}
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#FF1010] px-5 text-[0.68rem] font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#ff2828] disabled:opacity-60"
          disabled={submitting}
          onClick={() => void acceptInvite()}
          type="button"
        >
          {submitting ? "Accepting..." : "Accept invitation"}
        </button>
      </div>
    );
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

  return (
    <div className="space-y-3">
      {showInviteGuardian ? (
        <p className="max-w-md text-sm leading-6 text-zinc-300">
          This invite is for guardian access to {fighterName}. Submit your relationship and proof below.
        </p>
      ) : null}
      <button
        className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#FF1010] px-5 text-[0.68rem] font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#ff2828]"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        {showInviteGuardian ? "Submit guardian request" : "This is me"}
      </button>
      {open || showInviteGuardian ? (
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
