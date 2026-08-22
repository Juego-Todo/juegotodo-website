"use client";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Pencil,
  Upload,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MotionSection } from "@/components/MotionSection";
import {
  Field,
  FileUploadField,
  FormGroup,
  SelectField,
  TextAreaField,
} from "@/components/profile/license-form-fields";
import {
  emptyMembershipApplicationDraft,
  GCASH_PAYMENT_NUMBER,
  GCASH_QR_SRC,
  MAYA_QR_SRC,
  MEMBERSHIP_REQUIRED_DOCUMENTS,
  membershipDocumentTypeLabels,
  membershipPaymentMethodLabels,
  type MembershipApplicationDraftInput,
  type MembershipApplicationRecord,
  type MembershipDocumentType,
  type MembershipPaymentMethod,
} from "@/data/membership-applications";
import { splitLegacyFullName, suffixOptions } from "@/data/license-applications";
import { membershipFetch } from "@/lib/membership/client";
import { sanitizeMembershipDraft, validateMembershipDraft } from "@/lib/membership/validation";

const GENDER_OPTIONS = ["Male", "Female", "Non-binary", "Prefer not to say"];
const PAYMENT_METHODS = Object.keys(membershipPaymentMethodLabels) as MembershipPaymentMethod[];
const DRAFT_STORAGE_KEY = "jt-membership-draft";
const TOTAL_STEPS = 7;

const stepTitles = [
  "Personal Information",
  "Contact & Martial Arts",
  "Emergency Contact",
  "Required Documents",
  "Delivery Details",
  "Payment Proof",
  "Review & Consent",
] as const;

type FormStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

type UploadedDocMeta = {
  id: string;
  filename: string;
};

type LocalDraftBackup = {
  applicationId: string | null;
  idempotencyKey: string;
  draft: MembershipApplicationDraftInput;
  documents: Partial<Record<MembershipDocumentType, UploadedDocMeta>>;
  step: FormStep;
};

type MembershipApplicationWizardProps = {
  user: { id: string; email: string; fullName: string };
  phone?: string;
};

function createIdempotencyKey() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `jt-membership-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function recordToDraft(application: MembershipApplicationRecord): MembershipApplicationDraftInput {
  const latestPayment = application.payments?.[0];
  return sanitizeMembershipDraft({
    applicationTypeId: application.applicationTypeId || "local_membership",
    firstName: application.firstName,
    middleName: application.middleName,
    lastName: application.lastName,
    suffix: application.suffix,
    nationality: application.nationality,
    dateOfBirth: application.dateOfBirth,
    placeOfBirth: application.placeOfBirth,
    gender: application.gender,
    facebookUrl: application.facebookUrl,
    contactEmail: application.contactEmail || application.userEmail,
    mobileNumber: application.mobileNumber,
    fightTeam: application.fightTeam,
    martialArtsSystem: application.martialArtsSystem,
    emergencyContactName: application.emergencyContactName,
    emergencyContactRelationship: application.emergencyContactRelationship,
    emergencyContactAddress: application.emergencyContactAddress,
    emergencyContactPhone: application.emergencyContactPhone,
    deliveryRecipientName: application.deliveryRecipientName,
    deliveryAddress: application.deliveryAddress,
    deliveryZip: application.deliveryZip,
    deliveryLandmark: application.deliveryLandmark,
    deliveryContact: application.deliveryContact,
    paymentMethod: latestPayment?.paymentMethod || "",
    amountPaid: application.amountPaid || latestPayment?.amount || 0,
    paymentReferenceNumber: latestPayment?.referenceNumber || "",
    consentConfirmed: application.consentConfirmed,
  });
}

function documentsFromRecord(application: MembershipApplicationRecord) {
  const next: Partial<Record<MembershipDocumentType, UploadedDocMeta>> = {};
  for (const document of application.documents ?? []) {
    next[document.documentType] = {
      id: document.id,
      filename: document.originalFilename,
    };
  }
  return next;
}

function readLocalBackup(): LocalDraftBackup | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LocalDraftBackup;
  } catch {
    return null;
  }
}

function writeLocalBackup(backup: LocalDraftBackup) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(backup));
  } catch {
    // Ignore quota / private mode failures.
  }
}

function clearLocalBackup() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    // Ignore.
  }
}

function validatePersonal(form: MembershipApplicationDraftInput) {
  if (!form.firstName.trim()) return "First name is required.";
  if (!form.lastName.trim()) return "Last name is required.";
  if (!form.nationality.trim()) return "Nationality is required.";
  if (!form.dateOfBirth.trim()) return "Date of birth is required.";
  if (!form.placeOfBirth.trim()) return "Place of birth is required.";
  if (!form.gender.trim()) return "Gender is required.";
  return null;
}

function validateContact(form: MembershipApplicationDraftInput) {
  if (!form.facebookUrl.trim()) return "Facebook profile link is required.";
  try {
    const parsed = new URL(form.facebookUrl.trim());
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "Enter a valid Facebook profile URL.";
    }
  } catch {
    return "Enter a valid Facebook profile URL.";
  }
  if (!form.contactEmail.trim() || !form.contactEmail.includes("@")) {
    return "A valid email address is required.";
  }
  if (!form.mobileNumber.trim()) return "Contact number is required.";
  if (!form.fightTeam.trim()) return "Fight team or gym is required.";
  if (!form.martialArtsSystem.trim()) return "Martial arts system is required.";
  return null;
}

function validateEmergency(form: MembershipApplicationDraftInput) {
  if (!form.emergencyContactName.trim()) return "Emergency contact full name is required.";
  if (!form.emergencyContactRelationship.trim()) return "Emergency contact relationship is required.";
  if (!form.emergencyContactAddress.trim()) return "Emergency contact address is required.";
  if (!form.emergencyContactPhone.trim()) return "Emergency contact number is required.";
  return null;
}

function validateDelivery(form: MembershipApplicationDraftInput) {
  if (!form.deliveryRecipientName.trim()) return "Delivery recipient legal name is required.";
  if (!form.deliveryAddress.trim()) return "Complete delivery address is required.";
  if (!form.deliveryZip.trim()) return "ZIP code is required.";
  if (!form.deliveryLandmark.trim()) return "Landmark is required.";
  if (!form.deliveryContact.trim()) return "Active delivery contact number is required.";
  return null;
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2.5">
      <p className="text-[0.58rem] font-black uppercase tracking-[0.14em] text-zinc-500">{label}</p>
      <p className="mt-1 break-words text-sm text-white">{value || "—"}</p>
    </div>
  );
}

export function MembershipApplicationWizard({ user, phone = "" }: MembershipApplicationWizardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationIdParam = searchParams.get("applicationId");

  const [step, setStep] = useState<FormStep>(1);
  const [idempotencyKey] = useState(() => {
    const backup = readLocalBackup();
    return backup?.idempotencyKey || createIdempotencyKey();
  });
  const [applicationId, setApplicationId] = useState<string | null>(applicationIdParam);
  const [form, setForm] = useState<MembershipApplicationDraftInput>(() => {
    const backup = readLocalBackup();
    if (backup?.draft && (!applicationIdParam || backup.applicationId === applicationIdParam)) {
      return sanitizeMembershipDraft({ ...backup.draft, idempotencyKey: backup.idempotencyKey });
    }
    const legacyName = splitLegacyFullName(user.fullName);
    return sanitizeMembershipDraft({
      ...emptyMembershipApplicationDraft,
      firstName: legacyName.firstName,
      middleName: legacyName.middleName,
      lastName: legacyName.lastName,
      contactEmail: user.email,
      mobileNumber: phone,
      idempotencyKey,
    });
  });
  const [documents, setDocuments] = useState<Partial<Record<MembershipDocumentType, UploadedDocMeta>>>(() => {
    const backup = readLocalBackup();
    if (backup?.documents && (!applicationIdParam || backup.applicationId === applicationIdParam)) {
      return backup.documents;
    }
    return {};
  });
  const [uploadingType, setUploadingType] = useState<MembershipDocumentType | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(Boolean(applicationIdParam));
  const [error, setError] = useState<string | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);
  const [submittedApplication, setSubmittedApplication] = useState<MembershipApplicationRecord | null>(null);

  const paymentScreenshot = documents.PAYMENT_SCREENSHOT;

  const persistLocal = useCallback(
    (next: {
      applicationId?: string | null;
      draft?: MembershipApplicationDraftInput;
      documents?: Partial<Record<MembershipDocumentType, UploadedDocMeta>>;
      step?: FormStep;
    }) => {
      writeLocalBackup({
        applicationId: next.applicationId ?? applicationId,
        idempotencyKey,
        draft: next.draft ?? form,
        documents: next.documents ?? documents,
        step: next.step ?? step,
      });
    },
    [applicationId, documents, form, idempotencyKey, step],
  );

  useEffect(() => {
    persistLocal({});
  }, [persistLocal]);

  useEffect(() => {
    if (!applicationIdParam) {
      const timer = window.setTimeout(() => setBootstrapping(false), 0);
      return () => window.clearTimeout(timer);
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      void membershipFetch(`/api/membership/applications/${applicationIdParam}`)
        .then(async (response) => {
          const payload = (await response.json()) as {
            application?: MembershipApplicationRecord;
            error?: string;
          };
          if (!response.ok || !payload.application) {
            throw new Error(payload.error || "Unable to load application.");
          }
          if (cancelled) return;
          if (!["DRAFT", "ACTION_REQUIRED", "PAYMENT_PENDING"].includes(payload.application.applicationStatus)) {
            router.replace(`/membership/application/${payload.application.id}`);
            return;
          }
          setApplicationId(payload.application.id);
          setForm(recordToDraft(payload.application));
          setDocuments(documentsFromRecord(payload.application));
        })
        .catch((caught) => {
          if (!cancelled) {
            setError(caught instanceof Error ? caught.message : "Unable to load application.");
          }
        })
        .finally(() => {
          if (!cancelled) setBootstrapping(false);
        });
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [applicationIdParam, router]);

  function updateField<K extends keyof MembershipApplicationDraftInput>(
    key: K,
    value: MembershipApplicationDraftInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setStepError(null);
    setError(null);
  }

  async function saveDraft(nextForm = form) {
    const draft = sanitizeMembershipDraft({ ...nextForm, idempotencyKey });
    const response = await membershipFetch("/api/membership/applications", {
      method: "POST",
      body: JSON.stringify({
        applicationId: applicationId ?? undefined,
        draft,
      }),
    });
    const payload = (await response.json()) as {
      application?: MembershipApplicationRecord;
      error?: string;
    };
    if (!response.ok || !payload.application) {
      throw new Error(payload.error || "Unable to save draft.");
    }
    setApplicationId(payload.application.id);
    persistLocal({
      applicationId: payload.application.id,
      draft,
    });
    return payload.application;
  }

  async function ensureApplicationId() {
    if (applicationId) return applicationId;
    const saved = await saveDraft();
    return saved.id;
  }

  async function uploadDocument(documentType: MembershipDocumentType, file: File) {
    setUploadingType(documentType);
    setStepError(null);
    setError(null);
    try {
      const id = await ensureApplicationId();
      const body = new FormData();
      body.append("file", file);
      body.append("documentType", documentType);
      const response = await membershipFetch(`/api/membership/applications/${id}/documents`, {
        method: "POST",
        body,
      });
      const payload = (await response.json()) as {
        document?: { id: string; originalFilename: string; documentType: MembershipDocumentType };
        error?: string;
      };
      if (!response.ok || !payload.document) {
        throw new Error(payload.error || "Upload failed.");
      }
      setDocuments((current) => {
        const next = {
          ...current,
          [documentType]: {
            id: payload.document!.id,
            filename: payload.document!.originalFilename,
          },
        };
        persistLocal({ documents: next, applicationId: id });
        return next;
      });
    } catch (caught) {
      setStepError(caught instanceof Error ? caught.message : "Upload failed.");
    } finally {
      setUploadingType(null);
    }
  }

  function validateCurrentStep() {
    if (step === 1) return validatePersonal(form);
    if (step === 2) return validateContact(form);
    if (step === 3) return validateEmergency(form);
    if (step === 4) {
      for (const documentType of MEMBERSHIP_REQUIRED_DOCUMENTS) {
        if (!documents[documentType]?.id) {
          return `${membershipDocumentTypeLabels[documentType]} is required.`;
        }
      }
      return null;
    }
    if (step === 5) return validateDelivery(form);
    if (step === 6) {
      const paymentError = validateMembershipDraft(form, { requirePayment: true });
      if (paymentError) return paymentError;
      if (!paymentScreenshot?.id) return "Payment screenshot is required.";
      return null;
    }
    if (step === 7) {
      return validateMembershipDraft(form, { requirePayment: true, requireConsent: true });
    }
    return null;
  }

  async function handleNext() {
    const validationError = validateCurrentStep();
    if (validationError) {
      setStepError(validationError);
      return;
    }

    setSaving(true);
    setStepError(null);
    setError(null);
    try {
      if (step === 1 || step === 2 || step === 3 || step === 5 || step === 6) {
        await saveDraft();
      }
      if (step === 4) {
        await ensureApplicationId();
      }
      const nextStep = Math.min(step + 1, TOTAL_STEPS) as FormStep;
      setStep(nextStep);
      persistLocal({ step: nextStep });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to continue.");
    } finally {
      setSaving(false);
    }
  }

  function handleBack() {
    if (step === 1) {
      router.push("/membership");
      return;
    }
    const previous = (step - 1) as FormStep;
    setStep(previous);
    setStepError(null);
    persistLocal({ step: previous });
  }

  function jumpToStep(target: FormStep) {
    setStep(target);
    setStepError(null);
    persistLocal({ step: target });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (step !== 7) {
      void handleNext();
      return;
    }

    const validationError = validateCurrentStep();
    if (validationError) {
      setStepError(validationError);
      return;
    }
    if (!paymentScreenshot?.id) {
      setStepError("Payment screenshot is required.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setStepError(null);
    try {
      const saved = await saveDraft({ ...form, consentConfirmed: true });
      const response = await membershipFetch(`/api/membership/applications/${saved.id}/submit`, {
        method: "POST",
        body: JSON.stringify({
          draft: sanitizeMembershipDraft({ ...form, consentConfirmed: true, idempotencyKey }),
          paymentScreenshotDocumentId: paymentScreenshot.id,
          idempotencyKey,
        }),
      });
      const payload = (await response.json()) as {
        application?: MembershipApplicationRecord;
        error?: string;
      };
      if (!response.ok || !payload.application) {
        throw new Error(payload.error || "Unable to submit application.");
      }
      clearLocalBackup();
      setSubmittedApplication(payload.application);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to submit application.");
    } finally {
      setSubmitting(false);
    }
  }

  const missingRequiredDocs = useMemo(
    () => MEMBERSHIP_REQUIRED_DOCUMENTS.filter((type) => !documents[type]?.id),
    [documents],
  );

  if (bootstrapping) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4 pt-24">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-zinc-400">Loading application...</p>
      </main>
    );
  }

  if (submittedApplication) {
    return (
      <main className="overflow-x-clip px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
        <section className="relative mx-auto max-w-2xl py-8 sm:py-10">
          <MotionSection>
            <Link
              className="inline-flex items-center text-xs font-black uppercase tracking-[0.16em] text-zinc-400 transition hover:text-white"
              href="/membership"
            >
              <ArrowLeft className="mr-2" size={14} aria-hidden />
              Back to Membership
            </Link>

            <div className="glass-panel mt-6 rounded-[1.5rem] p-8 text-center sm:p-10">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/15 text-emerald-300">
                <CheckCircle2 size={32} aria-hidden />
              </div>
              <h1 className="font-display mt-6 text-4xl uppercase text-white">Application Submitted</h1>
              <p className="mt-4 text-sm leading-7 text-zinc-400">
                Your local membership application has been received and is awaiting administrative review.
              </p>

              <div className="mt-6 space-y-3 text-left">
                <div className="flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                  <Clock3 className="mt-0.5 shrink-0" size={16} aria-hidden />
                  <span>
                    Application number <strong className="text-white">{submittedApplication.applicationNumber}</strong>
                    . Payment proof requires manual admin verification.
                  </span>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#FF1010] px-6 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#ff2828]"
                  href={`/membership/application/${submittedApplication.id}`}
                >
                  View Application Status
                </Link>
                <Link
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 px-6 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:border-[#FF1010]/40"
                  href="/membership/applications"
                >
                  All Applications
                </Link>
              </div>
            </div>
          </MotionSection>
        </section>
      </main>
    );
  }

  return (
    <main className="overflow-x-clip px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
      <section className="relative mx-auto max-w-3xl py-8 sm:py-10">
        <MotionSection>
          <button
            className="inline-flex items-center text-xs font-black uppercase tracking-[0.16em] text-zinc-400 transition hover:text-white"
            onClick={handleBack}
            type="button"
          >
            <ArrowLeft className="mr-2" size={14} aria-hidden />
            Back
          </button>

          <div className="mt-5">
            <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-[#FF1010]">Local Membership</p>
            <h1 className="font-display mt-2 text-3xl uppercase text-white sm:text-4xl">Membership Application</h1>
          </div>

          <form className="glass-panel mt-6 rounded-[1.5rem] p-5 sm:p-6" onSubmit={handleSubmit}>
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-[#FF1010]">
                  Step {step} of {TOTAL_STEPS}
                </p>
                <h2 className="font-display text-2xl uppercase text-white sm:text-3xl">{stepTitles[step - 1]}</h2>
              </div>
              <div className="hidden gap-1 sm:flex">
                {Array.from({ length: TOTAL_STEPS }, (_, index) => (
                  <span
                    className={`h-1.5 w-6 rounded-full ${step >= index + 1 ? "bg-[#FF1010]" : "bg-white/10"}`}
                    key={index}
                  />
                ))}
              </div>
            </div>

            <div className="py-4">
              {step === 1 ? (
                <FormGroup
                  columns={3}
                  description="Enter your legal name and personal details exactly as they should appear on your membership ID."
                  title="Personal Information"
                >
                  <Field label="First Name" onChange={(value) => updateField("firstName", value)} required value={form.firstName} />
                  <Field
                    label="Middle Name"
                    onChange={(value) => updateField("middleName", value)}
                    placeholder="Optional"
                    value={form.middleName}
                  />
                  <Field label="Last Name" onChange={(value) => updateField("lastName", value)} required value={form.lastName} />
                  <SelectField
                    label="Suffix"
                    onChange={(value) => updateField("suffix", value)}
                    options={suffixOptions}
                    placeholder="Optional"
                    value={form.suffix}
                  />
                  <SelectField
                    label="Gender"
                    onChange={(value) => updateField("gender", value)}
                    options={GENDER_OPTIONS}
                    required
                    value={form.gender}
                  />
                  <Field
                    label="Date of Birth"
                    onChange={(value) => updateField("dateOfBirth", value)}
                    required
                    type="date"
                    value={form.dateOfBirth}
                  />
                  <Field
                    label="Nationality"
                    onChange={(value) => updateField("nationality", value)}
                    required
                    value={form.nationality}
                  />
                  <Field
                    className="sm:col-span-2"
                    label="Place of Birth"
                    onChange={(value) => updateField("placeOfBirth", value)}
                    required
                    value={form.placeOfBirth}
                  />
                </FormGroup>
              ) : null}

              {step === 2 ? (
                <FormGroup description="Contact details and martial arts affiliation for membership records." title="Contact & Martial Arts">
                  <Field
                    label="Email Address"
                    onChange={(value) => updateField("contactEmail", value)}
                    required
                    type="email"
                    value={form.contactEmail}
                  />
                  <Field
                    label="Mobile Number"
                    onChange={(value) => updateField("mobileNumber", value)}
                    required
                    type="tel"
                    value={form.mobileNumber}
                  />
                  <Field
                    className="sm:col-span-2"
                    label="Facebook Profile URL"
                    onChange={(value) => updateField("facebookUrl", value)}
                    placeholder="https://facebook.com/..."
                    required
                    value={form.facebookUrl}
                  />
                  <Field
                    label="Fight Team / Gym"
                    onChange={(value) => updateField("fightTeam", value)}
                    required
                    value={form.fightTeam}
                  />
                  <Field
                    label="Martial Arts System"
                    onChange={(value) => updateField("martialArtsSystem", value)}
                    required
                    value={form.martialArtsSystem}
                  />
                </FormGroup>
              ) : null}

              {step === 3 ? (
                <FormGroup description="Provide an emergency contact who can be reached if needed." title="Emergency Contact">
                  <Field
                    label="Full Name"
                    onChange={(value) => updateField("emergencyContactName", value)}
                    required
                    value={form.emergencyContactName}
                  />
                  <Field
                    label="Relationship"
                    onChange={(value) => updateField("emergencyContactRelationship", value)}
                    required
                    value={form.emergencyContactRelationship}
                  />
                  <Field
                    label="Contact Number"
                    onChange={(value) => updateField("emergencyContactPhone", value)}
                    required
                    type="tel"
                    value={form.emergencyContactPhone}
                  />
                  <TextAreaField
                    className="sm:col-span-2"
                    label="Address"
                    onChange={(value) => updateField("emergencyContactAddress", value)}
                    required
                    value={form.emergencyContactAddress}
                  />
                </FormGroup>
              ) : null}

              {step === 4 ? (
                <div className="space-y-4">
                  <FormGroup
                    columns={2}
                    description="Upload clear JPG, PNG, or PDF files up to 5MB. Re-uploading replaces the previous file."
                    title="Required Documents"
                  >
                    {MEMBERSHIP_REQUIRED_DOCUMENTS.map((documentType) => (
                      <div key={documentType}>
                        <FileUploadField
                          accept="image/jpeg,image/jpg,image/png,application/pdf"
                          label={membershipDocumentTypeLabels[documentType]}
                          onFileSelect={(file) => uploadDocument(documentType, file)}
                          required={!documents[documentType]?.id}
                          value={documents[documentType]?.id ?? ""}
                        />
                        <p className="mt-2 text-xs text-zinc-500">
                          {uploadingType === documentType
                            ? "Uploading..."
                            : documents[documentType]?.filename
                              ? `File: ${documents[documentType]?.filename}`
                              : "No file selected yet"}
                        </p>
                      </div>
                    ))}
                  </FormGroup>
                  {missingRequiredDocs.length ? (
                    <p className="text-xs text-zinc-500">
                      Still needed: {missingRequiredDocs.map((type) => membershipDocumentTypeLabels[type]).join(", ")}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {step === 5 ? (
                <FormGroup description="Where should we deliver your physical membership ID?" title="Delivery Details">
                  <Field
                    className="sm:col-span-2"
                    label="Recipient Legal Name"
                    onChange={(value) => updateField("deliveryRecipientName", value)}
                    required
                    value={form.deliveryRecipientName}
                  />
                  <TextAreaField
                    className="sm:col-span-2"
                    label="Complete Delivery Address"
                    onChange={(value) => updateField("deliveryAddress", value)}
                    required
                    value={form.deliveryAddress}
                  />
                  <Field
                    label="ZIP Code"
                    onChange={(value) => updateField("deliveryZip", value)}
                    required
                    value={form.deliveryZip}
                  />
                  <Field
                    label="Landmark"
                    onChange={(value) => updateField("deliveryLandmark", value)}
                    required
                    value={form.deliveryLandmark}
                  />
                  <Field
                    className="sm:col-span-2"
                    label="Active Contact Number"
                    onChange={(value) => updateField("deliveryContact", value)}
                    required
                    type="tel"
                    value={form.deliveryContact}
                  />
                </FormGroup>
              ) : null}

              {step === 6 ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-amber-400/25 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
                    Payment proof requires manual admin verification. Submitting a screenshot does not mean your payment
                    has been verified.
                  </div>

                  <FormGroup description="Pay via GCash, Maya, QR PH, or cash, then upload your proof." title="Payment">
                    <SelectField
                      label="Payment Method"
                      onChange={(value) => updateField("paymentMethod", value as MembershipPaymentMethod | "")}
                      optionLabels={membershipPaymentMethodLabels}
                      options={PAYMENT_METHODS}
                      required
                      value={form.paymentMethod}
                    />
                    <Field
                      label="Amount Paid (PHP)"
                      onChange={(value) => updateField("amountPaid", Number(value) || 0)}
                      required
                      type="number"
                      value={form.amountPaid ? String(form.amountPaid) : ""}
                    />
                    <Field
                      className="sm:col-span-2"
                      label="Transaction / Reference Number"
                      onChange={(value) => updateField("paymentReferenceNumber", value)}
                      placeholder={form.paymentMethod === "cash" ? "Optional for cash" : "Required"}
                      required={form.paymentMethod !== "cash"}
                      value={form.paymentReferenceNumber}
                    />
                  </FormGroup>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                      <p className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500">GCash</p>
                      <p className="mt-2 font-mono text-lg text-white">{GCASH_PAYMENT_NUMBER}</p>
                      <div className="relative mt-4 aspect-square overflow-hidden rounded-xl border border-white/10 bg-black/40">
                        <Image alt="GCash QR code" className="object-contain p-2" fill sizes="240px" src={GCASH_QR_SRC} />
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                      <p className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500">Maya</p>
                      <p className="mt-2 text-sm text-zinc-400">Scan the Maya QR to pay.</p>
                      <div className="relative mt-4 aspect-square overflow-hidden rounded-xl border border-white/10 bg-black/40">
                        <Image alt="Maya QR code" className="object-contain p-2" fill sizes="240px" src={MAYA_QR_SRC} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <FileUploadField
                      accept="image/jpeg,image/jpg,image/png,application/pdf"
                      label="Payment Screenshot"
                      onFileSelect={(file) => uploadDocument("PAYMENT_SCREENSHOT", file)}
                      required={!paymentScreenshot?.id}
                      value={paymentScreenshot?.id ?? ""}
                    />
                    <p className="mt-2 text-xs text-zinc-500">
                      {uploadingType === "PAYMENT_SCREENSHOT"
                        ? "Uploading..."
                        : paymentScreenshot?.filename
                          ? `File: ${paymentScreenshot.filename}`
                          : "Upload your payment confirmation screenshot"}
                    </p>
                  </div>
                </div>
              ) : null}

              {step === 7 ? (
                <div className="space-y-4">
                  {(
                    [
                      [1, "Personal", `${form.firstName} ${form.middleName} ${form.lastName}`.replace(/\s+/g, " ").trim()],
                      [2, "Contact & Martial", `${form.contactEmail} · ${form.fightTeam}`],
                      [3, "Emergency", form.emergencyContactName],
                      [4, "Documents", `${MEMBERSHIP_REQUIRED_DOCUMENTS.length - missingRequiredDocs.length}/${MEMBERSHIP_REQUIRED_DOCUMENTS.length} uploaded`],
                      [5, "Delivery", form.deliveryRecipientName],
                      [
                        6,
                        "Payment",
                        form.paymentMethod
                          ? `${membershipPaymentMethodLabels[form.paymentMethod as MembershipPaymentMethod]} · ₱${form.amountPaid || 0}`
                          : "Not set",
                      ],
                    ] as const
                  ).map(([target, label, summary]) => (
                    <div
                      className="flex items-start justify-between gap-3 rounded-2xl border border-white/8 bg-black/20 p-4"
                      key={target}
                    >
                      <div className="min-w-0">
                        <p className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500">{label}</p>
                        <p className="mt-1 truncate text-sm text-white">{summary}</p>
                      </div>
                      <button
                        className="inline-flex shrink-0 items-center text-xs font-black uppercase tracking-[0.14em] text-[#FF1010]"
                        onClick={() => jumpToStep(target)}
                        type="button"
                      >
                        <Pencil className="mr-1.5" size={12} aria-hidden />
                        Edit
                      </button>
                    </div>
                  ))}

                  <div className="grid gap-3 sm:grid-cols-2">
                    <ReviewRow label="Mobile" value={form.mobileNumber} />
                    <ReviewRow label="Martial Arts System" value={form.martialArtsSystem} />
                    <ReviewRow label="Delivery Address" value={form.deliveryAddress} />
                    <ReviewRow label="Payment Reference" value={form.paymentReferenceNumber} />
                  </div>

                  <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm leading-6 text-zinc-300">
                    <input
                      checked={form.consentConfirmed}
                      className="mt-1 h-4 w-4 accent-[#FF1010]"
                      onChange={(event) => updateField("consentConfirmed", event.target.checked)}
                      type="checkbox"
                    />
                    <span>
                      I confirm that the information and documents I provided are accurate and complete. I understand that
                      payment proof requires manual admin verification and that submitting this form does not guarantee
                      approval.
                    </span>
                  </label>
                </div>
              ) : null}
            </div>

            {stepError || error ? (
              <p className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {stepError || error}
              </p>
            ) : null}

            <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-4 sm:flex-row sm:justify-between">
              <button
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 px-5 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:border-[#FF1010]/40"
                onClick={handleBack}
                type="button"
              >
                <ArrowLeft className="mr-2" size={14} aria-hidden />
                Back
              </button>
              <button
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#FF1010] px-6 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#ff2828] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={saving || submitting || Boolean(uploadingType)}
                type="submit"
              >
                {step === 7 ? (submitting ? "Submitting..." : "Submit Application") : saving ? "Saving..." : "Continue"}
                {step === 7 ? null : <ArrowRight className="ml-2" size={14} aria-hidden />}
                {step === 7 ? <Upload className="ml-2" size={14} aria-hidden /> : null}
              </button>
            </div>
          </form>
        </MotionSection>
      </section>
    </main>
  );
}
