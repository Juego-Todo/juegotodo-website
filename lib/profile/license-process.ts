import type { LicenseProgramPresetKey } from "@/data/license-program-presets";

export type LicenseProcessMeta = {
  description: string;
  durationLabel: string;
  costLabel: string;
  steps: string[];
  detail: string;
};

const DEFAULT_STEPS = [
  "Application",
  "Documents",
  "Verification",
  "Medical",
  "Admin Review",
  "Approval",
  "Card Generation",
] as const;

const processByProgram: Record<LicenseProgramPresetKey, Partial<LicenseProcessMeta>> = {
  jt1_member: {
    detail: "JT1 membership",
    description:
      "Complete your JT1 member application to join the official JTGC membership and receive your digital member ID.",
    costLabel: "Est. ₱3,500 / year",
  },
  fighter_license: {
    detail: "Competition athlete",
    description:
      "Submit your competition profile and medical clearance. After admin review, your fighter license and digital ID are issued.",
    costLabel: "Est. ₱3,500 / year",
  },
  coach_license: {
    detail: "Team coaching",
    description:
      "Submit your coaching credentials for JTGC review. Once approved, your coach license unlocks roster tools on your profile.",
    costLabel: "Est. ₱3,500 / year",
  },
  senior_coach_license: {
    detail: "Elite coaching",
    description:
      "Submit senior coaching credentials for elite certification. Approval unlocks your senior coach license and ID.",
    costLabel: "Est. ₱4,500 / year",
  },
  trainer_license: {
    detail: "Training credentials",
    description:
      "Submit trainer certifications and experience. After review, your trainer license confirms your role in sanctioned camps.",
    costLabel: "Est. ₱3,000 / year",
  },
  referee_license: {
    detail: "Officiating",
    description:
      "Submit officiating credentials and ruleset experience. Admin review confirms your referee license for sanctioned events.",
    costLabel: "Est. ₱3,500 / year",
  },
  judge_license: {
    detail: "Scoring officials",
    description:
      "Submit judging credentials for JTGC approval. Once cleared, your judge license is issued for event scoring duties.",
    costLabel: "Est. ₱3,500 / year",
  },
  adviser_license: {
    detail: "Professional adviser",
    description:
      "Apply as a professional adviser supporting JTGC programs. Approval issues your adviser license and digital ID.",
    costLabel: "Est. ₱3,500 / year",
  },
  club_owner: {
    detail: "Gym affiliation",
    description:
      "Register your gym or club affiliation with JTGC. After review, your club owner credential is issued for league recognition.",
    costLabel: "Est. ₱4,000 / year",
  },
  staff_license: {
    detail: "League operations",
    description:
      "Submit staff credentials for league operations. After review, your staff license unlocks internal tools.",
    costLabel: "Est. ₱2,500 / year",
  },
  grand_council_member: {
    detail: "Council membership",
    description:
      "Apply for Grand Council membership. After verification, your council member credential and digital ID are issued.",
    durationLabel: "About 5–10 business days",
    costLabel: "Est. ₱5,000 / year",
  },
  grand_council_officer: {
    detail: "Council officer",
    description:
      "Apply for a Grand Council officer role. Review confirms appointment details before your officer ID is issued.",
    durationLabel: "About 5–10 business days",
    costLabel: "Est. ₱5,000 / year",
  },
};

export function getLicenseProcessMeta(presetKey: LicenseProgramPresetKey): LicenseProcessMeta {
  const override = processByProgram[presetKey] ?? {};

  return {
    detail: override.detail ?? "JTGC credential",
    description:
      override.description ??
      "Complete your application and uploads. JTGC admin will review your credentials before issuing your license and digital ID.",
    durationLabel: override.durationLabel ?? "About 3–5 business days",
    costLabel: override.costLabel ?? "Est. ₱3,500 / year",
    steps: override.steps ?? [...DEFAULT_STEPS],
  };
}
