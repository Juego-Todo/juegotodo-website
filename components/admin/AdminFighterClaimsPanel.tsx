"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { adminFetch } from "@/lib/auth/admin-fetch";

type ClaimRow = {
  id: string;
  fighterId: string;
  fighterName: string;
  fighterSlug: string;
  isMinor: boolean;
  memberName: string;
  memberEmail: string;
  evidencePath: string;
  note: string;
  createdAt: string;
};

type GuardianRow = {
  id: string;
  fighterId: string;
  fighterName: string;
  fighterSlug: string;
  relationship: string;
  status: string;
  proofPath: string;
  note: string;
  guardianName: string;
  guardianEmail: string;
  createdAt: string;
};

type InviteRow = {
  id: string;
  fighterId: string;
  fighterName: string;
  fighterSlug: string;
  isMinor: boolean;
  invitedEmail: string;
  invitedUserId: string | null;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
  isPlaceholder?: boolean;
  status: "pending" | "used" | "expired" | "needs_email" | string;
};

type FighterOption = {
  id: string;
  slug: string;
  displayName: string;
  nickname: string;
  gym: string;
  claimStatus: string;
  isMinor: boolean;
};

const fieldClassName =
  "w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none ring-[#FF1010]/30 placeholder:text-zinc-500 focus:ring-2";

export function AdminFighterClaimsPanel() {
  const [claims, setClaims] = useState<ClaimRow[]>([]);
  const [guardians, setGuardians] = useState<GuardianRow[]>([]);
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [busyId, setBusyId] = useState("");
  const [inviteBusy, setInviteBusy] = useState(false);

  const [fighterQuery, setFighterQuery] = useState("");
  const [fighterResults, setFighterResults] = useState<FighterOption[]>([]);
  const [fighterSearchLoading, setFighterSearchLoading] = useState(false);
  const [selectedFighter, setSelectedFighter] = useState<FighterOption | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [emailDrafts, setEmailDrafts] = useState<Record<string, string>>({});

  const refresh = useCallback(() => {
    setLoaded(false);
    void Promise.all([
      adminFetch("/api/admin/fighter-claims").then(async (response) => {
        const payload = (await response.json().catch(() => null)) as { error?: string; claims?: ClaimRow[] } | null;
        if (!response.ok) throw new Error(payload?.error || "Unable to load claims.");
        return payload?.claims ?? [];
      }),
      adminFetch("/api/admin/fighter-guardians").then(async (response) => {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
          guardians?: GuardianRow[];
        } | null;
        if (!response.ok) throw new Error(payload?.error || "Unable to load guardians.");
        return payload?.guardians ?? [];
      }),
      adminFetch("/api/admin/fighter-claim-invites?view=invites").then(async (response) => {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
          invites?: InviteRow[];
        } | null;
        if (!response.ok) throw new Error(payload?.error || "Unable to load invites.");
        return payload?.invites ?? [];
      }),
    ])
      .then(([nextClaims, nextGuardians, nextInvites]) => {
        setClaims(nextClaims);
        setGuardians(nextGuardians);
        setInvites(nextInvites);
        setError("");
      })
      .catch((caught: unknown) => {
        setError(caught instanceof Error ? caught.message : "Unable to load the review queue.");
      })
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => refresh(), 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  useEffect(() => {
    if (selectedFighter) return;
    const timer = window.setTimeout(() => {
      setFighterSearchLoading(true);
      void adminFetch(
        `/api/admin/fighter-claim-invites?view=fighters&q=${encodeURIComponent(fighterQuery)}`,
      )
        .then(async (response) => {
          const payload = (await response.json().catch(() => null)) as {
            error?: string;
            fighters?: FighterOption[];
          } | null;
          if (!response.ok) throw new Error(payload?.error || "Unable to search fighters.");
          setFighterResults(payload?.fighters ?? []);
        })
        .catch(() => setFighterResults([]))
        .finally(() => setFighterSearchLoading(false));
    }, 220);
    return () => window.clearTimeout(timer);
  }, [fighterQuery, selectedFighter]);

  async function updateClaim(id: string, action: "approve" | "reject") {
    setBusyId(id);
    setStatus("");
    setError("");
    const response = await adminFetch("/api/admin/fighter-claims", {
      method: "PATCH",
      body: JSON.stringify({ id, action }),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    setBusyId("");
    if (!response.ok) {
      setError(payload?.error || "Unable to update claim.");
      return;
    }
    setStatus(action === "approve" ? "Claim approved and fighter linked." : "Claim rejected.");
    refresh();
  }

  async function updateGuardian(id: string, action: "approve" | "revoke") {
    setBusyId(id);
    setStatus("");
    setError("");
    const response = await adminFetch("/api/admin/fighter-guardians", {
      method: "PATCH",
      body: JSON.stringify({ id, action }),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    setBusyId("");
    if (!response.ok) {
      setError(payload?.error || "Unable to update guardian.");
      return;
    }
    setStatus(action === "approve" ? "Guardian approved." : "Guardian access revoked.");
    refresh();
  }

  async function sendInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedFighter) {
      setError("Select a fighter first.");
      return;
    }
    setInviteBusy(true);
    setStatus("");
    setError("");
    const response = await adminFetch("/api/admin/fighter-claim-invites", {
      method: "POST",
      body: JSON.stringify({
        action: "create",
        fighterId: selectedFighter.id,
        email: inviteEmail.trim() || undefined,
      }),
    });
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
      message?: string;
      sentTo?: string;
      isPlaceholder?: boolean;
    } | null;
    setInviteBusy(false);
    if (!response.ok) {
      setError(payload?.error || "Unable to provision fighter account.");
      return;
    }
    setStatus(payload?.message || `Account ready for ${payload?.sentTo || selectedFighter.displayName}.`);
    setInviteEmail("");
    setSelectedFighter(null);
    refresh();
  }

  async function resendInvite(invite: InviteRow) {
    if (invite.isPlaceholder || invite.status === "needs_email") {
      setError("Add a real email before sending the invite.");
      return;
    }
    setInviteBusy(true);
    setStatus("");
    setError("");
    const response = await adminFetch("/api/admin/fighter-claim-invites", {
      method: "POST",
      body: JSON.stringify({ action: "create", fighterId: invite.fighterId, email: invite.invitedEmail }),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string; message?: string } | null;
    setInviteBusy(false);
    if (!response.ok) {
      setError(payload?.error || "Unable to resend invite.");
      return;
    }
    setStatus(payload?.message || "Invite resent.");
    refresh();
  }

  async function assignEmail(invite: InviteRow) {
    const email = (emailDrafts[invite.id] || "").trim();
    if (!email) {
      setError("Enter a real email for this fighter.");
      return;
    }
    setInviteBusy(true);
    setStatus("");
    setError("");
    const response = await adminFetch("/api/admin/fighter-claim-invites", {
      method: "POST",
      body: JSON.stringify({ action: "assign_email", inviteId: invite.id, email }),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string; message?: string } | null;
    setInviteBusy(false);
    if (!response.ok) {
      setError(payload?.error || "Unable to assign email.");
      return;
    }
    setStatus(payload?.message || "Email assigned and invite sent.");
    setEmailDrafts((current) => {
      const next = { ...current };
      delete next[invite.id];
      return next;
    });
    refresh();
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</div>
      ) : null}
      {status ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {status}
        </div>
      ) : null}

      <form className="rounded-[1.5rem] border border-white/10 bg-white/[0.02] p-4" onSubmit={sendInvite}>
        <h3 className="text-sm font-black uppercase tracking-[0.16em] text-white">Provision fighter account</h3>
        <p className="mt-2 text-sm text-zinc-400">
          Creates the website login now. Leave email blank to use a placeholder and fill the real address later.
          With a real email, we also send the login + claim invite immediately.
        </p>

        <div className="mt-4 space-y-3">
          {selectedFighter ? (
            <div className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 px-3 py-3">
              <div className="min-w-0">
                <p className="font-semibold text-white">{selectedFighter.displayName}</p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {selectedFighter.claimStatus}
                  {selectedFighter.isMinor ? " · minor" : ""} · {selectedFighter.gym || "Independent"}
                </p>
              </div>
              <button
                className="rounded-full border border-white/10 px-3 py-1.5 text-[0.55rem] font-black uppercase tracking-[0.12em] text-zinc-400"
                onClick={() => setSelectedFighter(null)}
                type="button"
              >
                Change
              </button>
            </div>
          ) : (
            <label className="block">
              <span className="mb-1.5 block text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">
                Fighter
              </span>
              <input
                className={fieldClassName}
                onChange={(event) => setFighterQuery(event.target.value)}
                placeholder="Search Latayanology fighters..."
                value={fighterQuery}
              />
              <div className="mt-2 max-h-44 space-y-1 overflow-y-auto">
                {fighterSearchLoading ? <p className="px-2 py-2 text-xs text-zinc-500">Searching...</p> : null}
                {!fighterSearchLoading && fighterResults.length === 0 ? (
                  <p className="px-2 py-2 text-xs text-zinc-500">No fighters found.</p>
                ) : null}
                {fighterResults.map((fighter) => (
                  <button
                    className="flex w-full items-center justify-between gap-2 rounded-xl border border-transparent px-2 py-2 text-left hover:border-white/10 hover:bg-white/[0.03]"
                    key={fighter.id}
                    onClick={() => {
                      setSelectedFighter(fighter);
                      setFighterQuery("");
                    }}
                    type="button"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-white">{fighter.displayName}</span>
                      <span className="block truncate text-xs text-zinc-500">
                        {fighter.claimStatus}
                        {fighter.isMinor ? " · minor" : ""} · {fighter.gym || "Independent"}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </label>
          )}

          <label className="block">
            <span className="mb-1.5 block text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">
              {selectedFighter?.isMinor ? "Guardian email (optional)" : "Fighter email (optional)"}
            </span>
            <input
              className={fieldClassName}
              onChange={(event) => setInviteEmail(event.target.value)}
              placeholder="Leave blank for placeholder — add real email later"
              type="email"
              value={inviteEmail}
            />
          </label>
        </div>

        <button
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-[#FF1010] px-5 text-[0.68rem] font-black uppercase tracking-[0.14em] text-white disabled:opacity-60"
          disabled={inviteBusy || !selectedFighter}
          type="submit"
        >
          {inviteBusy
            ? "Provisioning..."
            : inviteEmail.trim()
              ? "Create account & send invite"
              : "Create placeholder account"}
        </button>
      </form>

      <section className="space-y-3">
        <h3 className="text-sm font-black uppercase tracking-[0.16em] text-white">Accounts & invites</h3>
        {!loaded ? <p className="text-sm text-zinc-400">Loading invites...</p> : null}
        {loaded && invites.length === 0 ? (
          <p className="text-sm text-zinc-400">No fighter accounts provisioned yet.</p>
        ) : null}
        {invites.map((invite) => (
          <article className="rounded-[1.35rem] border border-white/10 bg-black/30 p-4" key={invite.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-white">{invite.fighterName}</p>
                <p className="mt-1 text-sm text-zinc-400">
                  {invite.isPlaceholder || invite.status === "needs_email"
                    ? "Placeholder email — waiting for real address"
                    : invite.invitedEmail}
                  {invite.isMinor ? " · minor / guardian" : ""}
                </p>
                <p className="mt-1 break-all text-xs text-zinc-500">
                  {invite.status} · {invite.invitedEmail} · expires {new Date(invite.expiresAt).toLocaleString()}
                </p>
              </div>
              {invite.status !== "used" && !invite.isPlaceholder && invite.status !== "needs_email" ? (
                <button
                  className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/10 px-4 text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-300 disabled:opacity-60"
                  disabled={inviteBusy}
                  onClick={() => void resendInvite(invite)}
                  type="button"
                >
                  Resend
                </button>
              ) : null}
            </div>
            {invite.status !== "used" && (invite.isPlaceholder || invite.status === "needs_email") ? (
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  className={fieldClassName}
                  onChange={(event) =>
                    setEmailDrafts((current) => ({ ...current, [invite.id]: event.target.value }))
                  }
                  placeholder="Add real email when you have it"
                  type="email"
                  value={emailDrafts[invite.id] || ""}
                />
                <button
                  className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-[#FF1010] px-4 text-[0.62rem] font-black uppercase tracking-[0.14em] text-white disabled:opacity-60"
                  disabled={inviteBusy || !(emailDrafts[invite.id] || "").trim()}
                  onClick={() => void assignEmail(invite)}
                  type="button"
                >
                  Save email & send invite
                </button>
              </div>
            ) : null}
          </article>
        ))}
      </section>

      {!loaded ? (
        <div className="rounded-[1.5rem] border border-white/10 px-5 py-10 text-center text-sm text-zinc-400">
          Loading claims...
        </div>
      ) : (
        <>
          <section className="space-y-3">
            <h3 className="text-sm font-black uppercase tracking-[0.16em] text-white">Pending claims</h3>
            {claims.length === 0 ? (
              <p className="text-sm text-zinc-400">No pending claims.</p>
            ) : (
              claims.map((claim) => (
                <article className="rounded-[1.35rem] border border-white/10 bg-black/30 p-4" key={claim.id}>
                  <p className="font-semibold text-white">{claim.fighterName}</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    {claim.memberName || "Member"} {claim.memberEmail ? `· ${claim.memberEmail}` : ""}
                  </p>
                  {claim.isMinor ? (
                    <p className="mt-2 text-sm text-amber-200">
                      Minor fighter. Approve a guardian request instead of this claim.
                    </p>
                  ) : null}
                  {claim.note ? <p className="mt-2 text-sm text-zinc-300">{claim.note}</p> : null}
                  <p className="mt-2 break-all text-xs text-zinc-500">{claim.evidencePath}</p>
                  <div className="mt-4 flex gap-2">
                    <button
                      className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#FF1010] px-4 text-[0.62rem] font-black uppercase tracking-[0.14em] text-white disabled:opacity-60"
                      disabled={busyId === claim.id}
                      onClick={() => void updateClaim(claim.id, "approve")}
                      type="button"
                    >
                      Approve
                    </button>
                    <button
                      className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/10 px-4 text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-300 disabled:opacity-60"
                      disabled={busyId === claim.id}
                      onClick={() => void updateClaim(claim.id, "reject")}
                      type="button"
                    >
                      Reject
                    </button>
                  </div>
                </article>
              ))
            )}
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-black uppercase tracking-[0.16em] text-white">Guardians</h3>
            {guardians.length === 0 ? (
              <p className="text-sm text-zinc-400">No guardian requests.</p>
            ) : (
              guardians.map((guardian) => (
                <article className="rounded-[1.35rem] border border-white/10 bg-black/30 p-4" key={guardian.id}>
                  <p className="font-semibold text-white">
                    {guardian.fighterName} · {guardian.relationship || "Guardian"}
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">
                    {guardian.guardianName || "Member"} {guardian.guardianEmail ? `· ${guardian.guardianEmail}` : ""} ·{" "}
                    {guardian.status}
                  </p>
                  <p className="mt-2 break-all text-xs text-zinc-500">{guardian.proofPath}</p>
                  <div className="mt-4 flex gap-2">
                    {guardian.status === "pending" ? (
                      <button
                        className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#FF1010] px-4 text-[0.62rem] font-black uppercase tracking-[0.14em] text-white disabled:opacity-60"
                        disabled={busyId === guardian.id}
                        onClick={() => void updateGuardian(guardian.id, "approve")}
                        type="button"
                      >
                        Approve
                      </button>
                    ) : null}
                    <button
                      className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/10 px-4 text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-300 disabled:opacity-60"
                      disabled={busyId === guardian.id}
                      onClick={() => void updateGuardian(guardian.id, "revoke")}
                      type="button"
                    >
                      Revoke
                    </button>
                  </div>
                </article>
              ))
            )}
          </section>
        </>
      )}
    </div>
  );
}
