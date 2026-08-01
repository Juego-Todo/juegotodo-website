import type { LicenseProgramPresetKey } from "@/data/license-program-presets";

export type LicenseProcessMeta = {
  description: string;
  durationLabel: string;
  costLabel: string;
  steps: string[];
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

const processByProgram: Partial<Record<LicenseProgramPresetKey, Partial<LicenseProcessMeta>>> = {
  fighter_license: {
    description:
      "Submit your competition profile and medical clearance. After admin review, your fighter license and digital ID are issued.",
    costLabel: "Est. ₱3,500 / year",
  },
  coach_license: {
    description:
      "Submit your coaching credentials for JTGC review. Once approved, your coach license unlocks roster tools on your profile.",
    costLabel: "Est. ₱3,500 / year",
  },
  senior_coach_license: {
    description:
      "Submit senior coaching credentials for elite certification. Approval unlocks your senior coach license and ID.",
    costLabel: "Est. ₱4,500 / year",
  },
  referee_license: {
    description:
      "Submit officiating credentials and ruleset experience. Admin review confirms your referee license for sanctioned events.",
    costLabel: "Est. ₱3,500 / year",
  },
  judge_license: {
    description:
      "Submit judging credentials for JTGC approval. Once cleared, your judge license is issued for event scoring duties.",
    costLabel: "Est. ₱3,500 / year",
  },
  staff_license: {
    description:
      "Submit staff credentials for league operations. After review, your staff license unlocks internal tools.",
    costLabel: "Est. ₱2,500 / year",
  },
  jt1_member: {
    description:
      "Complete your JT1 member application to join the official JTGC membership and receive your digital member ID.",
    costLabel: "Est. ₱3,500 / year",
  },
};

export function getLicenseProcessMeta(presetKey: LicenseProgramPresetKey): LicenseProcessMeta {
  const override = processByProgram[presetKey] ?? {};

  return {
    description:
      override.description ??
      "Complete your application and uploads. JTGC admin will review your credentials before issuing your license and digital ID.",
    durationLabel: override.durationLabel ?? "About 3–5 business days",
    costLabel: override.costLabel ?? "Est. ₱3,500 / year",
    steps: override.steps ?? [...DEFAULT_STEPS],
  };
}
