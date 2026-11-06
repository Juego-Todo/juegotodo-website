"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { adminFetch } from "@/lib/auth/admin-fetch";
import type { ImportPreview } from "@/lib/fight-records/import-types";

type RegistrationPreview = {
  source: string;
  totalRows: number;
  importable: number;
  withEmail: number;
  sample: Array<{
    displayName: string;
    alias: string;
    email: string;
    gym: string;
    record: string;
    dateOfBirth: string | null;
  }>;
};

export function AdminFightRecordsImportPanel() {
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [registrationPreview, setRegistrationPreview] = useState<RegistrationPreview | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [registrationBusy, setRegistrationBusy] = useState(false);

  const loadSaved = useCallback(() => {
    setLoaded(false);
    void Promise.all([
      fetch("/api/admin/fight-records/import").then(async (response) => {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
          preview?: ImportPreview | null;
        } | null;
        if (!response.ok) throw new Error(payload?.error || "Unable to load the import preview.");
        return payload?.preview ?? null;
      }),
      adminFetch("/api/admin/fight-records/registration-import").then(async (response) => {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
          preview?: RegistrationPreview | null;
        } | null;
        if (!response.ok) throw new Error(payload?.error || "Unable to load registration roster.");
        return payload?.preview ?? null;
      }),
    ])
      .then(([fightPreview, regPreview]) => {
        setPreview(fightPreview);
        setRegistrationPreview(regPreview);
        setError("");
      })
      .catch((caught: unknown) => {
        setError(caught instanceof Error ? caught.message : "Unable to load import data.");
      })
      .finally(() => setLoaded(true));
  }, []);

  async function onApplyRegistration() {
    setRegistrationBusy(true);
    setStatus("");
    setError("");
    const response = await adminFetch("/api/admin/fight-records/registration-import", {
      method: "POST",
      body: JSON.stringify({ action: "apply", createAccounts: true }),
    });
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
      message?: string;
      created?: number;
      updated?: number;
      accountsCreated?: number;
      errorCount?: number;
    } | null;
    setRegistrationBusy(false);
    if (!response.ok) {
      setError(payload?.error || "Registration import failed.");
      return;
    }
    setStatus(payload?.message || "Registration roster imported.");
    loadSaved();
  }

  useEffect(() => {
    const timer = window.setTimeout(() => loadSaved(), 0);
    return () => window.clearTimeout(timer);
  }, [loadSaved]);

  async function onUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    data.set("action", "preview");
    setBusy(true);
    setStatus("");
    setError("");
    const response = await fetch("/api/admin/fight-records/import", { method: "POST", body: data });
    const payload = (await response.json().catch(() => null)) as { error?: string; preview?: ImportPreview } | null;
    setBusy(false);
    if (!response.ok || !payload?.preview) {
      setError(payload?.error || "Preview failed.");
      return;
    }
    setPreview(payload.preview);
    setStatus("Preview ready. Confirm the mismatches and review queue before importing.");
    form.reset();
  }

  async function onApply() {
    setBusy(true);
    setStatus("");
    setError("");
    const response = await fetch("/api/admin/fight-records/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "apply", preview }),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string; fighters?: number; events?: number } | null;
    setBusy(false);
    if (!response.ok) {
      setError(payload?.error || "Import failed.");
      return;
    }
    setStatus(`Import applied. ${payload?.events ?? 0} events and ${payload?.fighters ?? 0} fighter rows processed.`);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.02] p-4 sm:p-5">
        <h3 className="text-sm font-black uppercase tracking-[0.16em] text-white">JT fighter registration roster</h3>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Import the JTPH fighter registration sheet into Latayanology and create/tag website fighter accounts from
          emails. This does not run automatically on deploy — click the button below once. Trial/test rows are skipped.
        </p>
        {registrationPreview ? (
          <>
            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {(
                [
                  ["Rows", registrationPreview.totalRows],
                  ["Importable", registrationPreview.importable],
                  ["With email", registrationPreview.withEmail],
                ] as const
              ).map(([label, value]) => (
                <div className="rounded-[1.25rem] border border-white/10 bg-black/20 px-3 py-3" key={label}>
                  <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">{label}</p>
                  <p className="font-display mt-1 text-2xl text-white">{value}</p>
                </div>
              ))}
            </div>
            <ul className="mt-4 max-h-48 space-y-1 overflow-y-auto text-sm text-zinc-300">
              {registrationPreview.sample.map((row) => (
                <li key={`${row.displayName}-${row.email}`}>
                  <span className="font-semibold text-white">{row.displayName}</span>
                  {row.alias ? ` “${row.alias}”` : ""}
                  {row.email ? ` · ${row.email}` : ""}
                  {row.gym ? ` · ${row.gym}` : ""}
                </li>
              ))}
            </ul>
            <button
              className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-[#FF1010] px-5 text-[0.68rem] font-black uppercase tracking-[0.14em] text-white disabled:opacity-60"
              disabled={registrationBusy || registrationPreview.importable === 0}
              onClick={() => void onApplyRegistration()}
              type="button"
            >
              {registrationBusy ? "Importing..." : "Import registration roster + accounts"}
            </button>
          </>
        ) : (
          <p className="mt-3 text-sm text-zinc-500">
            No registration extract found at data/imports/jt-fighter-reg-extracted.json.
          </p>
        )}
      </div>

      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.02] p-4 sm:p-5">
        <h3 className="text-sm font-black uppercase tracking-[0.16em] text-white">Fight card workbook</h3>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Load the saved preview or upload <span className="text-zinc-200">import-preview.json</span> / the exported
          workbook JSON. Birth dates are imported with the file and are not listed in this review.
        </p>
        <form className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center" onSubmit={onUpload}>
          <input
            accept="application/json,.json"
            className="block w-full text-sm text-zinc-300 file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-xs file:font-black file:uppercase file:tracking-[0.12em] file:text-white"
            name="file"
            required
            type="file"
          />
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#FF1010] px-5 text-[0.68rem] font-black uppercase tracking-[0.14em] text-white disabled:opacity-60"
            disabled={busy}
            type="submit"
          >
            Preview file
          </button>
        </form>
        <button
          className="mt-3 text-[0.68rem] font-black uppercase tracking-[0.14em] text-zinc-400 transition hover:text-white"
          onClick={loadSaved}
          type="button"
        >
          Reload saved preview
        </button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</div>
      ) : null}
      {status ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {status}
        </div>
      ) : null}

      {!loaded ? (
        <div className="rounded-[1.5rem] border border-white/10 px-5 py-10 text-center text-sm text-zinc-400">
          Loading preview...
        </div>
      ) : !preview ? (
        <div className="rounded-[1.5rem] border border-white/10 px-5 py-10 text-center text-sm text-zinc-400">
          No preview file yet. Run the import script or upload a JSON workbook.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {(
              [
                ["Events", preview.totals.events],
                ["Bouts", preview.totals.bouts],
                ["Fighters", preview.totals.uniqueFighters],
                ["Review", preview.reviewQueue.length],
              ] as const
            ).map(([label, value]) => (
              <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.02] px-3 py-3" key={label}>
                <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">{label}</p>
                <p className="font-display mt-1 text-2xl text-white">{value}</p>
              </div>
            ))}
          </div>

          <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.02] p-4">
            <h3 className="text-sm font-black uppercase tracking-[0.16em] text-white">Record mismatches</h3>
            {preview.mismatches.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-400">Sheet summaries match the computed records.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                {preview.mismatches.slice(0, 40).map((row) => (
                  <li key={`${row.eventSourceKey}-${row.fighterName}-${row.corner}`}>
                    {row.fighterName} at {row.eventSourceKey}: sheet {row.sheet.wins}-{row.sheet.losses}-{row.sheet.draws} vs
                    computed {row.computed.wins}-{row.computed.losses}-{row.computed.draws}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.02] p-4">
            <h3 className="text-sm font-black uppercase tracking-[0.16em] text-white">Review queue</h3>
            {preview.reviewQueue.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-400">No ambiguous fighter matches.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                {preview.reviewQueue.slice(0, 40).map((row) => (
                  <li key={row.key}>
                    {row.fighter.displayName}
                    {row.fighter.gym ? ` · ${row.fighter.gym}` : ""} — possible match{" "}
                    {row.ambiguousMatches.map((match) => match.displayName).join(", ") || "needs review"}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <button
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#FF1010] px-5 text-[0.68rem] font-black uppercase tracking-[0.14em] text-white disabled:opacity-60"
            disabled={busy}
            onClick={() => void onApply()}
            type="button"
          >
            {busy ? "Working..." : "Confirm import"}
          </button>
        </>
      )}
    </div>
  );
}
