import {
  grandCouncilMemberCouncilPositions,
  grandCouncilOfficerPositions,
  grandCouncilOfficerRestrictionCodes,
  hasFighterMedicalConfirmed,
  hasJudgeLevelSelected,
  hasRefereeLevelSelected,
  hasRefereeRulesetSelected,
  hasTrainerDisciplineSelected,
  type LicenseApplication,
  type LicenseApplicationInput,
  type LicenseApplicationProgram,
  type LicenseRestrictionCode,
  type LicenseUploads,
} from "@/data/license-applications";

export type LicenseFormContext = {
  restrictionCode: LicenseRestrictionCode;
  applicationProgram: LicenseApplicationProgram;
};

export type LicenseProgramPreset = {
  program: LicenseApplicationProgram;
  restrictionCode: LicenseRestrictionCode;
  title: string;
  label: string;
  href: string;
  loadingLabel: string;
  match: (application: LicenseApplication | LicenseApplicationInput | null) => boolean;
};

export const UNIVERSAL_REQUIRED_UPLOADS: (keyof LicenseUploads)[] = ["profilePhoto", "governmentId", "signature"];

export const OPTIONAL_UPLOADS: { key: keyof LicenseUploads; label: string }[] = [
  { key: "medicalCertificate", label: "Medical Certificate" },
  { key: "policeClearance", label: "Police Clearance" },
  { key: "nbiClearance", label: "NBI Clearance" },
  { key: "resume", label: "Resume" },
  { key: "certificates", label: "Certificates" },
  { key: "appointmentLetter", label: "Appointment Letter" },
];

export function getLicenseFormContext(
  form: LicenseApplicationInput,
  preset?: Pick<LicenseProgramPreset, "program" | "restrictionCode">,
): LicenseFormContext {
  return {
    applicationProgram: preset?.program ?? (form.applicationProgram === "legacy" ? "jt1_member" : form.applicationProgram),
    restrictionCode: form.restrictionCode || preset?.restrictionCode || "JT1",
  };
}

export function showMedicalSection(ctx: LicenseFormContext) {
  return ctx.applicationProgram === "fighter_license";
}

export function showFightInformationSection(ctx: LicenseFormContext) {
  return ctx.applicationProgram === "fighter_license";
}

export function showWeightClassSection(ctx: LicenseFormContext) {
  return ctx.applicationProgram === "fighter_license";
}

export function showFighterCoachSection(ctx: LicenseFormContext) {
  return ctx.applicationProgram === "fighter_license";
}

export function showCoachingExperienceSection(ctx: LicenseFormContext) {
  return (
    ctx.applicationProgram === "coach_license" ||
    ctx.applicationProgram === "senior_coach_license" ||
    ctx.restrictionCode === "JT5"
  );
}

export function showCoachingCertificationsSection(ctx: LicenseFormContext) {
  return (
    ctx.applicationProgram === "coach_license" ||
    ctx.applicationProgram === "senior_coach_license" ||
    ctx.restrictionCode === "JT5"
  );
}

export function showRefereeExperienceSection(ctx: LicenseFormContext) {
  return ctx.applicationProgram === "referee_license";
}

export function showJudgeExperienceSection(ctx: LicenseFormContext) {
  return ctx.applicationProgram === "judge_license";
}

export function showClubInformationSection(ctx: LicenseFormContext) {
  return ctx.applicationProgram === "club_owner";
}

export function showCouncilPositionSection(ctx: LicenseFormContext) {
  return ctx.applicationProgram === "grand_council_officer" || ctx.applicationProgram === "grand_council_member";
}

export function showOfficerOrganizationSection(ctx: LicenseFormContext) {
  return ctx.applicationProgram === "grand_council_officer";
}

export function showProfessionalExpertiseSection(ctx: LicenseFormContext) {
  return ctx.applicationProgram === "adviser_license";
}

export function showStaffPositionSection(ctx: LicenseFormContext) {
  return ctx.applicationProgram === "staff_license";
}

export function showTrainerSection(ctx: LicenseFormContext) {
  return ctx.applicationProgram === "trainer_license";
}

export function showOrganizationSection(ctx: LicenseFormContext) {
  return ctx.applicationProgram === "jt1_member";
}

export function showPhysicalDetailsSection(ctx: LicenseFormContext) {
  return ctx.applicationProgram === "fighter_license";
}

export function showFighterExperienceSection(ctx: LicenseFormContext) {
  return ctx.applicationProgram === "fighter_license";
}

export function hasVisibleRoleSections(ctx: LicenseFormContext) {
  return (
    showOrganizationSection(ctx) ||
    showCouncilPositionSection(ctx) ||
    showOfficerOrganizationSection(ctx) ||
    showClubInformationSection(ctx) ||
    showProfessionalExpertiseSection(ctx) ||
    showTrainerSection(ctx) ||
    showRefereeExperienceSection(ctx) ||
    showJudgeExperienceSection(ctx) ||
    showCoachingExperienceSection(ctx) ||
    showCoachingCertificationsSection(ctx) ||
    showPhysicalDetailsSection(ctx) ||
    showMedicalSection(ctx) ||
    showFightInformationSection(ctx) ||
    showFighterCoachSection(ctx) ||
    showFighterExperienceSection(ctx) ||
    showStaffPositionSection(ctx)
  );
}

export function isSeniorCoachProgram(ctx: LicenseFormContext) {
  return ctx.applicationProgram === "senior_coach_license";
}

export function isCoachProgram(ctx: LicenseFormContext) {
  return ctx.applicationProgram === "coach_license";
}

export function isGrandCouncilOfficerProgram(ctx: LicenseFormContext) {
  return ctx.applicationProgram === "grand_council_officer";
}

export function isGrandCouncilMemberProgram(ctx: LicenseFormContext) {
  return ctx.applicationProgram === "grand_council_member";
}

export function getCouncilPositionOptions() {
  return [...new Set(grandCouncilMemberCouncilPositions.map((option) => option.label))];
}

export function validatePersonalStep(form: LicenseApplicationInput): string | null {
  if (!form.firstName.trim()) return "First name is required.";
  if (!form.lastName.trim()) return "Last name is required.";
  if (!form.gender) return "Please select a gender.";
  if (!form.dateOfBirth) return "Date of birth is required.";
  if (!form.nationality.trim()) return "Nationality is required.";
  return null;
}

export function validateContactStep(form: LicenseApplicationInput): string | null {
  if (!form.contactEmail.trim()) return "Email address is required.";
  if (!form.mobileNumber.trim()) return "Mobile number is required.";
  return null;
}

export function validateAddressStep(form: LicenseApplicationInput): string | null {
  if (!form.addressCountry.trim()) return "Country is required.";
  if (!form.addressProvince.trim()) return "Province is required.";
  if (!form.addressCity.trim()) return "City/Municipality is required.";
  if (!form.addressBarangay.trim()) return "Barangay is required.";
  if (!form.addressZip.trim()) return "ZIP code is required.";
  return null;
}

export function validateEmergencyStep(form: LicenseApplicationInput): string | null {
  if (!form.emergencyContactName.trim()) return "Emergency contact name is required.";
  if (!form.emergencyContactRelationship.trim()) return "Relationship is required.";
  if (!form.emergencyContactPhone.trim()) return "Emergency mobile number is required.";
  if (!form.emergencyContactAddress.trim()) return "Emergency contact address is required.";
  return null;
}

export function validateUploadsStep(form: LicenseApplicationInput): string | null {
  for (const key of UNIVERSAL_REQUIRED_UPLOADS) {
    if (!form.uploads[key]) {
      const label = key === "profilePhoto" ? "Profile photo" : key === "governmentId" ? "Government ID" : "Signature";
      return `${label} upload is required.`;
    }
  }
  return null;
}

export function validateRoleDetailsStep(
  form: LicenseApplicationInput,
  preset?: Pick<LicenseProgramPreset, "program" | "restrictionCode">,
): string | null {
  const ctx = getLicenseFormContext(form, preset);
  const answers = form.backgroundAnswers;

  if (showOrganizationSection(ctx)) {
    if (!answers.fightTeam?.trim()) return "Fight team is required.";
    if (!answers.instructor?.trim()) return "Instructor is required.";
    if (!answers.clubName?.trim()) return "Club name is required.";
  }

  if (showCouncilPositionSection(ctx) && isGrandCouncilOfficerProgram(ctx)) {
    if (!answers.officerPosition?.trim()) return "Council position is required.";
    if (!answers.officerRegion?.trim()) return "Region is required.";
    if (!answers.officerProvince?.trim()) return "Province is required.";
    if (!answers.appointmentDate?.trim()) return "Appointment date is required.";
    if (!answers.officerOffice?.trim()) return "Office is required.";
  }

  if (showOfficerOrganizationSection(ctx)) {
    if (!answers.yearsOfService?.trim()) return "Years of service is required.";
    if (!answers.assignedChapter?.trim()) return "Assigned chapter is required.";
    if (!answers.committee?.trim()) return "Committee is required.";
  }

  if (showCouncilPositionSection(ctx) && isGrandCouncilMemberProgram(ctx)) {
    if (!answers.councilPosition?.trim()) return "Council position is required.";
    if (!answers.councilProvince?.trim()) return "Province is required.";
    if (!answers.appointmentDate?.trim()) return "Appointment date is required.";
    if (!answers.yearsInService?.trim()) return "Years in service is required.";
  }

  if (showClubInformationSection(ctx)) {
    if (!answers.clubName?.trim()) return "Club name is required.";
    if (!answers.clubAddress?.trim()) return "Club address is required.";
    if (!answers.clubProvince?.trim()) return "Club province is required.";
    if (!answers.clubRegion?.trim()) return "Club region is required.";
    if (!answers.establishedYear?.trim()) return "Established year is required.";
    if (!answers.numberOfMembers?.trim()) return "Number of members is required.";
    if (!answers.dtiRegistration?.trim()) return "DTI registration is required.";
  }

  if (showProfessionalExpertiseSection(ctx)) {
    if (!answers.adviserPosition?.trim()) return "Position is required.";
    if (!answers.areaOfExpertise?.trim()) return "Area of expertise is required.";
    if (!answers.organization?.trim()) return "Organization is required.";
    if (!answers.yearsExperience?.trim()) return "Years experience is required.";
  }

  if (showTrainerSection(ctx)) {
    if (!hasTrainerDisciplineSelected(answers)) return "Select at least one training discipline.";
    if (!answers.yearsTraining?.trim()) return "Years training is required.";
    if (!answers.trainingGym?.trim()) return "Training gym is required.";
    if (!answers.certifications?.trim()) return "Certifications is required.";
  }

  if (showRefereeExperienceSection(ctx)) {
    if (!answers.refereeYearsExperience?.trim()) return "Years experience is required.";
    if (!hasRefereeLevelSelected(answers)) return "Select at least one officiating level.";
    if (!hasRefereeRulesetSelected(answers)) return "Select at least one ruleset.";
    if (!answers.refereeCertifications?.trim()) return "Certifications is required.";
    if (!answers.previousEvents?.trim()) return "Previous events is required.";
  }

  if (showJudgeExperienceSection(ctx)) {
    if (!answers.judgeYearsExperience?.trim()) return "Years experience is required.";
    if (!hasJudgeLevelSelected(answers)) return "Select at least one judging level.";
    if (!answers.judgeCertifications?.trim()) return "Certifications is required.";
    if (!answers.eventsWorked?.trim()) return "Events worked is required.";
  }

  if (showCoachingExperienceSection(ctx) && isSeniorCoachProgram(ctx)) {
    if (!answers.highestRank?.trim()) return "Highest rank is required.";
    if (!answers.yearsCoaching?.trim()) return "Years coaching is required.";
    if (!answers.coachingSchool?.trim()) return "School is required.";
    if (!answers.coachingProvince?.trim()) return "Province is required.";
    if (!answers.championsProduced?.trim()) return "Champions produced is required.";
  }

  if (showCoachingExperienceSection(ctx) && isCoachProgram(ctx)) {
    if (!answers.coachingLevel?.trim()) return "Coaching level is required.";
    if (!answers.yearsCoaching?.trim()) return "Years coaching is required.";
    if (!answers.mainStyle?.trim()) return "Main style is required.";
    if (!answers.coachingClub?.trim()) return "Club is required.";
    if (!answers.coachingProvince?.trim()) return "Province is required.";
    if (!answers.coachingRegion?.trim()) return "Region is required.";
    if (!answers.numberOfStudents?.trim()) return "Number of students is required.";
    if (!answers.championshipsCoached?.trim()) return "Championships coached is required.";
  }

  if (showCoachingCertificationsSection(ctx) && isSeniorCoachProgram(ctx)) {
    if (!answers.seniorCoachCertifications?.trim()) return "Certifications is required.";
  }

  if (showCoachingCertificationsSection(ctx) && isCoachProgram(ctx)) {
    if (!answers.certifications?.trim()) return "Certifications is required.";
  }

  if (showCoachingExperienceSection(ctx) && ctx.restrictionCode === "JT5" && !isCoachProgram(ctx) && !isSeniorCoachProgram(ctx)) {
    if (!answers.yearsCoaching?.trim()) return "Years coaching is required.";
    if (!answers.certifications?.trim()) return "Certifications is required.";
  }

  if (showPhysicalDetailsSection(ctx)) {
    if (!answers.nickname?.trim()) return "Nickname is required.";
    if (!answers.fighterHeight?.trim()) return "Height is required.";
    if (!answers.fighterWeight?.trim()) return "Weight is required.";
    if (!answers.reach?.trim()) return "Reach is required.";
    if (!form.bloodType) return "Blood type is required.";
  }

  if (showMedicalSection(ctx)) {
    if (!hasFighterMedicalConfirmed(answers)) {
      return "Confirm Medical Clearance, ECG, and Blood Test to continue.";
    }
  }

  if (showFightInformationSection(ctx)) {
    if (!answers.weightDivision?.trim()) return "Weight division is required.";
    if (!answers.stance?.trim()) return "Stance is required.";
    if (!answers.dominantHand?.trim()) return "Dominant hand is required.";
    if (!answers.fightTeam?.trim()) return "Fight team is required.";
    if (!answers.gym?.trim()) return "Gym is required.";
  }

  if (showFighterCoachSection(ctx)) {
    if (!answers.coachName?.trim()) return "Coach is required.";
  }

  if (showFighterExperienceSection(ctx)) {
    if (!answers.amateurRecord?.trim()) return "Amateur record is required.";
    if (!answers.professionalRecord?.trim()) return "Professional record is required.";
    if (!answers.yearsTraining?.trim()) return "Years training is required.";
  }

  if (showStaffPositionSection(ctx)) {
    if (!answers.staffDepartment?.trim()) return "Department is required.";
    if (!answers.staffPosition?.trim()) return "Position is required.";
    if (!answers.staffOffice?.trim()) return "Office is required.";
    if (!answers.staffYearsOfService?.trim()) return "Years of service is required.";
  }

  return null;
}

export function validateUnifiedLicenseForm(
  form: LicenseApplicationInput,
  preset?: Pick<LicenseProgramPreset, "program" | "restrictionCode">,
): string | null {
  return (
    validatePersonalStep(form) ||
    validateContactStep(form) ||
    validateAddressStep(form) ||
    validateRoleDetailsStep(form, preset) ||
    validateEmergencyStep(form) ||
    validateUploadsStep(form)
  );
}

export function officerPositionUpdatesPosition(restrictionCode: LicenseRestrictionCode) {
  return grandCouncilOfficerRestrictionCodes.includes(restrictionCode);
}

export function resolveOfficerRestrictionFromPosition(positionLabel: string): LicenseRestrictionCode | null {
  const selected = grandCouncilOfficerPositions.find((option) => option.label === positionLabel);
  return selected?.code ?? null;
}

export function resolveCouncilRestrictionFromPosition(positionLabel: string): LicenseRestrictionCode | null {
  const selected = grandCouncilMemberCouncilPositions.find((option) => option.label === positionLabel);
  return selected?.code ?? null;
}
