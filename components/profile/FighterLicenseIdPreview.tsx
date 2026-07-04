"use client";

import { FighterLicenseIdCard } from "@/components/profile/FighterLicenseIdCard";
import { buildPreviewLicenseApplication, type LicenseApplicationInput } from "@/data/license-applications";
import type { UserProfile } from "@/lib/auth/types";
import type { ProfileIdentity } from "@/lib/profile/identity";

export function FighterLicenseIdPreview({
  form,
  user,
  identity,
}: {
  form: LicenseApplicationInput;
  user: UserProfile;
  identity: ProfileIdentity;
}) {
  const previewApplication = buildPreviewLicenseApplication(form, user);

  return (
    <div className="flex justify-center py-2">
      <FighterLicenseIdCard application={previewApplication} identity={identity} preview user={user} />
    </div>
  );
}
