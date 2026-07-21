import {
  formatLicenseDate,
  getRestrictionLabel,
  type LicenseApplication,
} from "@/data/license-applications";
import { resolveAccountTypeLabel, resolveUserTypeTagIds, type UserTypeTagId } from "@/data/user-type-tags";
import type { UserProfile } from "@/lib/auth/types";
import type { UserCommerceData } from "@/lib/commerce/types";
import type { ProfileIdentity } from "@/lib/profile/identity";
import {
  buildProfileRoleModule,
  type ProfileRoleKind,
  type ProfileRoleModule,
} from "@/lib/profile/role-modules";

export type MemberRecordStatus = "verified" | "pending" | "locked" | "none";
export type ProgressStepState = "complete" | "current" | "waiting" | "locked";

export type MemberCredentialChip = {
  icon: string;
  label: string;
  tone?: "success" | "warning" | "neutral";
};

export type MemberRequirement = {
  label: string;
  complete: boolean;
};

export type MemberVerificationItem = {
  label: string;
  status: "verified" | "pending" | "approved" | "none";
};

export type MemberTimelineEntry = {
  label: string;
  date: string;
  state: "complete" | "current" | "upcoming";
};

export type MemberActivityEntry = {
  label: string;
  date: string;
};

export type MemberProgressStep = {
  label: string;
  state: ProgressStepState;
};

export type AdminPermission = {
  label: string;
  enabled: boolean;
};

export type MemberStatistic = {
  label: string;
  value: string;
};

export type MemberOfficialRecord = {
  memberId: string;
  licenseLabel: string;
  statusLabel: string;
  statusTone: MemberRecordStatus;
  rank: string;
  club: string;
  region: string;
  restrictions: string;
  issueDate: string;
  expirationDate: string;
};

export type MemberRecord = {
  tagIds: UserTypeTagId[];
  accountTypeLabel: string;
  memberId: string;
  verificationLabel: string;
  licenseStatusLabel: string;
  licenseStatusTone: MemberRecordStatus;
  cardStatusLabel: string;
  cardStatusTone: MemberRecordStatus;
  joinedLabel: string;
  region: string;
  club: string;
  isAdmin: boolean;
  /** Administrator or Staff — ops tabs (Calendar, Tickets, Orders, Licenses). */
  canAccessOpsTabs: boolean;
  credentialChips: MemberCredentialChip[];
  officialRecord: MemberOfficialRecord;
  requirements: MemberRequirement[];
  requirementsPercent: number;
  verifications: MemberVerificationItem[];
  progressSteps: MemberProgressStep[];
  timeline: MemberTimelineEntry[];
  activity: MemberActivityEntry[];
  statistics: MemberStatistic[];
  adminPermissions: AdminPermission[];
  estimatedReviewDays: number | null;
  roleModule: ProfileRoleModule;
};

function formatMonthYear(value?: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date(value));
}

function hasUpload(value?: string | null) {
  return Boolean(value?.trim());
}

function buildLicenseStatus(application: LicenseApplication | null): {
  label: string;
  tone: MemberRecordStatus;
} {
  if (!application) {
    return { label: "No Application", tone: "none" };
  }

  switch (application.status) {
    case "approved":
      return { label: "Verified", tone: "verified" };
    case "pending":
      return { label: "Pending Review", tone: "pending" };
    case "needs_info":
      return { label: "More Info Needed", tone: "pending" };
    case "rejected":
      return { label: "Rejected", tone: "locked" };
    default:
      return { label: "Draft", tone: "none" };
  }
}

function buildCardStatus(application: LicenseApplication | null): {
  label: string;
  tone: MemberRecordStatus;
} {
  if (!application) {
    return { label: "Not Applied", tone: "none" };
  }

  if (application.status === "approved") {
    return { label: "Issued", tone: "verified" };
  }

  if (application.status === "pending" || application.status === "needs_info") {
    return { label: "Locked", tone: "locked" };
  }

  if (application.status === "rejected") {
    return { label: "Suspended", tone: "locked" };
  }

  return { label: "Locked", tone: "locked" };
}

function buildRequirements(application: LicenseApplication | null, userData: UserCommerceData) {
  const uploads = application?.uploads;
  const requirements: MemberRequirement[] = [
    { label: "Photo", complete: hasUpload(uploads?.profilePhoto) },
    { label: "Government ID", complete: hasUpload(uploads?.governmentId) },
    { label: "Signature", complete: hasUpload(uploads?.signature) },
    { label: "Medical Certificate", complete: hasUpload(uploads?.medicalCertificate) },
    {
      label: "Emergency Contact",
      complete: Boolean(application?.emergencyContactName?.trim() && application?.emergencyContactPhone?.trim()),
    },
  ];

  if (!application) {
    requirements.unshift({ label: "Membership Profile", complete: Boolean(userData.phone.trim()) });
  }

  const completeCount = requirements.filter((item) => item.complete).length;
  const requirementsPercent = Math.round((completeCount / requirements.length) * 100);

  return { requirements, requirementsPercent };
}

function buildProgressSteps(application: LicenseApplication | null): MemberProgressStep[] {
  if (!application) {
    return [
      { label: "Application", state: "waiting" },
      { label: "Documents", state: "locked" },
      { label: "Verification", state: "locked" },
      { label: "Medical", state: "locked" },
      { label: "Admin Review", state: "locked" },
      { label: "Approval", state: "locked" },
      { label: "Card Generation", state: "locked" },
    ];
  }

  const uploads = application.uploads;
  const docsComplete =
    hasUpload(uploads.profilePhoto) && hasUpload(uploads.governmentId) && hasUpload(uploads.signature);
  const verificationComplete = docsComplete && Boolean(application.fullName.trim());
  const medicalComplete = hasUpload(uploads.medicalCertificate) || application.restrictionCode !== "JT11";
  const reviewState: ProgressStepState =
    application.status === "pending" ? "current" : application.status === "approved" ? "complete" : "waiting";
  const approvalState: ProgressStepState =
    application.status === "approved" ? "complete" : application.status === "pending" ? "waiting" : "locked";
  const cardState: ProgressStepState = application.status === "approved" ? "complete" : "locked";

  return [
    { label: "Application", state: "complete" },
    { label: "Documents", state: docsComplete ? "complete" : "current" },
    { label: "Verification", state: verificationComplete ? "complete" : docsComplete ? "current" : "locked" },
    { label: "Medical", state: medicalComplete ? "complete" : verificationComplete ? "current" : "locked" },
    { label: "Admin Review", state: reviewState },
    { label: "Approval", state: approvalState },
    { label: "Card Generation", state: cardState },
  ];
}

function buildTimeline(
  user: UserProfile,
  application: LicenseApplication | null,
  joinedLabel: string,
): MemberTimelineEntry[] {
  const entries: MemberTimelineEntry[] = [
    { label: "Joined", date: joinedLabel, state: "complete" },
  ];

  if (application?.submittedAt) {
    entries.push({
      label: "Applied",
      date: formatLicenseDate(application.submittedAt),
      state: "complete",
    });
  }

  if (application?.status === "approved" && application.reviewedAt) {
    entries.push({
      label: "Approved",
      date: formatLicenseDate(application.reviewedAt),
      state: "complete",
    });
    entries.push({
      label: "Card Issued",
      date: formatLicenseDate(application.issuedDate ?? application.reviewedAt),
      state: "complete",
    });
  } else if (application?.status === "pending") {
    entries.push({ label: "Applied", date: formatLicenseDate(application.submittedAt), state: "complete" });
    entries.push({ label: "Admin Review", date: "In progress", state: "current" });
    entries.push({ label: "Card Issued", date: "Waiting", state: "upcoming" });
  }

  entries.push({ label: "Current", date: "Active membership", state: "current" });
  return entries;
}

function buildActivity(
  user: UserProfile,
  application: LicenseApplication | null,
  joinedLabel: string,
): MemberActivityEntry[] {
  const activity: MemberActivityEntry[] = [{ label: "Joined Platform", date: joinedLabel }];

  if (application?.submittedAt) {
    activity.unshift({ label: "License Submitted", date: formatLicenseDate(application.submittedAt) });
  }

  if (hasUpload(application?.uploads?.medicalCertificate)) {
    activity.unshift({ label: "Medical Uploaded", date: formatLicenseDate(application?.submittedAt) });
  }

  if (application?.status === "approved") {
    activity.unshift({
      label: "Card Issued",
      date: formatLicenseDate(application.issuedDate ?? application.reviewedAt),
    });
    activity.unshift({
      label: "License Approved",
      date: formatLicenseDate(application.reviewedAt),
    });
  } else if (application?.status === "pending") {
    activity.unshift({ label: "Application Pending Review", date: "Recently" });
  } else if (application?.status === "needs_info") {
    activity.unshift({ label: "More Information Requested", date: formatLicenseDate(application.reviewedAt) });
  }

  return activity.slice(0, 6);
}

function buildCredentialChips(
  record: MemberOfficialRecord,
  tagIds: UserTypeTagId[],
  isAdmin: boolean,
): MemberCredentialChip[] {
  const chips: MemberCredentialChip[] = [];

  if (record.statusTone === "verified") {
    chips.push({ icon: "🟢", label: "Verified Member", tone: "success" });
  } else if (record.statusTone === "pending") {
    chips.push({ icon: "🟡", label: "Pending Verification", tone: "warning" });
  } else {
    chips.push({ icon: "⚪", label: "Regular Member", tone: "neutral" });
  }

  if (tagIds.includes("fighter")) {
    chips.push({ icon: "🏆", label: record.licenseLabel, tone: "success" });
  }

  if (tagIds.includes("grand_council_member") || tagIds.includes("grandmaster")) {
    chips.push({ icon: "🏛️", label: "Grand Council Official", tone: "success" });
  }

  if (isAdmin) {
    chips.push({ icon: "🛡️", label: "System Administrator", tone: "success" });
  }

  if (record.expirationDate !== "—") {
    chips.push({ icon: "📅", label: `License Expires: ${record.expirationDate}`, tone: "neutral" });
  }

  if (record.region !== "—") {
    chips.push({ icon: "📍", label: `Region: ${record.region}`, tone: "neutral" });
  }

  if (record.club !== "—") {
    chips.push({ icon: "🥋", label: `Club: ${record.club}`, tone: "neutral" });
  }

  return chips;
}

export function buildMemberRecord(input: {
  user: UserProfile;
  userData: UserCommerceData;
  identity: ProfileIdentity;
  licenseApplication: LicenseApplication | null;
  adminAssignedTags?: UserTypeTagId[];
  isAdmin?: boolean;
  ordersCount?: number;
  pendingLicenseCount?: number;
  previewRoleKind?: ProfileRoleKind | null;
}): MemberRecord {
  const {
    user,
    userData,
    identity,
    licenseApplication,
    adminAssignedTags = [],
    isAdmin = false,
    ordersCount = 0,
    pendingLicenseCount = 0,
    previewRoleKind = null,
  } = input;

  const tagIds = resolveUserTypeTagIds(user, licenseApplication, adminAssignedTags);
  const accountTypeLabel = resolveAccountTypeLabel(user, tagIds);
  const joinedLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(new Date(user.createdAt));

  const licenseStatus = buildLicenseStatus(licenseApplication);
  const cardStatus = buildCardStatus(licenseApplication);
  const { requirements, requirementsPercent } = buildRequirements(licenseApplication, userData);

  const licenseLabel = licenseApplication
    ? `${licenseApplication.restrictionCode} ${getRestrictionLabel(licenseApplication.restrictionCode).replace(/^JT\d+\.\s*/, "")}`
    : "No License";

  const officialRecord: MemberOfficialRecord = {
    memberId: identity.memberId,
    licenseLabel,
    statusLabel: licenseStatus.label,
    statusTone: licenseStatus.tone,
    rank: identity.athlete?.rank ?? "Unranked",
    club: user.gym.trim() || licenseApplication?.backgroundAnswers?.coachingClub || "—",
    region: user.city.trim() || identity.athlete?.region || "—",
    restrictions: licenseApplication?.restrictionCode ?? "None",
    issueDate: formatMonthYear(licenseApplication?.issuedDate),
    expirationDate: formatMonthYear(licenseApplication?.expiryDate),
  };

  const verifications: MemberVerificationItem[] = [
    {
      label: "Identity",
      status: licenseApplication?.status === "approved" || user.fullName.trim() ? "verified" : "pending",
    },
    {
      label: "Government ID",
      status: hasUpload(licenseApplication?.uploads?.governmentId) ? "verified" : "pending",
    },
    {
      label: "Face Match",
      status: hasUpload(licenseApplication?.uploads?.profilePhoto) ? "verified" : "none",
    },
    {
      label: "Medical",
      status: hasUpload(licenseApplication?.uploads?.medicalCertificate) ? "approved" : "pending",
    },
    {
      label: "GAB",
      status: licenseApplication?.status === "approved" ? "approved" : "none",
    },
  ];

  const adminPermissions: AdminPermission[] = isAdmin
    ? [
        { label: "Can Review Licenses", enabled: true },
        { label: "Can Approve Cards", enabled: true },
        { label: "Can Suspend Accounts", enabled: true },
        { label: "Can Edit Events", enabled: true },
        { label: "Can Manage Shop", enabled: true },
        { label: "Can Create Officials", enabled: true },
      ]
    : [];

  const roleModule = buildProfileRoleModule({
    user,
    userData,
    identity,
    tagIds,
    officialRecord,
    licenseApplication,
    isAdmin,
    ordersCount,
    pendingLicenseCount,
    overrideKind: previewRoleKind ?? undefined,
  });

  const canAccessOpsTabs = previewRoleKind
    ? previewRoleKind === "admin" || previewRoleKind === "staff"
    : isAdmin || tagIds.includes("staff") || roleModule.kind === "staff";

  return {
    tagIds,
    accountTypeLabel,
    memberId: identity.memberId,
    verificationLabel:
      licenseStatus.tone === "verified"
        ? "Verified Member"
        : licenseStatus.tone === "pending"
          ? "Pending Verification"
          : accountTypeLabel,
    licenseStatusLabel: licenseStatus.label,
    licenseStatusTone: licenseStatus.tone,
    cardStatusLabel: cardStatus.label,
    cardStatusTone: cardStatus.tone,
    joinedLabel,
    region: officialRecord.region,
    club: officialRecord.club,
    isAdmin,
    canAccessOpsTabs,
    credentialChips: buildCredentialChips(officialRecord, tagIds, isAdmin),
    officialRecord,
    requirements,
    requirementsPercent,
    verifications,
    progressSteps: buildProgressSteps(licenseApplication),
    timeline: buildTimeline(user, licenseApplication, joinedLabel),
    activity: buildActivity(user, licenseApplication, joinedLabel),
    statistics: roleModule.statistics,
    adminPermissions,
    estimatedReviewDays: licenseApplication?.status === "pending" ? 3 : null,
    roleModule,
  };
}
