"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";

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

export function AdminFighterClaimsPanel() {
  const [claims, setClaims] = useState<ClaimRow[]>([]);
  const [guardians, setGuardians] = useState<GuardianRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [busyId, setBusyId] = useState("");
  const [inviteFighterId, setInviteFighterId] = useState("");
  const [inviteToken, setInviteToken] = useState("");

  const refresh = useCallback(() => {
    setLoaded(false);
    void Promise.all([
      fetch("/api/admin/fighter-claims").then(async (response) => {
        const payload = (await response.json().catch(() => null)) as { error?: string; claims?: ClaimRow[] } | null;
        if (!response.ok) throw new Error(payload?.error || "Unable to load claims.");
        return payload?.claims ?? [];
      }),
      fetch("/api/admin/fighter-guardians").then(async (response) => {
        const payload = (await response.json().catch(() => null)) as { error?: string; guardians?: GuardianRow[] } | null;
        if (!response.ok) throw new Error(payload?.error || "Unable to load guardians.");
        return payload?.guardians ?? [];
      }),
    ])
      .then(([nextClaims, nextGuardians]) => {
        setClaims(nextClaims);
        setGuardians(nextGuardians);
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

  async function updateClaim(id: string, action: "approve" | "reject") {
    setBusyId(id);
    setStatus("");
    setError("");
    const response = await fetch("/api/admin/fighter-claims", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
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
    const response = await fetch("/api/admin/fighter-guardians", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
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

  async function createInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setError("");
    setInviteToken("");
    const response = await fetch("/api/admin/fighter-claim-invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fighterId: inviteFighterId.trim() }),
    });
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
      token?: string;
      claimPath?: string;
      message?: string;
    } | null;
    if (!response.ok || !payload?.token) {
      setError(payload?.error || "Unable to create invite.");
      return;
    }
    setInviteToken(payload.claimPath || payload.token);
    setStatus(payload.message || "Invite created.");
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

      <form className="rounded-[1.5rem] border border-white/10 bg-white/[0.02] p-4" onSubmit={createInvite}>
        <h3 className="text-sm font-black uppercase tracking-[0.16em] text-white">Claim invite</h3>
        <p className="mt-2 text-sm text-zinc-400">Creates a one-time token that expires in 7 days. Only the hash is stored.</p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none ring-[#FF1010]/30 focus:ring-2"
            onChange={(event) => setInviteFighterId(event.target.value)}
            placeholder="Fighter id"
            value={inviteFighterId}
          />
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/10 px-4 text-[0.68rem] font-black uppercase tracking-[0.14em] text-zinc-200"
            type="submit"
          >
            Create invite
          </button>
        </div>
        {inviteToken ? <p className="mt-3 break-all text-sm text-zinc-200">{inviteToken}</p> : null}
      </form>

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
                    <p className="mt-2 text-sm text-amber-200">Minor fighter. Approve a guardian request instead of this claim.</p>
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
