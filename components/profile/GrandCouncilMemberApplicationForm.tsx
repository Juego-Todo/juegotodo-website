"use client";

import { ArrowLeft, ArrowRight, BadgeCheck, CheckCircle2, Clock3, Mail, Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { MotionSection } from "@/components/MotionSection";
import { GrandCouncilMemberIdPreview } from "@/components/profile/GrandCouncilMemberIdPreview";
import { Field, FileUploadField, FormGroup, SelectField } from "@/components/profile/license-form-fields";
import {
  applicationToLicenseInput,
  bloodTypeOptions,
  buildLicenseFullName,
  civilStatusOptions,
  emptyLicenseApplicationInput,
  grandCouncilMemberCouncilPositions,
  splitLegacyFullName,
  suffixOptions,
  type LicenseApplication,
  type LicenseApplicationInput,
  type LicenseRestrictionCode,
  type LicenseUploads,
} from "@/data/license-applications";
import type { UserProfile } from "@/lib/auth/types";
import type { ProfileIdentity } from "@/lib/profile/identity";
import { readUploadAsDataUrl } from "@/lib/licenses/file-upload";
import { saveLicenseApplication } from "@/lib/licenses/storage";

const genderOptions = ["Male", "Female", "Non-binary", "Prefer not to say"];
const TOTAL_STEPS = 5;

const stepTitles = [
  "Personal Information",
  "Contact Information",
  "Council Information",
  "Emergency Contact",
  "Uploads & Preview",
] as const;

type FormStep = 1 | 2 | 3 | 4 | 5;

type GrandCouncilMemberApplicationFormProps = {
  user: UserProfile;
  userPhone: string;
  initialApplication: LicenseApplication | null;
  showConfirmationInitially: boolean;
};

export function GrandCouncilMemberApplicationForm({
  user,
  userPhone,
  initialApplication,
  showConfirmationInitially,
}: GrandCouncilMemberApplicationFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<FormStep>(1);
  const [form, setForm] = useState<LicenseApplicationInput>(() => {
    if (initialApplication) {
      return applicationToLicenseInput(initialApplication);
    }

    const legacyName = splitLegacyFullName(user.fullName);
    const defaultPosition = grandCouncilMemberCouncilPositions[0];

    return {
      ...emptyLicenseApplicationInput,
      applicationProgram: "grand_council_member",
      restrictionCode: defaultPosition.code,
      backgroundAnswers: {
        councilPosition: defaultPosition.label,
      },
      firstName: legacyName.firstName,
      middleName: legacyName.middleName,
      lastName: legacyName.lastName,
      contactEmail: user.email,
      mobileNumber: userPhone,
    };
  });
  const [application, setApplication] = useState(initialApplication);
  const [showConfirmation, setShowConfirmation] = useState(showConfirmationInitially);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);

  const isApproved = application?.status === "approved";
  const councilPositionOptions = useMemo(
    () => [...new Set(grandCouncilMemberCouncilPositions.map((option) => option.label))],
    [],
  );
  const previewIdentity = useMemo(
    () =>
      ({
        memberId: application?.idNumber ?? "GCM-PREVIEW",
        profileCompletion: 100,
        isFighter: false,
        isCoach: false,
        isOfficial: true,
        roles: ["grand_council"],
        verifications: [],
        recentActivity: [],
      }) satisfies ProfileIdentity,
    [application?.idNumber],
  );

  function updateField<K extends keyof LicenseApplicationInput>(key: K, value: LicenseApplicationInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setStepError(null);
    setError(null);
  }

  function updateBackgroundField(fieldId: string, value: string) {
    setForm((current) => ({
      ...current,
      backgroundAnswers: { ...current.backgroundAnswers, [fieldId]: value },
    }));
    setStepError(null);
    setError(null);
  }

  async function updateUploadField(key: keyof LicenseUploads, file: File) {
    try {
      const dataUrl = await readUploadAsDataUrl(file);
      setForm((current) => ({
        ...current,
        uploads: { ...current.uploads, [key]: dataUrl },
      }));
      setStepError(null);
      setError(null);
    } catch (caught) {
      setStepError(caught instanceof Error ? caught.message : "Unable to upload file.");
    }
  }

  function validateStep1() {
    if (!form.firstName.trim()) return "First name is required.";
    if (!form.lastName.trim()) return "Last name is required.";
    if (!form.gender) return "Please select a gender.";
    if (!form.dateOfBirth) return "Date of birth is required.";
    if (!form.nationality.trim()) return "Nationality is required.";
    if (!form.bloodType) return "Blood type is required.";
    return null;
  }

  function validateStep2() {
    if (!form.contactEmail.trim()) return "Email address is required.";
    if (!form.mobileNumber.trim()) return "Mobile number is required.";
    return null;
  }

  function validateStep3() {
    if (!form.backgroundAnswers.councilPosition?.trim()) return "Council position is required.";
    if (!form.backgroundAnswers.councilProvince?.trim()) return "Province is required.";
    if (!form.backgroundAnswers.appointmentDate?.trim()) return "Appointment date is required.";
    if (!form.backgroundAnswers.yearsInService?.trim()) return "Years in service is required.";
    return null;
  }

  function validateStep4() {
    if (!form.emergencyContactName.trim()) return "Emergency contact name is required.";
    if (!form.emergencyContactRelationship.trim()) return "Relationship is required.";
    if (!form.emergencyContactPhone.trim()) return "Emergency mobile number is required.";
    if (!form.emergencyContactAddress.trim()) return "Emergency contact address is required.";
    return null;
  }

  function validateStep5() {
    if (!form.uploads.appointmentLetter) return "Appointment letter upload is required.";
    if (!form.uploads.governmentId) return "Government ID upload is required.";
    if (!form.uploads.signature) return "Signature upload is required.";
    return null;
  }

  function validateStep(currentStep: FormStep) {
    switch (currentStep) {
      case 1:
        return validateStep1();
      case 2:
        return validateStep2();
      case 3:
        return validateStep3();
      case 4:
        return validateStep4();
      case 5:
        return validateStep5();
      default:
        return null;
    }
  }

  function validateAll() {
    return validateStep1() || validateStep2() || validateStep3() || validateStep4() || validateStep5();
  }

  function handleNext() {
    const validationError = validateStep(step);
    if (validationError) {
      setStepError(validationError);
      return;
    }

    setStepError(null);
    setStep((current) => Math.min(TOTAL_STEPS, current + 1) as FormStep);
  }

  function handleBack() {
    setStepError(null);
    if (step === 1) {
      router.push("/profile");
      return;
    }
    setStep((current) => Math.max(1, current - 1) as FormStep);
  }

  function handleEditApplication() {
    if (!application) {
      return;
    }

    setForm(applicationToLicenseInput(application));
    setShowConfirmation(false);
    setStep(1);
    setStepError(null);
    setError(null);
    router.replace("/register-for-license/grand-council-member");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateAll();
    if (validationError) {
      setStepError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);
    setStepError(null);

    try {
      const saved = await saveLicenseApplication(user.id, user.email, form);
      setApplication(saved);
      setShowConfirmation(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to submit member application.");
    } finally {
      setSubmitting(false);
    }
  }

  if (showConfirmation && application) {
    return (
      <main className="overflow-hidden px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
        <section className="relative mx-auto max-w-2xl py-8 sm:py-10">
          <MotionSection>
            <Link
              className="inline-flex items-center text-xs font-black uppercase tracking-[0.16em] text-zinc-400 transition hover:text-white"
              href="/profile"
            >
              <ArrowLeft className="mr-2" size={14} aria-hidden />
              Back
            </Link>

            <div className="glass-panel mt-6 rounded-[1.5rem] p-8 text-center sm:p-10">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-red-500/15 text-red-300">
                <CheckCircle2 size={32} aria-hidden />
              </div>
              <h1 className="font-display mt-6 text-4xl uppercase text-white">Application Submitted</h1>
              <p className="mt-4 text-sm leading-7 text-zinc-400">
                {buildLicenseFullName(form)} • {form.backgroundAnswers.councilPosition}
              </p>
              <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-red-300">
                Member ID will be issued as {application.idNumber} upon approval
              </p>

              <div className="mt-6 space-y-3 text-left">
                <ConfirmationRow icon={Clock3} label="Pending Grand Council review" tone="amber" />
                <ConfirmationRow icon={Mail} label={`Confirmation email sent to ${user.email}`} tone="emerald" />
              </div>

              {isApproved ? (
                <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-emerald-200">
                  <BadgeCheck size={16} aria-hidden />
                  Member ID Active
                </p>
              ) : null}

              {!isApproved ? (
                <button
                  className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 px-8 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:border-[#FF1010]/40 hover:bg-white/5"
                  onClick={handleEditApplication}
                  type="button"
                >
                  <Pencil className="mr-2" size={14} aria-hidden />
                  Edit Application
                </button>
              ) : null}
            </div>
          </MotionSection>
        </section>
      </main>
    );
  }

  return (
    <main className="overflow-hidden px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
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
            <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-[#FF1010]">Grand Council Member</p>
            <h1 className="font-display mt-2 text-3xl uppercase text-white sm:text-4xl">Council Application</h1>
          </div>

          {application?.status === "rejected" && application.reviewNotes ? (
            <p className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">
              Admin note: {application.reviewNotes}
            </p>
          ) : null}

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
                  description="Enter your legal name and personal details for your official Grand Council Member credential."
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
                    options={["", ...suffixOptions]}
                    placeholder="Optional"
                    value={form.suffix}
                  />
                  <SelectField
                    label="Gender"
                    onChange={(value) => updateField("gender", value)}
                    options={genderOptions}
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
                  <SelectField
                    label="Blood Type"
                    onChange={(value) => updateField("bloodType", value)}
                    options={bloodTypeOptions}
                    required
                    value={form.bloodType}
                  />
                  <SelectField
                    label="Civil Status"
                    onChange={(value) => updateField("civilStatus", value)}
                    options={["", ...civilStatusOptions]}
                    placeholder="Optional"
                    value={form.civilStatus}
                  />
                </FormGroup>
              ) : null}

              {step === 2 ? (
                <FormGroup description="Official contact details for Grand Council correspondence." title="Contact Information">
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
                </FormGroup>
              ) : null}

              {step === 3 ? (
                <FormGroup description="Provide your appointed council role and service details." title="Council Information">
                  <SelectField
                    className="sm:col-span-2"
                    label="Council Position"
                    onChange={(value) => {
                      const selected = grandCouncilMemberCouncilPositions.find((option) => option.label === value);
                      updateBackgroundField("councilPosition", value);
                      if (selected) {
                        updateField("restrictionCode", selected.code as LicenseRestrictionCode);
                      }
                    }}
                    options={councilPositionOptions}
                    required
                    value={form.backgroundAnswers.councilPosition ?? ""}
                  />
                  <Field
                    label="Province"
                    onChange={(value) => updateBackgroundField("councilProvince", value)}
                    required
                    value={form.backgroundAnswers.councilProvince ?? ""}
                  />
                  <Field
                    label="Appointment Date"
                    onChange={(value) => updateBackgroundField("appointmentDate", value)}
                    required
                    type="date"
                    value={form.backgroundAnswers.appointmentDate ?? ""}
                  />
                  <Field
                    className="sm:col-span-2"
                    label="Years in Service"
                    onChange={(value) => updateBackgroundField("yearsInService", value)}
                    placeholder="e.g. 5"
                    required
                    value={form.backgroundAnswers.yearsInService ?? ""}
                  />
                </FormGroup>
              ) : null}

              {step === 4 ? (
                <FormGroup description="Provide someone we can contact in case of emergency." title="Emergency Contact">
                  <Field
                    label="Contact Name"
                    onChange={(value) => updateField("emergencyContactName", value)}
                    required
                    value={form.emergencyContactName}
                  />
                  <Field
                    label="Relationship"
                    onChange={(value) => updateField("emergencyContactRelationship", value)}
                    placeholder="e.g. Spouse, Parent"
                    required
                    value={form.emergencyContactRelationship}
                  />
                  <Field
                    label="Mobile Number"
                    onChange={(value) => updateField("emergencyContactPhone", value)}
                    required
                    type="tel"
                    value={form.emergencyContactPhone}
                  />
                  <Field
                    className="sm:col-span-2"
                    label="Address"
                    onChange={(value) => updateField("emergencyContactAddress", value)}
                    required
                    value={form.emergencyContactAddress}
                  />
                </FormGroup>
              ) : null}

              {step === 5 ? (
                <div className="space-y-4">
                  <FormGroup description="Upload your appointment letter, valid government ID, and signature." title="Uploads">
                    <FileUploadField
                      accept="image/*,.pdf"
                      className="sm:col-span-2"
                      label="Appointment Letter"
                      onFileSelect={(file) => updateUploadField("appointmentLetter", file)}
                      required
                      value={form.uploads.appointmentLetter}
                    />
                    <FileUploadField
                      accept="image/*,.pdf"
                      label="Government ID"
                      onFileSelect={(file) => updateUploadField("governmentId", file)}
                      required
                      value={form.uploads.governmentId}
                    />
                    <FileUploadField
                      accept="image/*"
                      className="sm:col-span-2"
                      label="Signature"
                      onFileSelect={(file) => updateUploadField("signature", file)}
                      required
                      value={form.uploads.signature}
                    />
                  </FormGroup>

                  <section className="rounded-2xl border border-[#FF1010]/15 bg-black/20 p-4 sm:p-5">
                    <div className="mb-4 border-b border-white/8 pb-3">
                      <h3 className="text-xs font-black uppercase tracking-[0.18em] text-red-300">
                        Grand Council Member ID Preview
                      </h3>
                      <p className="mt-1.5 text-xs leading-5 text-zinc-500">
                        Review your generated council member credential before submission. Drag to rotate the card.
                      </p>
                    </div>
                    <GrandCouncilMemberIdPreview form={form} identity={previewIdentity} user={user} />
                  </section>
                </div>
              ) : null}
            </div>

            <div className="space-y-3 border-t border-white/10 pt-4">
              {stepError ? <p className="text-sm text-red-300">{stepError}</p> : null}
              {error ? <p className="text-sm text-red-300">{error}</p> : null}

              <div className="flex items-center justify-between gap-3">
                {step > 1 ? (
                  <button
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/10 px-6 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-white/5"
                    onClick={handleBack}
                    type="button"
                  >
                    <ArrowLeft className="mr-2" size={14} aria-hidden />
                    Back
                  </button>
                ) : (
                  <span />
                )}

                {step < TOTAL_STEPS ? (
                  <button
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#FF1010] px-8 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#ff2828]"
                    onClick={handleNext}
                    type="button"
                  >
                    Next
                    <ArrowRight className="ml-2" size={14} aria-hidden />
                  </button>
                ) : (
                  <button
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#FF1010] px-8 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#ff2828] disabled:opacity-60"
                    disabled={submitting}
                    type="submit"
                  >
                    {submitting ? "Submitting..." : application ? "Update Application" : "Submit Application"}
                  </button>
                )}
              </div>
            </div>
          </form>
        </MotionSection>
      </section>
    </main>
  );
}

function ConfirmationRow({
  icon: Icon,
  label,
  tone,
}: {
  icon: typeof Clock3;
  label: string;
  tone: "amber" | "emerald";
}) {
  const toneClasses = {
    amber: "border-amber-400/20 bg-amber-400/10 text-amber-100",
    emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
  };

  return (
    <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${toneClasses[tone]}`}>
      <Icon size={18} aria-hidden />
      {label}
    </div>
  );
}
