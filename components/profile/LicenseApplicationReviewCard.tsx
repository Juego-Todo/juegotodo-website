"use client";

import { useState } from "react";
import { CheckCircle2, FileText, Paperclip, XCircle } from "lucide-react";
import { AdminAccountTagEditor } from "@/components/profile/AdminAccountTagEditor";
import {
  buildLicenseAddress,
  formatBackgroundAnswerLabel,
  formatFighterRecord,
  formatJudgeLevels,
  formatLicenseDate,
  formatRefereeLevels,
  formatRefereeRulesets,
  formatTrainerDisciplines,
  getLicenseFightTeam,
  getRestrictionLabel,
  listLicenseUploadAttachments,
  type LicenseApplication,
  type LicenseApplicationStatus,
} from "@/data/license-applications";
import { getAdminAssignedTags } from "@/lib/profile/account-tags";
import {
  licenseApprovalStatusTone,
  resolveLicenseProgramTitle,
  resolveLicenseStatusLabel,
} from "@/lib/profile/license-approval-ui";
import { reviewLicenseApplication } from "@/lib/licenses/storage";

export function LicenseApplicationReviewCard({
  application,
  onReviewComplete,
}: {
  application: LicenseApplication;
  onReviewComplete?: () => void;
}) {
  const [notes, setNotes] = useState(application.reviewNotes ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploads = listLicenseUploadAttachments(application.uploads);
  const attachedUploads = uploads.filter((upload) => upload.attached);
  const missingUploads = uploads.filter((upload) => !upload.attached);
  const answers = application.backgroundAnswers ?? {};

  const formattedAnswers = [
    answers.clubName ? { label: "Club", value: answers.clubName } : null,
    answers.coachingLevel ? { label: "Coaching Level", value: answers.coachingLevel } : null,
    answers.coachingClub ? { label: "Coaching Club", value: answers.coachingClub } : null,
    answers.weightDivision ? { label: "Weight Division", value: answers.weightDivision } : null,
    formatFighterRecord(answers) ? { label: "Fight Record", value: formatFighterRecord(answers) } : null,
    formatRefereeLevels(answers) ? { label: "Officiating Levels", value: formatRefereeLevels(answers) } : null,
    formatRefereeRulesets(answers) ? { label: "Rulesets", value: formatRefereeRulesets(answers) } : null,
    formatJudgeLevels(answers) ? { label: "Judging Levels", value: formatJudgeLevels(answers) } : null,
    formatTrainerDisciplines(answers) ? { label: "Training Disciplines", value: formatTrainerDisciplines(answers) } : null,
    ...Object.entries(answers)
      .filter(([, value]) => value?.trim())
      .filter(([key]) => !["clubName", "coachingLevel", "coachingClub", "weightDivision"].includes(key))
      .map(([key, value]) => ({
        label: formatBackgroundAnswerLabel(key),
        value,
      })),
  ].filter(Boolean) as { label: string; value: string }[];

  const canReview = application.status === "pending" || application.status === "needs_info";

  async function handleReview(status: LicenseApplicationStatus) {
    const trimmedNotes = notes.trim();
    if ((status === "rejected" || status === "needs_info") && !trimmedNotes) {
      setError("Add review notes before rejecting or requesting more information.");
      setMessage(null);
      return;
    }

    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      await reviewLicenseApplication(application.id, status, trimmedNotes);
      setMessage(
        status === "approved"
          ? "Application approved."
          : status === "rejected"
            ? "Application rejected."
            : "More information requested from applicant.",
      );
      onReviewComplete?.();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update application.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="glass-panel rounded-[1.75rem] p-5 sm:p-8">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">{application.idNumber}</p>
          <h3 className="font-display mt-2 text-3xl uppercase text-white sm:text-4xl">{application.fullName}</h3>
          <p className="mt-1 text-sm text-zinc-400">{application.userEmail}</p>
          <p className="mt-2 text-sm text-zinc-500">
            {getRestrictionLabel(application.restrictionCode)} • {resolveLicenseProgramTitle(application)}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.12em] ${licenseApprovalStatusTone[application.status]}`}
          >
            {resolveLicenseStatusLabel(application.status)}
          </span>
          <p className="mt-2 text-xs text-zinc-500">Submitted {formatLicenseDate(application.submittedAt)}</p>
          {application.reviewedAt ? (
            <p className="text-xs text-zinc-500">Reviewed {formatLicenseDate(application.reviewedAt)}</p>
          ) : null}
        </div>
      </div>

      {message ? <p className="mt-4 text-sm text-emerald-300">{message}</p> : null}
      {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}

      <section className="mt-6">
        <h4 className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-zinc-400">Applicant Summary</h4>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Gender", value: application.gender || "—" },
            { label: "Date of Birth", value: formatLicenseDate(application.dateOfBirth) },
            { label: "Blood Type", value: application.bloodType || "—" },
            { label: "Mobile", value: application.mobileNumber || "—" },
            { label: "Nationality", value: application.nationality || "—" },
            { label: "Fight Team", value: getLicenseFightTeam(application) || "—" },
            { label: "Address", value: buildLicenseAddress(application) || "—" },
            { label: "Emergency Contact", value: application.emergencyContactName || "—" },
            { label: "Emergency Phone", value: application.emergencyContactPhone || "—" },
          ].map((field) => (
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4" key={field.label}>
              <dt className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-zinc-500">{field.label}</dt>
              <dd className="mt-2 text-sm font-medium text-white">{field.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {formattedAnswers.length > 0 ? (
        <section className="mt-6">
          <h4 className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-zinc-400">Application Details</h4>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            {formattedAnswers.map((field) => (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4" key={`${field.label}-${field.value}`}>
                <dt className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-zinc-500">{field.label}</dt>
                <dd className="mt-2 text-sm text-zinc-200">{field.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {application.restrictions ? (
        <section className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4">
          <h4 className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-zinc-400">Applicant Notes</h4>
          <p className="mt-2 text-sm text-zinc-300">{application.restrictions}</p>
        </section>
      ) : null}

      <section className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-zinc-400">Required Attachments</h4>
          <p className="text-xs text-zinc-500">
            {attachedUploads.length} attached • {missingUploads.length} missing
          </p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {uploads.map((upload) => (
            <div
              className={`rounded-2xl border p-4 ${
                upload.attached ? "border-emerald-500/30 bg-emerald-500/5" : "border-white/10 bg-black/25"
              }`}
              key={upload.key}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-semibold text-white">
                    {upload.attached ? (
                      <Paperclip className="shrink-0 text-emerald-300" size={14} aria-hidden />
                    ) : (
                      <FileText className="shrink-0 text-zinc-500" size={14} aria-hidden />
                    )}
                    {upload.label}
                  </p>
                  <p className={`mt-1 text-xs ${upload.attached ? "text-emerald-200" : "text-zinc-500"}`}>
                    {upload.attached ? "File attached" : "Not submitted"}
                  </p>
                </div>
                {upload.attached ? (
                  upload.isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt={upload.label}
                      className="h-14 w-14 rounded-lg border border-white/10 object-cover"
                      src={upload.value}
                    />
                  ) : (
                    <a
                      className="shrink-0 rounded-full border border-white/10 px-3 py-1 text-[0.58rem] font-bold uppercase tracking-[0.1em] text-zinc-300 hover:border-red-500/40 hover:text-white"
                      href={upload.value}
                      rel="noreferrer"
                      target="_blank"
                    >
                      View
                    </a>
                  )
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>

      {application.status === "approved" ? (
        <p className="mt-6 text-sm text-emerald-300">
          Issued {formatLicenseDate(application.issuedDate)} • Expires {formatLicenseDate(application.expiryDate)}
        </p>
      ) : null}

      {canReview ? (
        <section className="mt-6 border-t border-white/10 pt-6">
          <label className="block">
            <span className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-zinc-400">Review Notes</span>
            <textarea
              className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none ring-red-500/30 focus:ring-4"
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Required for rejection or requests for more information. Visible to the applicant."
              rows={4}
              value={notes}
            />
          </label>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-emerald-600 px-5 text-xs font-bold uppercase tracking-[0.14em] text-white disabled:opacity-60"
              disabled={busy}
              onClick={() => void handleReview("approved")}
              type="button"
            >
              <CheckCircle2 size={14} aria-hidden />
              Accept
            </button>
            <button
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-red-500/40 px-5 text-xs font-bold uppercase tracking-[0.14em] text-red-200 disabled:opacity-60"
              disabled={busy}
              onClick={() => void handleReview("rejected")}
              type="button"
            >
              <XCircle size={14} aria-hidden />
              Reject
            </button>
            <button
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-sky-500/40 bg-sky-500/10 px-5 text-xs font-bold uppercase tracking-[0.14em] text-sky-100 disabled:opacity-60"
              disabled={busy}
              onClick={() => void handleReview("needs_info")}
              type="button"
            >
              Request More Info
            </button>
          </div>
        </section>
      ) : application.reviewNotes ? (
        <section className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4">
          <h4 className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-zinc-400">Review Notes</h4>
          <p className="mt-2 text-sm text-zinc-300">{application.reviewNotes}</p>
        </section>
      ) : null}

      <div className="mt-6 border-t border-white/10 pt-6">
        <AdminAccountTagEditor initialTags={getAdminAssignedTags(application.userId)} userId={application.userId} />
      </div>
    </div>
  );
}
