"use client";

import { ExternalLink } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  Field,
  FormGroup,
  SelectField,
  TextAreaField,
} from "@/components/profile/license-form-fields";
import {
  membershipApplicationStatusLabels,
  membershipCourierOptions,
  membershipDocumentTypeLabels,
  membershipPaymentMethodLabels,
  membershipPaymentRejectionReasons,
  membershipPaymentStatusLabels,
  type MembershipApplicationRecord,
  type MembershipApplicationStatus,
  type MembershipCourier,
  type MembershipDocumentVerificationStatus,
  type MembershipPaymentStatus,
} from "@/data/membership-applications";
import { adminFetch } from "@/lib/auth/admin-fetch";
import { membershipFetch } from "@/lib/membership/client";

const documentVerificationLabels: Record<MembershipDocumentVerificationStatus, string> = {
  PENDING: "Pending",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
};

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2.5">
      <p className="text-[0.58rem] font-black uppercase tracking-[0.14em] text-zinc-500">{label}</p>
      <p className="mt-1 break-words text-sm text-white">{value || "—"}</p>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  tone = "default",
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  tone?: "default" | "danger" | "success";
  disabled?: boolean;
}) {
  const toneClass =
    tone === "danger"
      ? "border-red-500/40 text-red-100 hover:bg-red-500/10"
      : tone === "success"
        ? "border-emerald-400/40 text-emerald-100 hover:bg-emerald-400/10"
        : "border-white/15 text-white hover:border-[#FF1010]/40 hover:bg-white/5";

  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center rounded-full border px-4 text-[0.65rem] font-black uppercase tracking-[0.14em] transition disabled:cursor-not-allowed disabled:opacity-50 ${toneClass}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

type TransitionBody = {
  action: string;
  applicationStatus?: MembershipApplicationStatus;
  paymentStatus?: MembershipPaymentStatus;
  paymentId?: string;
  rejectionReason?: string;
  applicantVisibleNotes?: string;
  courier?: MembershipCourier;
  trackingNumber?: string;
  shippingDate?: string | null;
  deliveryDate?: string | null;
  notes?: string;
  documentId?: string;
  documentVerificationStatus?: MembershipDocumentVerificationStatus;
};

export function AdminMembershipApplicationDetail({ applicationId }: { applicationId: string }) {
  const [application, setApplication] = useState<MembershipApplicationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [rejectionReason, setRejectionReason] = useState<string>(membershipPaymentRejectionReasons[0]);
  const [visibleNotes, setVisibleNotes] = useState("");
  const [courier, setCourier] = useState<MembershipCourier>("Lalamove");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shippingDate, setShippingDate] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminFetch(`/api/admin/membership-applications/${applicationId}`);
      const payload = (await response.json()) as {
        application?: MembershipApplicationRecord;
        error?: string;
      };
      if (!response.ok || !payload.application) {
        throw new Error(payload.error || "Unable to load application.");
      }
      setApplication(payload.application);
      setVisibleNotes(payload.application.applicantVisibleNotes || "");
      setCourier((payload.application.courier || "Lalamove") as MembershipCourier);
      setTrackingNumber(payload.application.trackingNumber || "");
      setShippingDate(payload.application.shippingDate?.slice(0, 10) || "");
      setDeliveryDate(payload.application.deliveryDate?.slice(0, 10) || "");
      setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load application.");
      setApplication(null);
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  async function runTransition(body: TransitionBody) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await adminFetch(`/api/admin/membership-applications/${applicationId}/transition`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      const payload = (await response.json()) as {
        application?: MembershipApplicationRecord;
        error?: string;
      };
      if (!response.ok || !payload.application) {
        throw new Error(payload.error || "Unable to update application.");
      }
      setApplication(payload.application);
      setMessage("Update saved.");
      setVisibleNotes(payload.application.applicantVisibleNotes || "");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update application.");
    } finally {
      setBusy(false);
    }
  }

  async function openDocument(documentId: string) {
    try {
      const response = await membershipFetch(
        `/api/membership/applications/${applicationId}/documents/${documentId}`,
      );
      const payload = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !payload.url) {
        throw new Error(payload.error || "Unable to open document.");
      }
      window.open(payload.url, "_blank", "noopener,noreferrer");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to open document.");
    }
  }

  if (loading) {
    return <div className="glass-panel rounded-[1.75rem] p-8 text-center text-zinc-400">Loading application...</div>;
  }

  if (!application) {
    return (
      <div className="glass-panel rounded-[1.75rem] border border-red-500/30 bg-red-500/10 p-8 text-red-100">
        {error || "Application not found."}
      </div>
    );
  }

  const latestPayment = application.payments?.[0];

  return (
    <div className="space-y-5">
      <div className="glass-panel rounded-[1.75rem] p-5 sm:p-7">
        <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-[#FF1010]">Membership Review</p>
        <h1 className="font-display mt-2 text-3xl uppercase text-white sm:text-5xl">
          {application.applicationNumber}
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          {application.fullName} · {application.userEmail}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-200">
            {membershipApplicationStatusLabels[application.applicationStatus]}
          </span>
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-200">
            Payment: {membershipPaymentStatusLabels[application.paymentStatus]}
          </span>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</div>
      ) : null}
      {message ? (
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
          {message}
        </div>
      ) : null}

      <div className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
        <FormGroup columns={3} title="Personal">
          <DetailItem label="First Name" value={application.firstName} />
          <DetailItem label="Middle Name" value={application.middleName} />
          <DetailItem label="Last Name" value={application.lastName} />
          <DetailItem label="Suffix" value={application.suffix} />
          <DetailItem label="Gender" value={application.gender} />
          <DetailItem label="Date of Birth" value={application.dateOfBirth} />
          <DetailItem label="Nationality" value={application.nationality} />
          <DetailItem label="Place of Birth" value={application.placeOfBirth} />
        </FormGroup>
      </div>

      <div className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
        <FormGroup title="Contact & Martial Arts">
          <DetailItem label="Email" value={application.contactEmail} />
          <DetailItem label="Mobile" value={application.mobileNumber} />
          <DetailItem label="Facebook" value={application.facebookUrl} />
          <DetailItem label="Fight Team / Gym" value={application.fightTeam} />
          <DetailItem label="Martial Arts System" value={application.martialArtsSystem} />
        </FormGroup>
      </div>

      <div className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
        <FormGroup title="Emergency Contact">
          <DetailItem label="Name" value={application.emergencyContactName} />
          <DetailItem label="Relationship" value={application.emergencyContactRelationship} />
          <DetailItem label="Phone" value={application.emergencyContactPhone} />
          <DetailItem label="Address" value={application.emergencyContactAddress} />
        </FormGroup>
      </div>

      <div className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
        <FormGroup title="Delivery">
          <DetailItem label="Recipient" value={application.deliveryRecipientName} />
          <DetailItem label="Contact" value={application.deliveryContact} />
          <DetailItem label="Address" value={application.deliveryAddress} />
          <DetailItem label="ZIP" value={application.deliveryZip} />
          <DetailItem label="Landmark" value={application.deliveryLandmark} />
          <DetailItem label="Courier" value={application.courier || "—"} />
          <DetailItem label="Tracking" value={application.trackingNumber || "—"} />
          <DetailItem label="Shipped" value={formatDate(application.shippingDate)} />
          <DetailItem label="Delivered" value={formatDate(application.deliveryDate)} />
        </FormGroup>
      </div>

      <div className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
        <h2 className="font-display text-2xl uppercase text-white">Documents</h2>
        <ul className="mt-4 space-y-3">
          {(application.documents ?? []).length === 0 ? (
            <li className="text-sm text-zinc-500">No documents uploaded.</li>
          ) : (
            application.documents?.map((document) => (
              <li
                className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between"
                key={document.id}
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">
                    {membershipDocumentTypeLabels[document.documentType]}
                  </p>
                  <p className="mt-1 truncate text-xs text-zinc-500">{document.originalFilename}</p>
                  <p className="mt-2 text-[0.58rem] font-black uppercase tracking-[0.12em] text-zinc-400">
                    {documentVerificationLabels[document.verificationStatus]}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <ActionButton
                    disabled={busy}
                    label="Download"
                    onClick={() => void openDocument(document.id)}
                  />
                  <ActionButton
                    disabled={busy}
                    label="Mark Verified"
                    onClick={() =>
                      void runTransition({
                        action: "document_verified",
                        documentId: document.id,
                        documentVerificationStatus: "VERIFIED",
                        notes: `${document.documentType} verified`,
                      })
                    }
                    tone="success"
                  />
                  <ActionButton
                    disabled={busy}
                    label="Mark Rejected"
                    onClick={() =>
                      void runTransition({
                        action: "document_rejected",
                        documentId: document.id,
                        documentVerificationStatus: "REJECTED",
                        rejectionReason: "Document rejected by admin",
                        notes: `${document.documentType} rejected`,
                      })
                    }
                    tone="danger"
                  />
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
        <h2 className="font-display text-2xl uppercase text-white">Payments</h2>
        {(application.payments ?? []).length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">No payment records.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {application.payments?.map((payment) => (
              <li className="rounded-2xl border border-white/8 bg-black/20 p-4" key={payment.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {payment.paymentMethod
                        ? membershipPaymentMethodLabels[payment.paymentMethod]
                        : "Payment"}{" "}
                      · ₱{payment.amount}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">Ref: {payment.referenceNumber || "—"}</p>
                    <p className="mt-2 text-[0.58rem] font-black uppercase tracking-[0.12em] text-zinc-400">
                      {membershipPaymentStatusLabels[payment.verificationStatus]}
                    </p>
                    {payment.rejectionReason ? (
                      <p className="mt-2 text-sm text-red-200">{payment.rejectionReason}</p>
                    ) : null}
                  </div>
                  {payment.screenshotDocumentId ? (
                    <button
                      className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full border border-white/15 px-4 text-[0.65rem] font-black uppercase tracking-[0.14em] text-white transition hover:border-[#FF1010]/40"
                      onClick={() => void openDocument(payment.screenshotDocumentId!)}
                      type="button"
                    >
                      Screenshot
                      <ExternalLink size={12} aria-hidden />
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Payment Rejection Reason"
            onChange={setRejectionReason}
            options={[...membershipPaymentRejectionReasons]}
            value={rejectionReason}
          />
          <div className="flex flex-wrap items-end gap-2">
            <ActionButton
              disabled={busy || !latestPayment}
              label="Verify Payment"
              onClick={() =>
                void runTransition({
                  action: "payment_verified",
                  paymentId: latestPayment?.id,
                  paymentStatus: "VERIFIED",
                  applicationStatus: "DOCUMENT_REVIEW",
                  notes: "Payment verified by admin",
                })
              }
              tone="success"
            />
            <ActionButton
              disabled={busy || !latestPayment}
              label="Reject Payment"
              onClick={() =>
                void runTransition({
                  action: "payment_rejected",
                  paymentId: latestPayment?.id,
                  paymentStatus: "REJECTED",
                  applicationStatus: "ACTION_REQUIRED",
                  rejectionReason,
                  applicantVisibleNotes: `Payment rejected: ${rejectionReason}`,
                  notes: rejectionReason,
                })
              }
              tone="danger"
            />
          </div>
        </div>
        <p className="mt-3 text-xs text-zinc-500">
          Only Verify Payment / Reject Payment can set payment status to Verified or Rejected.
        </p>
      </div>

      <div className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
        <h2 className="font-display text-2xl uppercase text-white">Application Actions</h2>
        <TextAreaField
          className="mt-4"
          label="Applicant-visible notes"
          onChange={setVisibleNotes}
          placeholder="Corrections or instructions visible to the applicant"
          value={visibleNotes}
        />
        <div className="mt-4 flex flex-wrap gap-2">
          <ActionButton
            disabled={busy}
            label="Request Changes"
            onClick={() =>
              void runTransition({
                action: "changes_requested",
                applicationStatus: "ACTION_REQUIRED",
                applicantVisibleNotes: visibleNotes,
                notes: visibleNotes || "Additional information requested",
              })
            }
          />
          <ActionButton
            disabled={busy}
            label="Approve Application"
            onClick={() =>
              void runTransition({
                action: "application_approved",
                applicationStatus: "APPROVED",
                applicantVisibleNotes: visibleNotes,
                notes: "Application approved",
              })
            }
            tone="success"
          />
          <ActionButton
            disabled={busy}
            label="Reject Application"
            onClick={() =>
              void runTransition({
                action: "application_rejected",
                applicationStatus: "REJECTED",
                applicantVisibleNotes: visibleNotes || "Application rejected",
                notes: visibleNotes || "Application rejected",
              })
            }
            tone="danger"
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-5">
          <ActionButton
            disabled={busy}
            label="ID Processing"
            onClick={() =>
              void runTransition({
                action: "id_processing",
                applicationStatus: "ID_PROCESSING",
              })
            }
          />
          <ActionButton
            disabled={busy}
            label="ID Printing"
            onClick={() =>
              void runTransition({
                action: "id_printing",
                applicationStatus: "ID_PRINTING",
              })
            }
          />
          <ActionButton
            disabled={busy}
            label="Ready for Delivery"
            onClick={() =>
              void runTransition({
                action: "ready_for_delivery",
                applicationStatus: "READY_FOR_DELIVERY",
              })
            }
          />
        </div>

        <div className="mt-5 grid gap-4 border-t border-white/10 pt-5 sm:grid-cols-3">
          <SelectField
            label="Courier"
            onChange={(value) => setCourier(value as MembershipCourier)}
            options={[...membershipCourierOptions]}
            value={courier || "Lalamove"}
          />
          <Field label="Tracking Number" onChange={setTrackingNumber} value={trackingNumber} />
          <Field label="Shipping Date" onChange={setShippingDate} type="date" value={shippingDate} />
          <Field label="Delivery Date" onChange={setDeliveryDate} type="date" value={deliveryDate} />
          <div className="flex flex-wrap items-end gap-2 sm:col-span-2">
            <ActionButton
              disabled={busy}
              label="Mark Shipped"
              onClick={() =>
                void runTransition({
                  action: "application_shipped",
                  applicationStatus: "SHIPPED",
                  courier,
                  trackingNumber,
                  shippingDate: shippingDate || new Date().toISOString().slice(0, 10),
                })
              }
            />
            <ActionButton
              disabled={busy}
              label="Mark Delivered"
              onClick={() =>
                void runTransition({
                  action: "application_delivered",
                  applicationStatus: "DELIVERED",
                  deliveryDate: deliveryDate || new Date().toISOString().slice(0, 10),
                })
              }
            />
            <ActionButton
              disabled={busy}
              label="Mark Completed"
              onClick={() =>
                void runTransition({
                  action: "application_completed",
                  applicationStatus: "COMPLETED",
                })
              }
              tone="success"
            />
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
        <h2 className="font-display text-2xl uppercase text-white">History</h2>
        <ul className="mt-4 space-y-3">
          {(application.history ?? []).length === 0 ? (
            <li className="text-sm text-zinc-500">No history entries.</li>
          ) : (
            application.history?.map((entry) => (
              <li className="rounded-2xl border border-white/8 bg-black/20 p-4" key={entry.id}>
                <p className="text-sm font-semibold text-white">{entry.action.replace(/_/g, " ")}</p>
                {entry.notes ? <p className="mt-1 text-sm text-zinc-400">{entry.notes}</p> : null}
                <p className="mt-2 text-[0.58rem] uppercase tracking-[0.12em] text-zinc-500">
                  {entry.actorEmail || "system"} · {formatDate(entry.createdAt)}
                </p>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
