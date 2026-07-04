export type LicenseApplicationStatus = "pending" | "approved" | "rejected" | "needs_info";

export const licenseApplicationStatusLabels: Record<LicenseApplicationStatus, string> = {
  pending: "Pending Review",
  approved: "Approved",
  rejected: "Rejected",
  needs_info: "More Info Requested",
};

export type LicenseRestrictionCode =
  | "JT1"
  | "JT2"
  | "JT3"
  | "JT4"
  | "JT5"
  | "JT6"
  | "JT7"
  | "JT8"
  | "JT9"
  | "JT10"
  | "JT11"
  | "JT12";

export const licenseRestrictionOptions: { code: LicenseRestrictionCode; label: string }[] = [
  { code: "JT1", label: "JT1. H.M.F.I.C" },
  { code: "JT2", label: "JT2. G.C.O" },
  { code: "JT3", label: "JT3. G.C.M" },
  { code: "JT4", label: "JT4. C.O" },
  { code: "JT5", label: "JT5. CM" },
  { code: "JT6", label: "JT6. ADVISER" },
  { code: "JT7", label: "JT7. TRAINER" },
  { code: "JT8", label: "JT8. REFEREE" },
  { code: "JT9", label: "JT9. JUDGE" },
  { code: "JT10", label: "JT10. COACH" },
  { code: "JT11", label: "JT11. FIGHTER" },
  { code: "JT12", label: "JT12. STAFF" },
];

export type LicenseBackgroundProfile = "fighter" | "coach" | "referee" | "judge" | "official" | "general";

export type LicenseBackgroundField = {
  id: string;
  label: string;
  type?: "text" | "textarea";
  required?: boolean;
  placeholder?: string;
};

export type LicenseBackgroundAnswers = Record<string, string>;

export type LicenseUploads = {
  governmentId: string;
  profilePhoto: string;
  signature: string;
  appointmentLetter: string;
  clubLogo: string;
  coachingCertificates: string;
  resume: string;
  trainingCertifications: string;
  refereeCertification: string;
  judgeCertification: string;
  medicalCertificate: string;
  policeClearance: string;
  nbiClearance: string;
  certificates: string;
};

export type LicenseApplicationProgram =
  | "jt1_member"
  | "grand_council_member"
  | "grand_council_officer"
  | "club_owner"
  | "coach_license"
  | "senior_coach_license"
  | "adviser_license"
  | "trainer_license"
  | "referee_license"
  | "judge_license"
  | "fighter_license"
  | "staff_license"
  | "legacy";

export type LicenseApplicationInput = {
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  gender: string;
  title: string;
  dateOfBirth: string;
  nationality: string;
  bloodType: string;
  civilStatus: string;
  contactEmail: string;
  mobileNumber: string;
  addressCountry: string;
  addressProvince: string;
  addressCity: string;
  addressBarangay: string;
  addressZip: string;
  applicationProgram: LicenseApplicationProgram;
  restrictionCode: LicenseRestrictionCode;
  backgroundAnswers: LicenseBackgroundAnswers;
  restrictions: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactAddress: string;
  emergencyContactPhone: string;
  uploads: LicenseUploads;
};

export const bloodTypeOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
export const civilStatusOptions = ["Single", "Married", "Widowed", "Separated", "Divorced"];
export const suffixOptions = ["Jr.", "Sr.", "II", "III", "IV"];

export const emptyLicenseUploads: LicenseUploads = {
  governmentId: "",
  profilePhoto: "",
  signature: "",
  appointmentLetter: "",
  clubLogo: "",
  coachingCertificates: "",
  resume: "",
  trainingCertifications: "",
  refereeCertification: "",
  judgeCertification: "",
  medicalCertificate: "",
  policeClearance: "",
  nbiClearance: "",
  certificates: "",
};

export const coachLevelOptions = [
  "Level 1 — Assistant Coach",
  "Level 2 — Certified Coach",
  "Level 3 — Senior Coach",
  "Level 4 — Master Coach",
  "JTGC Certified Coach",
];

export const seniorCoachRankOptions = [
  "Black Belt",
  "Master Instructor",
  "Grandmaster",
  "Level 4 — Master Coach",
  "JTGC Senior Coach",
  "International Coach Rank",
];

export const trainerDisciplineOptions = [
  { id: "trainingStrengthConditioning", label: "Strength & Conditioning" },
  { id: "trainingBoxing", label: "Boxing" },
  { id: "trainingKali", label: "Kali" },
  { id: "trainingNutrition", label: "Nutrition" },
  { id: "trainingFitness", label: "Fitness" },
] as const;

export function formatTrainerDisciplines(answers: LicenseBackgroundAnswers): string {
  return trainerDisciplineOptions
    .filter((discipline) => answers[discipline.id] === "yes")
    .map((discipline) => discipline.label)
    .join(", ");
}

export function hasTrainerDisciplineSelected(answers: LicenseBackgroundAnswers): boolean {
  return trainerDisciplineOptions.some((discipline) => answers[discipline.id] === "yes");
}

export const refereeLevelOptions = [
  { id: "refereeRegional", label: "Regional" },
  { id: "refereeNational", label: "National" },
  { id: "refereeInternational", label: "International" },
] as const;

export const refereeRulesetOptions = [
  { id: "rulesetJuegoTodo", label: "Juego Todo" },
  { id: "rulesetAmateur", label: "Amateur" },
  { id: "rulesetProfessional", label: "Professional" },
] as const;

export function formatRefereeLevels(answers: LicenseBackgroundAnswers): string {
  return refereeLevelOptions
    .filter((level) => answers[level.id] === "yes")
    .map((level) => level.label)
    .join(", ");
}

export function formatRefereeRulesets(answers: LicenseBackgroundAnswers): string {
  return refereeRulesetOptions
    .filter((ruleset) => answers[ruleset.id] === "yes")
    .map((ruleset) => ruleset.label)
    .join(", ");
}

export function hasRefereeLevelSelected(answers: LicenseBackgroundAnswers): boolean {
  return refereeLevelOptions.some((level) => answers[level.id] === "yes");
}

export function hasRefereeRulesetSelected(answers: LicenseBackgroundAnswers): boolean {
  return refereeRulesetOptions.some((ruleset) => answers[ruleset.id] === "yes");
}

export const judgeLevelOptions = [
  { id: "judgeRegional", label: "Regional" },
  { id: "judgeNational", label: "National" },
  { id: "judgeInternational", label: "International" },
] as const;

export function formatJudgeLevels(answers: LicenseBackgroundAnswers): string {
  return judgeLevelOptions
    .filter((level) => answers[level.id] === "yes")
    .map((level) => level.label)
    .join(", ");
}

export function hasJudgeLevelSelected(answers: LicenseBackgroundAnswers): boolean {
  return judgeLevelOptions.some((level) => answers[level.id] === "yes");
}

export const fighterWeightDivisionOptions = [
  "Strawweight",
  "Flyweight",
  "Bantamweight",
  "Featherweight",
  "Lightweight",
  "Welterweight",
  "Middleweight",
  "Light Heavyweight",
  "Heavyweight",
  "Super Heavyweight",
  "Open Weight",
];

export const fighterStanceOptions = ["Orthodox", "Southpaw", "Switch"];

export const fighterDominantHandOptions = ["Right", "Left", "Ambidextrous"];

export const fighterMedicalOptions = [
  { id: "medicalClearance", label: "Medical Clearance" },
  { id: "medicalEcg", label: "ECG" },
  { id: "medicalBloodTest", label: "Blood Test" },
] as const;

export function hasFighterMedicalConfirmed(answers: LicenseBackgroundAnswers): boolean {
  return fighterMedicalOptions.every((item) => answers[item.id] === "yes");
}

export function formatFighterRecord(answers: LicenseBackgroundAnswers): string {
  const amateur = answers.amateurRecord?.trim();
  const professional = answers.professionalRecord?.trim();

  if (amateur && professional) {
    return `A: ${amateur} • P: ${professional}`;
  }

  return amateur || professional || "";
}

export const staffDepartmentOptions = [
  "Operations",
  "Events",
  "Media & Communications",
  "Finance & Admin",
  "Athlete Services",
  "Technical & IT",
  "Legal & Compliance",
  "Other",
];

export const grandCouncilOfficerRestrictionCodes: LicenseRestrictionCode[] = ["JT1", "JT2", "JT3", "JT4", "JT5", "JT6"];

export const grandCouncilOfficerPositions = licenseRestrictionOptions.filter((option) =>
  grandCouncilOfficerRestrictionCodes.includes(option.code),
);

export const grandCouncilMemberCouncilPositions = [
  { code: "JT3", label: "JT3. G.C.M" },
  { code: "JT5", label: "JT5. CM" },
  { code: "JT3", label: "Committee Representative" },
  { code: "JT3", label: "Regional Council Delegate" },
  { code: "JT3", label: "Elders Council Representative" },
] as const;

export const philippineRegions = [
  "NCR",
  "CAR",
  "Ilocos Region",
  "Cagayan Valley",
  "Central Luzon",
  "CALABARZON",
  "MIMAROPA",
  "Bicol Region",
  "Western Visayas",
  "Central Visayas",
  "Eastern Visayas",
  "Zamboanga Peninsula",
  "Northern Mindanao",
  "Davao Region",
  "SOCCSKSARGEN",
  "Caraga",
  "BARMM",
];

export const emptyLicenseApplicationInput: LicenseApplicationInput = {
  firstName: "",
  middleName: "",
  lastName: "",
  suffix: "",
  gender: "",
  title: "",
  dateOfBirth: "",
  nationality: "Filipino",
  bloodType: "",
  civilStatus: "",
  contactEmail: "",
  mobileNumber: "",
  addressCountry: "Philippines",
  addressProvince: "",
  addressCity: "",
  addressBarangay: "",
  addressZip: "",
  applicationProgram: "jt1_member",
  restrictionCode: "JT1",
  backgroundAnswers: {},
  restrictions: "",
  emergencyContactName: "",
  emergencyContactRelationship: "",
  emergencyContactAddress: "",
  emergencyContactPhone: "",
  uploads: emptyLicenseUploads,
};

export type LicenseApplication = LicenseApplicationInput & {
  id: string;
  userId: string;
  userEmail: string;
  fullName: string;
  positionTitle: string;
  fightTeam: string;
  status: LicenseApplicationStatus;
  idNumber: string;
  issuedDate: string | null;
  expiryDate: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  reviewNotes: string;
};

export const licenseReturnAddress = {
  organization: "JUEGO TODO PH",
  line1: "Unit 206, Guerdon Commercial BLDG., Rainbow St.,",
  line2: "Concepcion Dos, Marikina City",
};

const backgroundProfiles: Record<LicenseBackgroundProfile, LicenseBackgroundField[]> = {
  fighter: [
    { id: "fightTeam", label: "Fight Team / Gym", required: true, placeholder: "Team or gym name" },
    { id: "weightClass", label: "Weight Class", required: true, placeholder: "e.g. Featherweight" },
    { id: "fightRecord", label: "Competition Record (W-L-D)", required: true, placeholder: "e.g. 8-2-0" },
    { id: "yearsTraining", label: "Years of Training", required: true, placeholder: "e.g. 6" },
    { id: "primaryDiscipline", label: "Primary Discipline", required: true, placeholder: "e.g. Arnis, Boxing" },
    {
      id: "notableAchievements",
      label: "Notable Achievements",
      type: "textarea",
      placeholder: "Titles, rankings, or competition highlights",
    },
  ],
  coach: [
    { id: "affiliatedGym", label: "Affiliated Gym / Team", required: true, placeholder: "Gym or team name" },
    { id: "yearsCoaching", label: "Years Coaching", required: true, placeholder: "e.g. 5" },
    { id: "certifications", label: "Certifications / Credentials", required: true },
    { id: "specialization", label: "Coaching Specialization", required: true, placeholder: "Striking, grappling, weapons..." },
    {
      id: "athletesCoached",
      label: "Notable Athletes Coached",
      type: "textarea",
      placeholder: "Athletes, teams, or programs you've coached",
    },
  ],
  referee: [
    { id: "yearsOfficiating", label: "Years Officiating", required: true, placeholder: "e.g. 4" },
    { id: "eventsWorked", label: "Events / Bouts Officiated", required: true, placeholder: "Approximate count or notable events" },
    { id: "certificationLevel", label: "Certification Level", required: true },
    { id: "sanctioningBodies", label: "Sanctioning Bodies", required: true, placeholder: "GAB, JTGC, etc." },
  ],
  judge: [
    { id: "yearsJudging", label: "Years as Judge", required: true, placeholder: "e.g. 3" },
    { id: "eventsJudged", label: "Events Judged", required: true },
    { id: "certificationLevel", label: "Certification Level", required: true },
    { id: "scoringExperience", label: "Scoring Systems Experience", required: true, placeholder: "10-point, round-by-round..." },
  ],
  official: [
    { id: "officialRole", label: "Official Role", required: true, placeholder: "Describe your league role" },
    { id: "yearsExperience", label: "Years of Experience", required: true },
    { id: "organizationAffiliation", label: "Organization Affiliation", required: true },
    {
      id: "responsibilities",
      label: "Key Responsibilities",
      type: "textarea",
      placeholder: "Summarize your official duties",
    },
  ],
  general: [
    { id: "affiliation", label: "Affiliation / Organization", required: true },
    { id: "yearsExperience", label: "Years of Relevant Experience", required: true },
    {
      id: "backgroundSummary",
      label: "Professional Background Summary",
      type: "textarea",
      required: true,
      placeholder: "Brief summary of your experience and qualifications",
    },
  ],
};

export function getBackgroundProfile(code: LicenseRestrictionCode): LicenseBackgroundProfile {
  switch (code) {
    case "JT11":
      return "fighter";
    case "JT10":
    case "JT7":
      return "coach";
    case "JT8":
      return "referee";
    case "JT9":
      return "judge";
    case "JT1":
    case "JT2":
    case "JT3":
    case "JT4":
    case "JT5":
    case "JT6":
      return "official";
    default:
      return "general";
  }
}

export function getBackgroundStepTitle(code: LicenseRestrictionCode) {
  switch (getBackgroundProfile(code)) {
    case "fighter":
      return "Fighter Background";
    case "coach":
      return "Coaching Background";
    case "referee":
      return "Referee Background";
    case "judge":
      return "Judge Background";
    case "official":
      return "Official Background";
    default:
      return "Professional Background";
  }
}

export function getBackgroundFields(code: LicenseRestrictionCode) {
  return backgroundProfiles[getBackgroundProfile(code)];
}

export function buildLicenseFullName(
  input: Pick<LicenseApplicationInput, "firstName" | "middleName" | "lastName" | "suffix">,
) {
  const name = [input.firstName, input.middleName, input.lastName].filter(Boolean).join(" ").trim();
  return input.suffix ? `${name}, ${input.suffix}`.trim() : name;
}

export function buildLicenseAddress(input: Pick<LicenseApplicationInput, "addressBarangay" | "addressCity" | "addressProvince" | "addressCountry" | "addressZip">) {
  return [input.addressBarangay, input.addressCity, input.addressProvince, input.addressCountry, input.addressZip]
    .filter(Boolean)
    .join(", ");
}

export function getLicenseFightTeam(application: Pick<LicenseApplication, "backgroundAnswers" | "fightTeam">) {
  return (
    application.backgroundAnswers.fightTeam ||
    application.backgroundAnswers.clubName ||
    application.backgroundAnswers.affiliatedGym ||
    application.backgroundAnswers.affiliation ||
    application.fightTeam ||
    ""
  );
}

export function getRestrictionLabel(code: LicenseRestrictionCode | string) {
  if (code === "JT_MEMBER") {
    return "JT MEMBER";
  }

  return licenseRestrictionOptions.find((option) => option.code === code)?.label ?? code;
}

export function formatLicenseDate(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

export function splitLegacyFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return { firstName: "", middleName: "", lastName: "" };
  }

  if (parts.length === 1) {
    return { firstName: parts[0], middleName: "", lastName: "" };
  }

  return {
    firstName: parts[0],
    middleName: parts.slice(1, -1).join(" "),
    lastName: parts[parts.length - 1],
  };
}

export function normalizeLicenseApplication(application: LicenseApplication): LicenseApplication {
  const uploads = { ...emptyLicenseUploads, ...(application.uploads ?? {}) };

  if (application.firstName) {
    return {
      ...application,
      applicationProgram: resolveApplicationProgram(application),
      suffix: application.suffix ?? "",
      bloodType: application.bloodType ?? "",
      civilStatus: application.civilStatus ?? "",
      contactEmail: application.contactEmail ?? application.userEmail ?? "",
      mobileNumber: application.mobileNumber ?? "",
      addressCountry: application.addressCountry ?? "Philippines",
      addressProvince: application.addressProvince ?? "",
      addressCity: application.addressCity ?? "",
      addressBarangay: application.addressBarangay ?? "",
      addressZip: application.addressZip ?? "",
      title: application.title || application.positionTitle || "",
      nationality: application.nationality || "Filipino",
      restrictions: application.restrictions ?? "",
      backgroundAnswers: application.backgroundAnswers ?? {},
      uploads,
      fullName: application.fullName || buildLicenseFullName(application),
      positionTitle: application.positionTitle || application.title || "",
      fightTeam: application.fightTeam || getLicenseFightTeam(application),
    };
  }

  const legacyName = splitLegacyFullName(application.fullName ?? "");
  const legacy = application as LicenseApplication & {
    fullName?: string;
    positionTitle?: string;
    fightTeam?: string;
  };

  return {
    ...application,
    applicationProgram: resolveApplicationProgram(application),
    firstName: legacyName.firstName,
    middleName: legacyName.middleName,
    lastName: legacyName.lastName,
    suffix: "",
    bloodType: "",
    civilStatus: "",
    contactEmail: application.userEmail ?? "",
    mobileNumber: "",
    addressCountry: "Philippines",
    addressProvince: "",
    addressCity: "",
    addressBarangay: "",
    addressZip: "",
    title: legacy.positionTitle ?? "",
    nationality: application.nationality || "Filipino",
    restrictions: application.restrictions ?? "",
    backgroundAnswers: application.backgroundAnswers ?? {},
    uploads,
    fullName: legacy.fullName ?? buildLicenseFullName({ ...legacyName, middleName: legacyName.middleName, suffix: "" }),
    positionTitle: legacy.positionTitle ?? "",
    fightTeam: legacy.fightTeam ?? "",
  };
}

export function prepareLicenseApplicationInput(input: LicenseApplicationInput): LicenseApplicationInput & {
  fullName: string;
  positionTitle: string;
  fightTeam: string;
} {
  const fullName = buildLicenseFullName(input);
  const program = resolveApplicationProgram(input);
  const officerPosition = input.backgroundAnswers.officerPosition?.trim();
  const councilPosition = input.backgroundAnswers.councilPosition?.trim();
  let positionTitle = getRestrictionLabel(input.restrictionCode);

  if (program === "grand_council_officer") {
    positionTitle = officerPosition || positionTitle;
  } else if (program === "grand_council_member") {
    positionTitle = councilPosition || positionTitle;
  } else if (program === "club_owner") {
    positionTitle = "Club Owner";
  } else if (program === "coach_license") {
    positionTitle = input.backgroundAnswers.coachingLevel || "JT10. COACH";
  } else if (program === "senior_coach_license") {
    positionTitle = input.backgroundAnswers.highestRank || "Senior Coach";
  } else if (program === "adviser_license") {
    positionTitle = input.backgroundAnswers.adviserPosition || "JT6. ADVISER";
  } else if (program === "trainer_license") {
    positionTitle = "JT7. TRAINER";
  } else if (program === "referee_license") {
    positionTitle = "JT8. REFEREE";
  } else if (program === "judge_license") {
    positionTitle = "JT9. JUDGE";
  } else if (program === "fighter_license") {
    positionTitle = input.backgroundAnswers.weightDivision || "JT11. FIGHTER";
  } else if (program === "staff_license") {
    positionTitle = input.backgroundAnswers.staffPosition || "JT12. STAFF";
  }

  return {
    ...input,
    fullName,
    positionTitle,
    fightTeam:
      input.backgroundAnswers.staffOffice ||
      input.backgroundAnswers.staffDepartment ||
      input.backgroundAnswers.fightTeam ||
      input.backgroundAnswers.gym ||
      input.backgroundAnswers.coachingSchool ||
      input.backgroundAnswers.trainingGym ||
      input.backgroundAnswers.organization ||
      input.backgroundAnswers.coachingClub ||
      input.backgroundAnswers.clubName ||
      input.backgroundAnswers.assignedChapter ||
      input.backgroundAnswers.fightTeam ||
      input.backgroundAnswers.affiliatedGym ||
      input.backgroundAnswers.affiliation ||
      "",
  };
}

export function applicationToLicenseInput(application: LicenseApplication): LicenseApplicationInput {
  return {
    firstName: application.firstName,
    middleName: application.middleName,
    lastName: application.lastName,
    suffix: application.suffix ?? "",
    gender: application.gender,
    title: application.title,
    dateOfBirth: application.dateOfBirth,
    nationality: application.nationality,
    bloodType: application.bloodType ?? "",
    civilStatus: application.civilStatus ?? "",
    contactEmail: application.contactEmail || application.userEmail,
    mobileNumber: application.mobileNumber ?? "",
    addressCountry: application.addressCountry ?? "Philippines",
    addressProvince: application.addressProvince ?? "",
    addressCity: application.addressCity ?? "",
    addressBarangay: application.addressBarangay ?? "",
    addressZip: application.addressZip ?? "",
    applicationProgram: resolveApplicationProgram(application),
    restrictionCode: application.restrictionCode,
    backgroundAnswers: application.backgroundAnswers ?? {},
    restrictions: application.restrictions,
    emergencyContactName: application.emergencyContactName,
    emergencyContactRelationship: application.emergencyContactRelationship,
    emergencyContactAddress: application.emergencyContactAddress,
    emergencyContactPhone: application.emergencyContactPhone,
    uploads: application.uploads ?? emptyLicenseUploads,
  };
}

export function resolveApplicationProgram(
  application: Partial<LicenseApplication> | LicenseApplicationInput | null,
): LicenseApplicationProgram {
  if (!application) {
    return "jt1_member";
  }

  if (application.applicationProgram && application.applicationProgram !== "legacy") {
    return application.applicationProgram;
  }

  const legacyProgram = application.backgroundAnswers?.applicationProgram;
  if (
    legacyProgram === "jt1_member" ||
    legacyProgram === "grand_council_member" ||
    legacyProgram === "grand_council_officer" ||
    legacyProgram === "club_owner" ||
    legacyProgram === "coach_license" ||
    legacyProgram === "senior_coach_license" ||
    legacyProgram === "adviser_license" ||
    legacyProgram === "trainer_license" ||
    legacyProgram === "referee_license" ||
    legacyProgram === "judge_license" ||
    legacyProgram === "fighter_license" ||
    legacyProgram === "staff_license"
  ) {
    return legacyProgram;
  }

  if (
    application.backgroundAnswers?.staffDepartment ||
    application.backgroundAnswers?.staffPosition ||
    application.backgroundAnswers?.staffOffice ||
    application.backgroundAnswers?.staffYearsOfService
  ) {
    return "staff_license";
  }

  if (
    application.uploads?.medicalCertificate ||
    application.backgroundAnswers?.weightDivision ||
    application.backgroundAnswers?.amateurRecord ||
    application.backgroundAnswers?.professionalRecord ||
    (application.backgroundAnswers?.nickname && application.backgroundAnswers?.fighterHeight)
  ) {
    return "fighter_license";
  }

  if (
    application.uploads?.judgeCertification ||
    application.backgroundAnswers?.eventsWorked ||
    application.backgroundAnswers?.judgeYearsExperience ||
    application.backgroundAnswers?.judgeCertifications ||
    hasJudgeLevelSelected(application.backgroundAnswers ?? {})
  ) {
    return "judge_license";
  }

  if (
    application.uploads?.refereeCertification ||
    application.backgroundAnswers?.previousEvents ||
    application.backgroundAnswers?.refereeYearsExperience ||
    hasRefereeRulesetSelected(application.backgroundAnswers ?? {}) ||
    hasRefereeLevelSelected(application.backgroundAnswers ?? {})
  ) {
    return "referee_license";
  }

  if (
    application.uploads?.trainingCertifications ||
    application.backgroundAnswers?.trainingGym ||
    application.backgroundAnswers?.yearsTraining ||
    hasTrainerDisciplineSelected(application.backgroundAnswers ?? {})
  ) {
    return "trainer_license";
  }

  if (
    application.backgroundAnswers?.adviserPosition ||
    application.uploads?.resume ||
    (application.backgroundAnswers?.areaOfExpertise && application.backgroundAnswers?.organization)
  ) {
    return "adviser_license";
  }

  if (
    application.backgroundAnswers?.highestRank ||
    application.backgroundAnswers?.championsProduced ||
    application.backgroundAnswers?.coachingSchool ||
    application.backgroundAnswers?.seniorCoachCertifications
  ) {
    return "senior_coach_license";
  }

  if (
    application.backgroundAnswers?.coachingLevel ||
    application.uploads?.coachingCertificates ||
    (application.backgroundAnswers?.yearsCoaching && application.backgroundAnswers?.mainStyle)
  ) {
    return "coach_license";
  }

  if (
    application.uploads?.clubLogo ||
    application.backgroundAnswers?.dtiRegistration ||
    (application.backgroundAnswers?.clubName && application.backgroundAnswers?.establishedYear)
  ) {
    return "club_owner";
  }

  if (application.backgroundAnswers?.councilPosition || application.backgroundAnswers?.yearsInService) {
    return "grand_council_member";
  }

  if (
    application.backgroundAnswers?.officerPosition ||
    application.backgroundAnswers?.officerRegion ||
    application.backgroundAnswers?.assignedChapter
  ) {
    return "grand_council_officer";
  }

  if (application.restrictionCode === "JT1") {
    return "jt1_member";
  }

  if (application.restrictionCode === "JT3" || application.restrictionCode === "JT5") {
    return "grand_council_member";
  }

  if (application.restrictionCode === "JT10") {
    return "coach_license";
  }

  if (application.restrictionCode === "JT7") {
    return "trainer_license";
  }

  if (application.restrictionCode === "JT6") {
    return "adviser_license";
  }

  if (application.restrictionCode === "JT8") {
    return "referee_license";
  }

  if (application.restrictionCode === "JT9") {
    return "judge_license";
  }

  if (application.restrictionCode === "JT11") {
    return "fighter_license";
  }

  if (application.restrictionCode === "JT12") {
    return "staff_license";
  }

  if (application.restrictionCode === "JT4") {
    return "club_owner";
  }

  if (application.restrictionCode === "JT2") {
    return "grand_council_officer";
  }

  if (application.restrictionCode && grandCouncilOfficerRestrictionCodes.includes(application.restrictionCode)) {
    return "grand_council_officer";
  }

  return "legacy";
}

export function isJt1MemberApplication(application: LicenseApplication | LicenseApplicationInput | null) {
  const program = resolveApplicationProgram(application);
  return program === "jt1_member" || program === "legacy";
}

export function isGrandCouncilMemberApplication(application: LicenseApplication | LicenseApplicationInput | null) {
  return resolveApplicationProgram(application) === "grand_council_member";
}

export function isGrandCouncilOfficerApplication(application: LicenseApplication | LicenseApplicationInput | null) {
  return resolveApplicationProgram(application) === "grand_council_officer";
}

export function isClubOwnerApplication(application: LicenseApplication | LicenseApplicationInput | null) {
  return resolveApplicationProgram(application) === "club_owner";
}

export function isCoachLicenseApplication(application: LicenseApplication | LicenseApplicationInput | null) {
  return resolveApplicationProgram(application) === "coach_license";
}

export function isSeniorCoachLicenseApplication(application: LicenseApplication | LicenseApplicationInput | null) {
  return resolveApplicationProgram(application) === "senior_coach_license";
}

export function isAdviserLicenseApplication(application: LicenseApplication | LicenseApplicationInput | null) {
  return resolveApplicationProgram(application) === "adviser_license";
}

export function isTrainerLicenseApplication(application: LicenseApplication | LicenseApplicationInput | null) {
  return resolveApplicationProgram(application) === "trainer_license";
}

export function isRefereeLicenseApplication(application: LicenseApplication | LicenseApplicationInput | null) {
  return resolveApplicationProgram(application) === "referee_license";
}

export function isJudgeLicenseApplication(application: LicenseApplication | LicenseApplicationInput | null) {
  return resolveApplicationProgram(application) === "judge_license";
}

export function isFighterLicenseApplication(application: LicenseApplication | LicenseApplicationInput | null) {
  return resolveApplicationProgram(application) === "fighter_license";
}

export function isStaffLicenseApplication(application: LicenseApplication | LicenseApplicationInput | null) {
  return resolveApplicationProgram(application) === "staff_license";
}

export function resolveLicenseApplicationHref(application: LicenseApplication | LicenseApplicationInput | null) {
  const program = resolveApplicationProgram(application);

  if (program === "grand_council_officer") {
    return "/register-for-license/grand-council-officer";
  }

  if (program === "grand_council_member") {
    return "/register-for-license/grand-council-member";
  }

  if (program === "club_owner") {
    return "/register-for-license/club-owner";
  }

  if (program === "coach_license") {
    return "/register-for-license/coach";
  }

  if (program === "senior_coach_license") {
    return "/register-for-license/senior-coach";
  }

  if (program === "adviser_license") {
    return "/register-for-license/adviser";
  }

  if (program === "trainer_license") {
    return "/register-for-license/trainer";
  }

  if (program === "referee_license") {
    return "/register-for-license/referee";
  }

  if (program === "judge_license") {
    return "/register-for-license/judge";
  }

  if (program === "fighter_license") {
    return "/register-for-license/fighter";
  }

  if (program === "staff_license") {
    return "/register-for-license/staff";
  }

  return "/register-for-license";
}

export function buildLicenseIdNumber(userId: string, program: LicenseApplicationProgram) {
  const suffix = userId.replace(/-/g, "").slice(0, 8).toUpperCase();
  const prefix =
    program === "grand_council_officer"
      ? "GCO"
      : program === "grand_council_member"
        ? "GCM"
        : program === "club_owner"
          ? "CLB"
          : program === "coach_license"
            ? "COA"
            : program === "senior_coach_license"
              ? "SCO"
              : program === "adviser_license"
              ? "ADV"
              : program === "trainer_license"
                ? "TRN"
                : program === "referee_license"
                  ? "REF"
                  : program === "judge_license"
                    ? "JDG"
                    : program === "fighter_license"
                      ? "FTR"
                      : program === "staff_license"
                        ? "STF"
                        : "JT";
  return `${prefix}-${suffix.padEnd(8, "0").slice(0, 8)}`;
}

export function buildPreviewIdNumber(program: LicenseApplicationProgram) {
  if (program === "grand_council_officer") {
    return "GCO-PREVIEW";
  }

  if (program === "grand_council_member") {
    return "GCM-PREVIEW";
  }

  if (program === "club_owner") {
    return "CLB-PREVIEW";
  }

  if (program === "coach_license") {
    return "COA-PREVIEW";
  }

  if (program === "senior_coach_license") {
    return "SCO-PREVIEW";
  }

  if (program === "adviser_license") {
    return "ADV-PREVIEW";
  }

  if (program === "trainer_license") {
    return "TRN-PREVIEW";
  }

  if (program === "referee_license") {
    return "REF-PREVIEW";
  }

  if (program === "judge_license") {
    return "JDG-PREVIEW";
  }

  if (program === "fighter_license") {
    return "FTR-PREVIEW";
  }

  if (program === "staff_license") {
    return "STF-PREVIEW";
  }

  return "JT-PREVIEW";
}

export function buildPreviewLicenseApplication(
  input: LicenseApplicationInput,
  user: { id: string; email: string },
): LicenseApplication {
  const prepared = prepareLicenseApplicationInput(input);
  const program = resolveApplicationProgram(input);

  return {
    ...prepared,
    id: "preview",
    userId: user.id,
    userEmail: input.contactEmail || user.email,
    status: "pending",
    idNumber: buildPreviewIdNumber(program),
    issuedDate: null,
    expiryDate: null,
    submittedAt: new Date().toISOString(),
    reviewedAt: null,
    reviewNotes: "",
  };
}

export const licenseUploadFieldLabels: Record<keyof LicenseUploads, string> = {
  governmentId: "Government ID",
  profilePhoto: "Profile Photo",
  signature: "Signature",
  appointmentLetter: "Appointment Letter",
  clubLogo: "Club Logo",
  coachingCertificates: "Coaching Certificates",
  resume: "Resume",
  trainingCertifications: "Training Certifications",
  refereeCertification: "Referee Certification",
  judgeCertification: "Judge Certification",
  medicalCertificate: "Medical Certificate",
  policeClearance: "Police Clearance",
  nbiClearance: "NBI Clearance",
  certificates: "Certificates",
};

export type LicenseUploadAttachment = {
  key: keyof LicenseUploads;
  label: string;
  attached: boolean;
  value: string;
  isImage: boolean;
};

export function listLicenseUploadAttachments(uploads: LicenseUploads): LicenseUploadAttachment[] {
  return (Object.keys(licenseUploadFieldLabels) as (keyof LicenseUploads)[]).map((key) => {
    const value = uploads[key]?.trim() ?? "";
    return {
      key,
      label: licenseUploadFieldLabels[key],
      attached: Boolean(value),
      value,
      isImage: value.startsWith("data:image"),
    };
  });
}

export function formatBackgroundAnswerLabel(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}
