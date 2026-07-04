"use client";

import { AdviserLicenseIdPreview } from "@/components/profile/AdviserLicenseIdPreview";
import { ClubOwnerIdPreview } from "@/components/profile/ClubOwnerIdPreview";
import { CoachLicenseIdPreview } from "@/components/profile/CoachLicenseIdPreview";
import { FighterLicenseIdPreview } from "@/components/profile/FighterLicenseIdPreview";
import { GrandCouncilMemberIdPreview } from "@/components/profile/GrandCouncilMemberIdPreview";
import { GrandCouncilOfficerIdPreview } from "@/components/profile/GrandCouncilOfficerIdPreview";
import { JudgeLicenseIdPreview } from "@/components/profile/JudgeLicenseIdPreview";
import { LicenseCardApplicationPreview } from "@/components/profile/LicenseCardApplicationPreview";
import { RefereeLicenseIdPreview } from "@/components/profile/RefereeLicenseIdPreview";
import { SeniorCoachLicenseIdPreview } from "@/components/profile/SeniorCoachLicenseIdPreview";
import { StaffLicenseIdPreview } from "@/components/profile/StaffLicenseIdPreview";
import { TrainerLicenseIdPreview } from "@/components/profile/TrainerLicenseIdPreview";
import { resolveApplicationProgram, type LicenseApplicationInput } from "@/data/license-applications";
import type { UserProfile } from "@/lib/auth/types";
import type { ProfileIdentity } from "@/lib/profile/identity";

export function LicenseIdPreviewSwitch({
  form,
  user,
  identity,
}: {
  form: LicenseApplicationInput;
  user: UserProfile;
  identity: ProfileIdentity;
}) {
  const program = resolveApplicationProgram(form);

  switch (program) {
    case "grand_council_officer":
      return <GrandCouncilOfficerIdPreview form={form} identity={identity} user={user} />;
    case "grand_council_member":
      return <GrandCouncilMemberIdPreview form={form} identity={identity} user={user} />;
    case "club_owner":
      return <ClubOwnerIdPreview form={form} identity={identity} user={user} />;
    case "coach_license":
      return <CoachLicenseIdPreview form={form} identity={identity} user={user} />;
    case "senior_coach_license":
      return <SeniorCoachLicenseIdPreview form={form} identity={identity} user={user} />;
    case "adviser_license":
      return <AdviserLicenseIdPreview form={form} identity={identity} user={user} />;
    case "trainer_license":
      return <TrainerLicenseIdPreview form={form} identity={identity} user={user} />;
    case "referee_license":
      return <RefereeLicenseIdPreview form={form} identity={identity} user={user} />;
    case "judge_license":
      return <JudgeLicenseIdPreview form={form} identity={identity} user={user} />;
    case "fighter_license":
      return <FighterLicenseIdPreview form={form} identity={identity} user={user} />;
    case "staff_license":
      return <StaffLicenseIdPreview form={form} identity={identity} user={user} />;
    default:
      return <LicenseCardApplicationPreview form={form} identity={identity} user={user} />;
  }
}
