import {
  licenseApplicationStatusLabels,
  resolveApplicationProgram,
  type LicenseApplication,
  type LicenseApplicationStatus,
} from "@/data/license-applications";

export const licenseApprovalStatusTone: Record<LicenseApplicationStatus, string> = {
  pending: "border-amber-500/40 bg-amber-500/10 text-amber-100",
  approved: "border-emerald-500/40 bg-emerald-500/10 text-emerald-100",
  rejected: "border-red-500/40 bg-red-500/10 text-red-100",
  needs_info: "border-sky-500/40 bg-sky-500/10 text-sky-100",
};

export function resolveLicenseProgramTitle(application: LicenseApplication) {
  switch (resolveApplicationProgram(application)) {
    case "fighter_license":
      return "Fighter License";
    case "coach_license":
      return "Coach License";
    case "senior_coach_license":
      return "Senior Coach License";
    case "referee_license":
      return "Referee License";
    case "judge_license":
      return "Judge License";
    case "club_owner":
      return "Club Owner";
    case "grand_council_member":
      return "Grand Council Member";
    case "grand_council_officer":
      return "Grand Council Officer";
    case "adviser_license":
      return "Adviser License";
    case "trainer_license":
      return "Trainer License";
    case "staff_license":
      return "Staff License";
    default:
      return "JTGC Membership License";
  }
}

export function resolveLicenseStatusLabel(status: LicenseApplicationStatus) {
  return licenseApplicationStatusLabels[status];
}
