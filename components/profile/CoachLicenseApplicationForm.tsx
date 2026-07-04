"use client";

import { ArrowLeft, ArrowRight, BadgeCheck, CheckCircle2, Clock3, Mail, Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { MotionSection } from "@/components/MotionSection";
import { CoachLicenseIdPreview } from "@/components/profile/CoachLicenseIdPreview";
import { Field, FileUploadField, FormGroup, SelectField, TextAreaField } from "@/components/profile/license-form-fields";
import {
  applicationToLicenseInput,
  bloodTypeOptions,
  buildLicenseFullName,
  civilStatusOptions,
  coachLevelOptions,
  emptyLicenseApplicationInput,
  philippineRegions,
  splitLegacyFullName,
  suffixOptions,
  type LicenseApplication,
  type LicenseApplicationInput,
  type LicenseUploads,
} from "@/data/license-applications";
import type { UserProfile } from "@/lib/auth/types";
import type { ProfileIdentity } from "@/lib/profile/identity";
import { readUploadAsDataUrl } from "@/lib/licenses/file-upload";
import { saveLicenseApplication } from "@/lib/licenses/storage";

const genderOptions = ["Male", "Female", "Non-binary", "Prefer not to say"];
const TOTAL_STEPS = 4;

const stepTitles = ["Personal Information", "Coaching Information", "Experience", "Uploads & Preview"] as const;

type FormStep = 1 | 2 | 3 | 4;

type CoachLicenseApplicationFormProps = {
  user: UserProfile;
  userPhone: string;
  initialApplication: LicenseApplication | null;
  showConfirmationInitially: boolean;
};

export function CoachLicenseApplicationForm({
  user,
  userPhone,
  initialApplication,
  showConfirmationInitially,
}: CoachLicenseApplicationFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<FormStep>(1);
  const [form, setForm] = useState<LicenseApplicationInput>(() => {
    if (initialApplication) {
      return applicationToLicenseInput(initialApplication);
    }

    const legacyName = splitLegacyFullName(user.fullName);
    return {
      ...emptyLicenseApplicationInput,
      applicationProgram: "coach_license",
      restrictionCode: "JT10",
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
  const previewIdentity = useMemo(
    () =>
      ({
        memberId: application?.idNumber ?? "COA-PREVIEW",
        profileCompletion: 100,
        isFighter: false,
        isCoach: true,
        isOfficial: false,
        roles: ["coach"],
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
    if (!form.contactEmail.trim()) return "Email address is required.";
    if (!form.mobileNumber.trim()) return "Mobile number is required.";
    return null;
  }

  function validateStep2() {
    if (!form.backgroundAnswers.coachingLevel?.trim()) return "Coaching level is required.";
    if (!form.backgroundAnswers.yearsCoaching?.trim()) return "Years coaching is required.";
    if (!form.backgroundAnswers.mainStyle?.trim()) return "Main style is required.";
    if (!form.backgroundAnswers.coachingClub?.trim()) return "Club is required.";
    if (!form.backgroundAnswers.coachingProvince?.trim()) return "Province is required.";
    if (!form.backgroundAnswers.coachingRegion?.trim()) return "Region is required.";
    return null;
  }

  function validateStep3() {
    if (!form.backgroundAnswers.numberOfStudents?.trim()) return "Number of students is required.";
    if (!form.backgroundAnswers.championshipsCoached?.trim()) return "Championships coached is required.";
    if (!form.backgroundAnswers.certifications?.trim()) return "Certifications is required.";
    return null;
  }

  function validateStep4() {
    if (!form.uploads.coachingCertificates) return "Coaching certificates upload is required.";
    if (!form.uploads.profilePhoto) return "Profile photo upload is required.";
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
      default:
        return null;
    }
  }

  function validateAll() {
    return validateStep1() || validateStep2() || validateStep3() || validateStep4();
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
    router.replace("/register-for-license/coach");
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
      setError(caught instanceof Error ? caught.message : "Unable to submit coach license application.");
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
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-blue-500/15 text-blue-300">
                <CheckCircle2 size={32} aria-hidden />
              </div>
              <h1 className="font-display mt-6 text-4xl uppercase text-white">Application Submitted</h1>
              <p className="mt-4 text-sm leading-7 text-zinc-400">
                {buildLicenseFullName(form)} • {form.backgroundAnswers.coachingLevel}
              </p>
              <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-blue-300">
                Coach License ID will be issued as {application.idNumber} upon approval
              </p>

              <div className="mt-6 space-y-3 text-left">
                <ConfirmationRow icon={Clock3} label="Pending admin review" tone="amber" />
                <ConfirmationRow icon={Mail} label={`Confirmation email sent to ${user.email}`} tone="emerald" />
              </div>

              {isApproved ? (
                <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-emerald-200">
                  <BadgeCheck size={16} aria-hidden />
                  Coach License Active
                </p>
              ) : null}

              {!isApproved ? (
                <button
                  className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 px-8 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:border-blue-400/40 hover:bg-white/5"
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
            <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-blue-400">JTGC Coach License</p>
            <h1 className="font-display mt-2 text-3xl uppercase text-white sm:text-4xl">Coach Application</h1>
          </div>

          {application?.status === "rejected" && application.reviewNotes ? (
            <p className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">
              Admin note: {application.reviewNotes}
            </p>
          ) : null}

          <form className="glass-panel mt-6 rounded-[1.5rem] p-5 sm:p-6" onSubmit={handleSubmit}>
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-blue-400">
                  Step {step} of {TOTAL_STEPS}
                </p>
                <h2 className="font-display text-2xl uppercase text-white sm:text-3xl">{stepTitles[step - 1]}</h2>
              </div>
              <div className="hidden gap-1 sm:flex">
                {Array.from({ length: TOTAL_STEPS }, (_, index) => (
                  <span
                    className={`h-1.5 w-6 rounded-full ${step >= index + 1 ? "bg-blue-500" : "bg-white/10"}`}
                    key={index}
                  />
                ))}
              </div>
            </div>

            <div className="py-4">
              {step === 1 ? (
                <FormGroup
                  columns={3}
                  description="Enter your personal details for your official JTGC coach license."
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

              {step === 2 ? (
                <FormGroup description="Provide your coaching credentials and affiliated club details." title="Coaching Information">
                  <SelectField
                    className="sm:col-span-2"
                    label="Coaching Level"
                    onChange={(value) => updateBackgroundField("coachingLevel", value)}
                    options={coachLevelOptions}
                    required
                    value={form.backgroundAnswers.coachingLevel ?? ""}
                  />
                  <Field
                    label="Years Coaching"
                    onChange={(value) => updateBackgroundField("yearsCoaching", value)}
                    placeholder="e.g. 8"
                    required
                    type="number"
                    value={form.backgroundAnswers.yearsCoaching ?? ""}
                  />
                  <Field
                    label="Main Style"
                    onChange={(value) => updateBackgroundField("mainStyle", value)}
                    placeholder="e.g. Arnis, Boxing, MMA"
                    required
                    value={form.backgroundAnswers.mainStyle ?? ""}
                  />
                  <Field
                    className="sm:col-span-2"
                    label="Club"
                    onChange={(value) => updateBackgroundField("coachingClub", value)}
                    required
                    value={form.backgroundAnswers.coachingClub ?? ""}
                  />
                  <Field
                    label="Province"
                    onChange={(value) => updateBackgroundField("coachingProvince", value)}
                    required
                    value={form.backgroundAnswers.coachingProvince ?? ""}
                  />
                  <SelectField
                    label="Region"
                    onChange={(value) => updateBackgroundField("coachingRegion", value)}
                    options={philippineRegions}
                    required
                    value={form.backgroundAnswers.coachingRegion ?? ""}
                  />
                </FormGroup>
              ) : null}

              {step === 3 ? (
                <FormGroup description="Summarize your coaching experience and qualifications." title="Experience">
                  <Field
                    label="Number of Students"
                    onChange={(value) => updateBackgroundField("numberOfStudents", value)}
                    placeholder="e.g. 35"
                    required
                    type="number"
                    value={form.backgroundAnswers.numberOfStudents ?? ""}
                  />
                  <Field
                    label="Championships Coached"
                    onChange={(value) => updateBackgroundField("championshipsCoached", value)}
                    placeholder="e.g. 12 regional titles"
                    required
                    value={form.backgroundAnswers.championshipsCoached ?? ""}
                  />
                  <TextAreaField
                    className="sm:col-span-2"
                    label="Certifications"
                    onChange={(value) => updateBackgroundField("certifications", value)}
                    placeholder="List your coaching certifications, credentials, and training programs completed"
                    required
                    value={form.backgroundAnswers.certifications ?? ""}
                  />
                </FormGroup>
              ) : null}

              {step === 4 ? (
                <div className="space-y-4">
                  <FormGroup
                    description="Upload your coaching certificates, profile photo, government ID, and signature."
                    title="Uploads"
                  >
                    <FileUploadField
                      accept="image/*,.pdf"
                      className="sm:col-span-2"
                      label="Coaching Certificates"
                      onFileSelect={(file) => updateUploadField("coachingCertificates", file)}
                      required
                      value={form.uploads.coachingCertificates}
                    />
                    <FileUploadField
                      accept="image/*"
                      label="Profile Photo"
                      onFileSelect={(file) => updateUploadField("profilePhoto", file)}
                      required
                      value={form.uploads.profilePhoto}
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

                  <section className="rounded-2xl border border-blue-500/15 bg-black/20 p-4 sm:p-5">
                    <div className="mb-4 border-b border-white/8 pb-3">
                      <h3 className="text-xs font-black uppercase tracking-[0.18em] text-blue-300">Coach License Preview</h3>
                      <p className="mt-1.5 text-xs leading-5 text-zinc-500">
                        Review your official JTGC coach credential before submission. Drag to rotate the card.
                      </p>
                    </div>
                    <CoachLicenseIdPreview form={form} identity={previewIdentity} user={user} />
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
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-blue-600 px-8 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-blue-500"
                    onClick={handleNext}
                    type="button"
                  >
                    Next
                    <ArrowRight className="ml-2" size={14} aria-hidden />
                  </button>
                ) : (
                  <button
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-blue-600 px-8 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-blue-500 disabled:opacity-60"
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
