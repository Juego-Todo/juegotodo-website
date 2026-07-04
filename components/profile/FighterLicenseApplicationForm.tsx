"use client";

import { ArrowLeft, ArrowRight, BadgeCheck, CheckCircle2, Clock3, Mail, Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { MotionSection } from "@/components/MotionSection";
import { FighterLicenseIdPreview } from "@/components/profile/FighterLicenseIdPreview";
import { Field, FileUploadField, FormGroup, SelectField } from "@/components/profile/license-form-fields";
import {
  applicationToLicenseInput,
  bloodTypeOptions,
  buildLicenseFullName,
  emptyLicenseApplicationInput,
  fighterDominantHandOptions,
  fighterMedicalOptions,
  fighterStanceOptions,
  fighterWeightDivisionOptions,
  formatFighterRecord,
  getRestrictionLabel,
  hasFighterMedicalConfirmed,
  splitLegacyFullName,
  type LicenseApplication,
  type LicenseApplicationInput,
  type LicenseUploads,
} from "@/data/license-applications";
import type { UserProfile } from "@/lib/auth/types";
import type { ProfileIdentity } from "@/lib/profile/identity";
import { readUploadAsDataUrl } from "@/lib/licenses/file-upload";
import { saveLicenseApplication } from "@/lib/licenses/storage";

const genderOptions = ["Male", "Female", "Non-binary", "Prefer not to say"];
const TOTAL_STEPS = 8;

const stepTitles = [
  "Personal Information",
  "Contact",
  "Address",
  "Physical Details",
  "Fight Information",
  "Experience",
  "Medical",
  "Uploads & Preview",
] as const;

type FormStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

type FighterLicenseApplicationFormProps = {
  user: UserProfile;
  userPhone: string;
  initialApplication: LicenseApplication | null;
  showConfirmationInitially: boolean;
};

export function FighterLicenseApplicationForm({
  user,
  userPhone,
  initialApplication,
  showConfirmationInitially,
}: FighterLicenseApplicationFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<FormStep>(1);
  const [form, setForm] = useState<LicenseApplicationInput>(() => {
    if (initialApplication) {
      return applicationToLicenseInput(initialApplication);
    }

    const legacyName = splitLegacyFullName(user.fullName);
    return {
      ...emptyLicenseApplicationInput,
      applicationProgram: "fighter_license",
      restrictionCode: "JT11",
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
        memberId: application?.idNumber ?? "FTR-PREVIEW",
        profileCompletion: 100,
        isFighter: true,
        isCoach: false,
        isOfficial: false,
        roles: ["fighter"],
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

  function toggleCheckboxField(fieldId: string, checked: boolean) {
    updateBackgroundField(fieldId, checked ? "yes" : "");
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
    if (!form.backgroundAnswers.nickname?.trim()) return "Nickname is required.";
    if (!form.gender) return "Please select a gender.";
    if (!form.dateOfBirth) return "Date of birth is required.";
    if (!form.nationality.trim()) return "Nationality is required.";
    return null;
  }

  function validateStep2() {
    if (!form.contactEmail.trim()) return "Email address is required.";
    if (!form.mobileNumber.trim()) return "Mobile number is required.";
    return null;
  }

  function validateStep3() {
    if (!form.addressCountry.trim()) return "Country is required.";
    if (!form.addressProvince.trim()) return "Province is required.";
    if (!form.addressCity.trim()) return "City/Municipality is required.";
    if (!form.addressBarangay.trim()) return "Barangay is required.";
    if (!form.addressZip.trim()) return "ZIP code is required.";
    return null;
  }

  function validateStep4() {
    if (!form.backgroundAnswers.fighterHeight?.trim()) return "Height is required.";
    if (!form.backgroundAnswers.fighterWeight?.trim()) return "Weight is required.";
    if (!form.backgroundAnswers.reach?.trim()) return "Reach is required.";
    if (!form.bloodType) return "Blood type is required.";
    return null;
  }

  function validateStep5() {
    if (!form.backgroundAnswers.weightDivision?.trim()) return "Weight division is required.";
    if (!form.backgroundAnswers.stance?.trim()) return "Stance is required.";
    if (!form.backgroundAnswers.dominantHand?.trim()) return "Dominant hand is required.";
    if (!form.backgroundAnswers.fightTeam?.trim()) return "Fight team is required.";
    if (!form.backgroundAnswers.coachName?.trim()) return "Coach is required.";
    if (!form.backgroundAnswers.gym?.trim()) return "Gym is required.";
    return null;
  }

  function validateStep6() {
    if (!form.backgroundAnswers.amateurRecord?.trim()) return "Amateur record is required.";
    if (!form.backgroundAnswers.professionalRecord?.trim()) return "Professional record is required.";
    if (!form.backgroundAnswers.yearsTraining?.trim()) return "Years training is required.";
    return null;
  }

  function validateStep7() {
    if (!hasFighterMedicalConfirmed(form.backgroundAnswers)) {
      return "Confirm Medical Clearance, ECG, and Blood Test to continue.";
    }
    return null;
  }

  function validateStep8() {
    if (!form.uploads.governmentId) return "Government ID upload is required.";
    if (!form.uploads.medicalCertificate) return "Medical certificate upload is required.";
    if (!form.uploads.profilePhoto) return "Profile photo upload is required.";
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
      case 6:
        return validateStep6();
      case 7:
        return validateStep7();
      case 8:
        return validateStep8();
      default:
        return null;
    }
  }

  function validateAll() {
    return (
      validateStep1() ||
      validateStep2() ||
      validateStep3() ||
      validateStep4() ||
      validateStep5() ||
      validateStep6() ||
      validateStep7() ||
      validateStep8()
    );
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
    router.replace("/register-for-license/fighter");
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
      setError(caught instanceof Error ? caught.message : "Unable to submit fighter license application.");
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
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/15 text-emerald-300">
                <CheckCircle2 size={32} aria-hidden />
              </div>
              <h1 className="font-display mt-6 text-4xl uppercase text-white">Application Submitted</h1>
              <p className="mt-4 text-sm leading-7 text-zinc-400">
                {buildLicenseFullName(form)}
                {form.backgroundAnswers.nickname ? ` "${form.backgroundAnswers.nickname}"` : ""} •{" "}
                {form.backgroundAnswers.weightDivision || getRestrictionLabel(form.restrictionCode)}
              </p>
              {formatFighterRecord(form.backgroundAnswers) ? (
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-red-200">
                  {formatFighterRecord(form.backgroundAnswers)}
                </p>
              ) : null}

              <div className="mt-6 space-y-3 text-left">
                <ConfirmationRow icon={Clock3} label="Pending admin review" tone="amber" />
                <ConfirmationRow icon={Mail} label={`Confirmation email sent to ${user.email}`} tone="emerald" />
              </div>

              {isApproved ? (
                <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-emerald-200">
                  <BadgeCheck size={16} aria-hidden />
                  Fighter License Approved
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
            <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-[#FF1010]">Fighter License</p>
            <h1 className="font-display mt-2 text-3xl uppercase text-white sm:text-4xl">Fighter Application</h1>
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
                  description="Enter your legal name and fight name exactly as they should appear on your fighter license."
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
                  <Field
                    label="Nickname"
                    onChange={(value) => updateBackgroundField("nickname", value)}
                    placeholder="Fight name or ring nickname"
                    required
                    value={form.backgroundAnswers.nickname ?? ""}
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
                </FormGroup>
              ) : null}

              {step === 2 ? (
                <FormGroup description="We will use these details for application updates and competition correspondence." title="Contact">
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
                <FormGroup description="Provide your current residential address." title="Address">
                  <Field
                    label="Country"
                    onChange={(value) => updateField("addressCountry", value)}
                    required
                    value={form.addressCountry}
                  />
                  <Field
                    label="Province"
                    onChange={(value) => updateField("addressProvince", value)}
                    required
                    value={form.addressProvince}
                  />
                  <Field
                    label="City/Municipality"
                    onChange={(value) => updateField("addressCity", value)}
                    required
                    value={form.addressCity}
                  />
                  <Field
                    label="Barangay"
                    onChange={(value) => updateField("addressBarangay", value)}
                    required
                    value={form.addressBarangay}
                  />
                  <Field
                    label="ZIP Code"
                    onChange={(value) => updateField("addressZip", value)}
                    required
                    value={form.addressZip}
                  />
                </FormGroup>
              ) : null}

              {step === 4 ? (
                <FormGroup columns={2} description="Enter your physical measurements for competition registration." title="Physical Details">
                  <Field
                    label="Height"
                    onChange={(value) => updateBackgroundField("fighterHeight", value)}
                    placeholder="e.g. 5'8&quot; or 173 cm"
                    required
                    value={form.backgroundAnswers.fighterHeight ?? ""}
                  />
                  <Field
                    label="Weight"
                    onChange={(value) => updateBackgroundField("fighterWeight", value)}
                    placeholder="e.g. 70 kg"
                    required
                    value={form.backgroundAnswers.fighterWeight ?? ""}
                  />
                  <Field
                    label="Reach"
                    onChange={(value) => updateBackgroundField("reach", value)}
                    placeholder="e.g. 178 cm"
                    required
                    value={form.backgroundAnswers.reach ?? ""}
                  />
                  <SelectField
                    label="Blood Type"
                    onChange={(value) => updateField("bloodType", value)}
                    options={bloodTypeOptions}
                    required
                    value={form.bloodType}
                  />
                </FormGroup>
              ) : null}

              {step === 5 ? (
                <FormGroup columns={2} description="Provide your competition profile and team affiliation." title="Fight Information">
                  <SelectField
                    label="Weight Division"
                    onChange={(value) => updateBackgroundField("weightDivision", value)}
                    options={fighterWeightDivisionOptions}
                    required
                    value={form.backgroundAnswers.weightDivision ?? ""}
                  />
                  <SelectField
                    label="Stance"
                    onChange={(value) => updateBackgroundField("stance", value)}
                    options={fighterStanceOptions}
                    required
                    value={form.backgroundAnswers.stance ?? ""}
                  />
                  <SelectField
                    label="Dominant Hand"
                    onChange={(value) => updateBackgroundField("dominantHand", value)}
                    options={fighterDominantHandOptions}
                    required
                    value={form.backgroundAnswers.dominantHand ?? ""}
                  />
                  <Field
                    label="Fight Team"
                    onChange={(value) => updateBackgroundField("fightTeam", value)}
                    required
                    value={form.backgroundAnswers.fightTeam ?? ""}
                  />
                  <Field
                    label="Coach"
                    onChange={(value) => updateBackgroundField("coachName", value)}
                    required
                    value={form.backgroundAnswers.coachName ?? ""}
                  />
                  <Field
                    label="Gym"
                    onChange={(value) => updateBackgroundField("gym", value)}
                    required
                    value={form.backgroundAnswers.gym ?? ""}
                  />
                </FormGroup>
              ) : null}

              {step === 6 ? (
                <FormGroup columns={2} description="Summarize your amateur and professional competition history." title="Experience">
                  <Field
                    label="Amateur Record"
                    onChange={(value) => updateBackgroundField("amateurRecord", value)}
                    placeholder="e.g. 12-2-0"
                    required
                    value={form.backgroundAnswers.amateurRecord ?? ""}
                  />
                  <Field
                    label="Professional Record"
                    onChange={(value) => updateBackgroundField("professionalRecord", value)}
                    placeholder="e.g. 5-1-0"
                    required
                    value={form.backgroundAnswers.professionalRecord ?? ""}
                  />
                  <Field
                    label="Years Training"
                    onChange={(value) => updateBackgroundField("yearsTraining", value)}
                    placeholder="e.g. 8"
                    required
                    type="number"
                    value={form.backgroundAnswers.yearsTraining ?? ""}
                  />
                </FormGroup>
              ) : null}

              {step === 7 ? (
                <FormGroup description="Confirm that all required medical screenings are complete and current." title="Medical">
                  <div className="space-y-3 sm:col-span-2">
                    {fighterMedicalOptions.map((item) => (
                      <label
                        className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-4 transition hover:border-red-500/30"
                        key={item.id}
                      >
                        <input
                          checked={form.backgroundAnswers[item.id] === "yes"}
                          className="mt-0.5 h-4 w-4 rounded border-white/20 bg-black/40 text-[#FF1010] focus:ring-[#FF1010]"
                          onChange={(event) => toggleCheckboxField(item.id, event.target.checked)}
                          type="checkbox"
                        />
                        <span>
                          <span className="block text-sm font-semibold text-white">{item.label}</span>
                          <span className="mt-0.5 block text-xs text-zinc-500">
                            I confirm this medical requirement is complete and valid for competition.
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </FormGroup>
              ) : null}

              {step === 8 ? (
                <div className="space-y-4">
                  <FormGroup
                    description="Upload your government ID, medical certificate, profile photo, and signature."
                    title="Uploads"
                  >
                    <FileUploadField
                      accept="image/*,.pdf"
                      label="Government ID"
                      onFileSelect={(file) => updateUploadField("governmentId", file)}
                      required
                      value={form.uploads.governmentId}
                    />
                    <FileUploadField
                      accept="image/*,.pdf"
                      label="Medical Certificate"
                      onFileSelect={(file) => updateUploadField("medicalCertificate", file)}
                      required
                      value={form.uploads.medicalCertificate}
                    />
                    <FileUploadField
                      accept="image/*"
                      label="Profile Photo"
                      onFileSelect={(file) => updateUploadField("profilePhoto", file)}
                      required
                      value={form.uploads.profilePhoto}
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

                  <section className="rounded-2xl border border-red-500/15 bg-black/20 p-4 sm:p-5">
                    <div className="mb-4 border-b border-white/8 pb-3">
                      <h3 className="text-xs font-black uppercase tracking-[0.18em] text-red-300">Fighter License Preview</h3>
                      <p className="mt-1.5 text-xs leading-5 text-zinc-500">
                        Review your official JTGC fighter credential before submission. Drag to rotate the card.
                      </p>
                    </div>
                    <FighterLicenseIdPreview form={form} identity={previewIdentity} user={user} />
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
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#FF1010] px-8 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-red-600"
                    onClick={handleNext}
                    type="button"
                  >
                    Next
                    <ArrowRight className="ml-2" size={14} aria-hidden />
                  </button>
                ) : (
                  <button
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#FF1010] px-8 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-red-600 disabled:opacity-60"
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
    <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${toneClasses[tone]}`}>
      <Icon size={18} aria-hidden />
      <span className="text-sm">{label}</span>
    </div>
  );
}
