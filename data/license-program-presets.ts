import {
  isAdviserLicenseApplication,
  isClubOwnerApplication,
  isCoachLicenseApplication,
  isFighterLicenseApplication,
  isGrandCouncilMemberApplication,
  isGrandCouncilOfficerApplication,
  isJudgeLicenseApplication,
  isJt1MemberApplication,
  isRefereeLicenseApplication,
  isSeniorCoachLicenseApplication,
  isStaffLicenseApplication,
  isTrainerLicenseApplication,
  type LicenseApplicationProgram,
  type LicenseRestrictionCode,
} from "@/data/license-applications";
import type { LicenseProgramPreset } from "@/data/license-form-config";

export type LicenseProgramPresetKey =
  | "jt1_member"
  | "grand_council_officer"
  | "grand_council_member"
  | "club_owner"
  | "coach_license"
  | "senior_coach_license"
  | "adviser_license"
  | "trainer_license"
  | "referee_license"
  | "judge_license"
  | "fighter_license"
  | "staff_license";

export const LICENSE_PROGRAM_PRESETS: Record<
  LicenseProgramPresetKey,
  LicenseProgramPreset & { program: LicenseApplicationProgram; restrictionCode: LicenseRestrictionCode }
> = {
  jt1_member: {
    program: "jt1_member",
    restrictionCode: "JT1",
    title: "Member Application",
    label: "JT1 Member License",
    href: "/register-for-license",
    loadingLabel: "Loading license registration...",
    match: isJt1MemberApplication,
  },
  grand_council_officer: {
    program: "grand_council_officer",
    restrictionCode: "JT2",
    title: "Officer Application",
    label: "Grand Council Officer",
    href: "/register-for-license/grand-council-officer",
    loadingLabel: "Loading officer application...",
    match: isGrandCouncilOfficerApplication,
  },
  grand_council_member: {
    program: "grand_council_member",
    restrictionCode: "JT3",
    title: "Council Member Application",
    label: "Grand Council Member",
    href: "/register-for-license/grand-council-member",
    loadingLabel: "Loading council member application...",
    match: isGrandCouncilMemberApplication,
  },
  club_owner: {
    program: "club_owner",
    restrictionCode: "JT4",
    title: "Club Owner Application",
    label: "Club Owner",
    href: "/register-for-license/club-owner",
    loadingLabel: "Loading club owner application...",
    match: isClubOwnerApplication,
  },
  coach_license: {
    program: "coach_license",
    restrictionCode: "JT10",
    title: "Coach Application",
    label: "Coach License",
    href: "/register-for-license/coach",
    loadingLabel: "Loading coach application...",
    match: isCoachLicenseApplication,
  },
  senior_coach_license: {
    program: "senior_coach_license",
    restrictionCode: "JT10",
    title: "Senior Coach Application",
    label: "Senior Coach License",
    href: "/register-for-license/senior-coach",
    loadingLabel: "Loading senior coach application...",
    match: isSeniorCoachLicenseApplication,
  },
  adviser_license: {
    program: "adviser_license",
    restrictionCode: "JT6",
    title: "Adviser Application",
    label: "Adviser License",
    href: "/register-for-license/adviser",
    loadingLabel: "Loading adviser application...",
    match: isAdviserLicenseApplication,
  },
  trainer_license: {
    program: "trainer_license",
    restrictionCode: "JT7",
    title: "Trainer Application",
    label: "Trainer License",
    href: "/register-for-license/trainer",
    loadingLabel: "Loading trainer application...",
    match: isTrainerLicenseApplication,
  },
  referee_license: {
    program: "referee_license",
    restrictionCode: "JT8",
    title: "Referee Application",
    label: "Referee License",
    href: "/register-for-license/referee",
    loadingLabel: "Loading referee application...",
    match: isRefereeLicenseApplication,
  },
  judge_license: {
    program: "judge_license",
    restrictionCode: "JT9",
    title: "Judge Application",
    label: "Judge License",
    href: "/register-for-license/judge",
    loadingLabel: "Loading judge application...",
    match: isJudgeLicenseApplication,
  },
  fighter_license: {
    program: "fighter_license",
    restrictionCode: "JT11",
    title: "Fighter Application",
    label: "Fighter License",
    href: "/register-for-license/fighter",
    loadingLabel: "Loading fighter application...",
    match: isFighterLicenseApplication,
  },
  staff_license: {
    program: "staff_license",
    restrictionCode: "JT12",
    title: "Staff Application",
    label: "Staff License",
    href: "/register-for-license/staff",
    loadingLabel: "Loading staff application...",
    match: isStaffLicenseApplication,
  },
};
