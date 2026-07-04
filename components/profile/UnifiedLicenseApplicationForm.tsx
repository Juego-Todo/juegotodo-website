"use client";

import { ArrowLeft, ArrowRight, BadgeCheck, CheckCircle2, Clock3, Mail, Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { MotionSection } from "@/components/MotionSection";
import { FileUploadField, FormGroup } from "@/components/profile/license-form-fields";
import { LicenseIdPreviewSwitch } from "@/components/profile/LicenseIdPreviewSwitch";
import {
  AddressSection,
  ContactSection,
  EmergencyContactSection,
  PersonalInformationSection,
  RoleDetailsSections,
} from "@/components/profile/LicenseFormSections";
import {
  getLicenseFormContext,
  OPTIONAL_UPLOADS,
  validateAddressStep,
  validateContactStep,
  validateEmergencyStep,
  validatePersonalStep,
  validateRoleDetailsStep,
  validateUnifiedLicenseForm,
  validateUploadsStep,
} from "@/data/license-form-config";
import type { LicenseProgramPresetKey } from "@/data/license-program-presets";
import { LICENSE_PROGRAM_PRESETS } from "@/data/license-program-presets";
import {
  applicationToLicenseInput,
  buildLicenseFullName,
  buildPreviewIdNumber,
  emptyLicenseApplicationInput,
  getRestrictionLabel,
  resolveApplicationProgram,
  splitLegacyFullName,
  type LicenseApplication,
  type LicenseApplicationInput,
  type LicenseUploads,
} from "@/data/license-applications";
import type { UserProfile } from "@/lib/auth/types";
import type { ProfileIdentity } from "@/lib/profile/identity";
import { readUploadAsDataUrl } from "@/lib/licenses/file-upload";
import { saveLicenseApplication } from "@/lib/licenses/storage";

const STEP_TITLES = [
  "Personal Information",
  "Contact",
  "Address",
  "Role Details",
  "Emergency Contact",
  "Uploads & Preview",
] as const;

const TOTAL_STEPS = STEP_TITLES.length;
type FormStep = 1 | 2 | 3 | 4 | 5 | 6;

type UnifiedLicenseApplicationFormProps = {
  user: UserProfile;
  userPhone: string;
  initialApplication: LicenseApplication | null;
  showConfirmationInitially: boolean;
  presetKey: LicenseProgramPresetKey;
};

export function UnifiedLicenseApplicationForm({
  user,
  userPhone,
  initialApplication,
  showConfirmationInitially,
  presetKey,
}: UnifiedLicenseApplicationFormProps) {
  const preset = LICENSE_PROGRAM_PRESETS[presetKey];
  const router = useRouter();
  const [step, setStep] = useState<FormStep>(1);
  const [form, setForm] = useState<LicenseApplicationInput>(() => {
    if (initialApplication) {
      const input = applicationToLicenseInput(initialApplication);
      return {
        ...input,
        applicationProgram: preset.program,
        restrictionCode: input.restrictionCode || preset.restrictionCode,
      };
    }

    const legacyName = splitLegacyFullName(user.fullName);
    return {
      ...emptyLicenseApplicationInput,
      applicationProgram: preset.program,
      restrictionCode: preset.restrictionCode,
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

  const ctx = getLicenseFormContext(form, preset);
  const isApproved = application?.status === "approved";
  const previewIdentity = useMemo(() => {
    const program = resolveApplicationProgram(form);
    return {
      memberId: application?.idNumber ?? buildPreviewIdNumber(program),
      profileCompletion: 100,
      isFighter: program === "fighter_license",
      isCoach: program === "coach_license" || program === "senior_coach_license",
      isOfficial: program !== "jt1_member" && program !== "fighter_license",
      roles: [],
      verifications: [],
      recentActivity: [],
    } satisfies ProfileIdentity;
  }, [application?.idNumber, form]);

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

  function validateStep(currentStep: FormStep) {
    switch (currentStep) {
      case 1:
        return validatePersonalStep(form);
      case 2:
        return validateContactStep(form);
      case 3:
        return validateAddressStep(form);
      case 4:
        return validateRoleDetailsStep(form, preset);
      case 5:
        return validateEmergencyStep(form);
      case 6:
        return validateUploadsStep(form);
      default:
        return null;
    }
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
    router.replace(preset.href);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateUnifiedLicenseForm(form, preset);
    if (validationError) {
      setStepError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);
    setStepError(null);

    try {
      const saved = await saveLicenseApplication(user.id, user.email, {
        ...form,
        applicationProgram: preset.program,
      });
      setApplication(saved);
      setShowConfirmation(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to submit license application.");
    } finally {
      setSubmitting(false);
    }
  }

  const sectionProps = {
    form,
    ctx,
    updateField,
    updateBackgroundField,
    toggleCheckboxField,
  };

  if (showConfirmation && application) {
    return (
      <main className="overflow-hidden px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
        <section className="relative mx-auto max-w-2xl py-8 sm:py-10">
          <MotionSection>
            <Link className="inline-flex items-center text-xs font-black uppercase tracking-[0.16em] text-zinc-400 transition hover:text-white" href="/profile">
              <ArrowLeft className="mr-2" size={14} aria-hidden />
              Back
            </Link>

            <div className="glass-panel mt-6 rounded-[1.5rem] p-8 text-center sm:p-10">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/15 text-emerald-300">
                <CheckCircle2 size={32} aria-hidden />
              </div>
              <h1 className="font-display mt-6 text-4xl uppercase text-white">Application Submitted</h1>
              <p className="mt-4 text-sm leading-7 text-zinc-400">
                {buildLicenseFullName(form)} • {getRestrictionLabel(form.restrictionCode)}
              </p>

              <div className="mt-6 space-y-3 text-left">
                <ConfirmationRow icon={Clock3} label="Pending admin review" tone="amber" />
                <ConfirmationRow icon={Mail} label={`Confirmation email sent to ${user.email}`} tone="emerald" />
              </div>

              {isApproved ? (
                <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-emerald-200">
                  <BadgeCheck size={16} aria-hidden />
                  License Approved
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
          <button className="inline-flex items-center text-xs font-black uppercase tracking-[0.16em] text-zinc-400 transition hover:text-white" onClick={handleBack} type="button">
            <ArrowLeft className="mr-2" size={14} aria-hidden />
            Back
          </button>

          <div className="mt-5">
            <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-[#FF1010]">{preset.label}</p>
            <h1 className="font-display mt-2 text-3xl uppercase text-white sm:text-4xl">{preset.title}</h1>
          </div>

          {application?.status === "rejected" && application.reviewNotes ? (
            <p className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">Admin note: {application.reviewNotes}</p>
          ) : null}

          <form className="glass-panel mt-6 rounded-[1.5rem] p-5 sm:p-6" onSubmit={handleSubmit}>
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-[#FF1010]">
                  Step {step} of {TOTAL_STEPS}
                </p>
                <h2 className="font-display text-2xl uppercase text-white sm:text-3xl">{STEP_TITLES[step - 1]}</h2>
              </div>
              <div className="hidden gap-1 sm:flex">
                {Array.from({ length: TOTAL_STEPS }, (_, index) => (
                  <span className={`h-1.5 w-6 rounded-full ${step >= index + 1 ? "bg-[#FF1010]" : "bg-white/10"}`} key={index} />
                ))}
              </div>
            </div>

            <div className="py-4">
              {step === 1 ? <PersonalInformationSection form={form} updateField={updateField} /> : null}
              {step === 2 ? <ContactSection form={form} updateField={updateField} /> : null}
              {step === 3 ? <AddressSection form={form} updateField={updateField} /> : null}
              {step === 4 ? <RoleDetailsSections {...sectionProps} /> : null}
              {step === 5 ? <EmergencyContactSection form={form} updateField={updateField} /> : null}
              {step === 6 ? (
                <div className="space-y-4">
                  <FormGroup description="Required for all JTGC license applications." title="Required Uploads">
                    <FileUploadField accept="image/*" label="Profile Photo" onFileSelect={(file) => updateUploadField("profilePhoto", file)} required value={form.uploads.profilePhoto} />
                    <FileUploadField accept="image/*,.pdf" label="Government ID" onFileSelect={(file) => updateUploadField("governmentId", file)} required value={form.uploads.governmentId} />
                    <FileUploadField accept="image/*" className="sm:col-span-2" label="Digital Signature" onFileSelect={(file) => updateUploadField("signature", file)} required value={form.uploads.signature} />
                  </FormGroup>

                  <FormGroup description="Optional supporting documents. Upload any that apply to your application." title="Optional Uploads">
                    {OPTIONAL_UPLOADS.map((upload) => (
                      <FileUploadField
                        accept="image/*,.pdf"
                        key={upload.key}
                        label={upload.label}
                        onFileSelect={(file) => updateUploadField(upload.key, file)}
                        value={form.uploads[upload.key]}
                      />
                    ))}
                  </FormGroup>

                  <section className="rounded-2xl border border-[#FF1010]/15 bg-black/20 p-4 sm:p-5">
                    <div className="mb-4 border-b border-white/8 pb-3">
                      <h3 className="text-xs font-black uppercase tracking-[0.18em] text-red-300">License Preview</h3>
                      <p className="mt-1.5 text-xs leading-5 text-zinc-500">Review your official JTGC credential before submission. Drag to rotate the card.</p>
                    </div>
                    <LicenseIdPreviewSwitch form={form} identity={previewIdentity} user={user} />
                  </section>
                </div>
              ) : null}
            </div>

            <div className="space-y-3 border-t border-white/10 pt-4">
              {stepError ? <p className="text-sm text-red-300">{stepError}</p> : null}
              {error ? <p className="text-sm text-red-300">{error}</p> : null}

              <div className="flex items-center justify-between gap-3">
                {step > 1 ? (
                  <button className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/10 px-6 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-white/5" onClick={handleBack} type="button">
                    <ArrowLeft className="mr-2" size={14} aria-hidden />
                    Back
                  </button>
                ) : (
                  <span />
                )}

                {step < TOTAL_STEPS ? (
                  <button className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#FF1010] px-8 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-red-600" onClick={handleNext} type="button">
                    Next
                    <ArrowRight className="ml-2" size={14} aria-hidden />
                  </button>
                ) : (
                  <button className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#FF1010] px-8 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-red-600 disabled:opacity-60" disabled={submitting} type="submit">
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

function ConfirmationRow({ icon: Icon, label, tone }: { icon: typeof Clock3; label: string; tone: "amber" | "emerald" }) {
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
