import type { LicenseApplication } from "@/data/license-applications";
import type { ProfileSectionId } from "@/components/profile/ProfileSidebarNav";
import type { UserTypeTagId } from "@/data/user-type-tags";
import { getJtgcTierLabel } from "@/lib/profile/identity";
import type { ProfileIdentity } from "@/lib/profile/identity";
import type { UserProfile } from "@/lib/auth/types";
import type { UserCommerceData } from "@/lib/commerce/types";
import type { MemberOfficialRecord, MemberRecordStatus, MemberStatistic } from "@/lib/profile/member-record";

export type ProfileRoleKind =
  | "admin"
  | "community"
  | "fighter"
  | "coach"
  | "grandmaster"
  | "referee"
  | "judge"
  | "club_owner"
  | "grand_council"
  | "adviser"
  | "staff";

export type RoleStatItem = {
  label: string;
  value: string;
  tone?: "verified" | "pending" | "locked" | "neutral" | "accent";
};

export type RoleQuickLink = {
  label: string;
  href?: string;
  section?: ProfileSectionId;
};

export type CareerSnapshotItem = {
  icon: string;
  label: string;
  value: string;
  detail?: string;
};

export type ProfileRoleModule = {
  kind: ProfileRoleKind;
  bannerClass: string;
  accentClass: string;
  roleTitle: string;
  displayName: string;
  subtitle: string;
  memberId: string;
  statusBadge: string;
  statusTone: MemberRecordStatus;
  stats: RoleStatItem[];
  secondaryStats: RoleStatItem[];
  quickLinks: RoleQuickLink[];
  careerSnapshot: CareerSnapshotItem[];
  progressLabel?: string;
  progressValue?: number;
  progressMeta?: string;
  statistics: MemberStatistic[];
};

export const profileRolePreviewOptions: { kind: ProfileRoleKind; label: string }[] = [
  { kind: "community", label: "Community Member" },
  { kind: "fighter", label: "Fighter" },
  { kind: "coach", label: "Coach" },
  { kind: "grand_council", label: "Grand Council" },
  { kind: "grandmaster", label: "Grand Master" },
  { kind: "referee", label: "Referee" },
  { kind: "judge", label: "Judge" },
  { kind: "club_owner", label: "Club Owner" },
  { kind: "adviser", label: "Adviser" },
  { kind: "staff", label: "Staff" },
  { kind: "admin", label: "Administrator" },
];

export function getProfileRolePreviewLabel(kind: ProfileRoleKind) {
  return profileRolePreviewOptions.find((option) => option.kind === kind)?.label ?? kind;
}

export function isProfileRoleKind(value: string): value is ProfileRoleKind {
  return profileRolePreviewOptions.some((option) => option.kind === value);
}

const rolePriority: { kind: ProfileRoleKind; tag: UserTypeTagId | "admin" }[] = [
  { kind: "admin", tag: "admin" },
  { kind: "grandmaster", tag: "grandmaster" },
  { kind: "grand_council", tag: "grand_council_member" },
  { kind: "club_owner", tag: "gym_owner" },
  { kind: "fighter", tag: "fighter" },
  { kind: "coach", tag: "coach" },
  { kind: "referee", tag: "referee" },
  { kind: "judge", tag: "judge" },
  { kind: "adviser", tag: "adviser" },
  { kind: "staff", tag: "staff" },
];

function resolvePrimaryRole(tagIds: UserTypeTagId[], isAdmin: boolean): ProfileRoleKind {
  if (isAdmin) {
    return "admin";
  }

  for (const entry of rolePriority) {
    if (entry.tag !== "admin" && tagIds.includes(entry.tag)) {
      return entry.kind;
    }
  }

  return "community";
}

function licenseAnswers(application: LicenseApplication | null) {
  return application?.backgroundAnswers ?? {};
}

function medicalStatus(application: LicenseApplication | null) {
  return application?.uploads?.medicalCertificate?.trim() ? "Valid" : "Pending";
}

export function buildProfileRoleModule(input: {
  user: UserProfile;
  userData: UserCommerceData;
  identity: ProfileIdentity;
  tagIds: UserTypeTagId[];
  officialRecord: MemberOfficialRecord;
  licenseApplication: LicenseApplication | null;
  isAdmin: boolean;
  ordersCount: number;
  pendingLicenseCount?: number;
  memberCountEstimate?: number;
  overrideKind?: ProfileRoleKind;
}): ProfileRoleModule {
  const {
    user,
    userData,
    identity,
    tagIds,
    officialRecord,
    licenseApplication,
    isAdmin,
    ordersCount,
    pendingLicenseCount = 0,
    memberCountEstimate = 14292,
    overrideKind,
  } = input;

  const kind = overrideKind ?? resolvePrimaryRole(tagIds, isAdmin);
  const answers = licenseAnswers(licenseApplication);
  const athlete = identity.athlete;
  const club = officialRecord.club !== "—" ? officialRecord.club : "Unaffiliated";
  const region = officialRecord.region !== "—" ? officialRecord.region : "Philippines";
  const base = {
    kind,
    memberId: officialRecord.memberId,
    displayName: user.fullName,
    statusBadge: officialRecord.statusLabel === "Verified" ? "Verified Member" : officialRecord.statusLabel,
    statusTone: officialRecord.statusTone,
  };

  switch (kind) {
    case "admin":
      return {
        ...base,
        bannerClass: "from-amber-950/90 via-zinc-950/95 to-black",
        accentClass: "text-amber-200",
        roleTitle: "System Administrator",
        subtitle: "JTGC Internal",
        stats: [
          { label: "Pending Licenses", value: `${pendingLicenseCount || 18}` },
          { label: "Pending Cards", value: `${Math.max(pendingLicenseCount - 6, 12)}` },
          { label: "Members", value: memberCountEstimate.toLocaleString() },
          { label: "Officials", value: "284" },
          { label: "Events", value: "43" },
        ],
        secondaryStats: [],
        quickLinks: [
          { label: "Admin Console", href: "/admin" },
          { label: "License Queue", href: "/admin?tab=licenses" },
          { label: "Reports", href: "/admin/reports" },
          { label: "Moderation", section: "notifications" },
        ],
        careerSnapshot: [
          { icon: "📊", label: "Platform Health", value: `${pendingLicenseCount || 18} Applications Pending` },
          { icon: "✅", label: "License Approval Rate", value: "92%" },
          { icon: "🪪", label: "Cards Waiting", value: `${Math.max(pendingLicenseCount - 6, 12)}` },
        ],
        statistics: [
          { label: "Pending Licenses", value: `${pendingLicenseCount || 18}` },
          { label: "Pending Cards", value: "12" },
          { label: "Members", value: "14,292" },
          { label: "Officials", value: "284" },
          { label: "Events", value: "43" },
        ],
      };

    case "fighter":
      return {
        ...base,
        bannerClass: "from-red-950/95 via-black/90 to-zinc-950/90",
        accentClass: "text-red-200",
        roleTitle: "Licensed Fighter",
        subtitle: licenseApplication?.restrictionCode ?? "JT11",
        statusBadge: athlete?.status === "Active" ? "Active License" : officialRecord.statusLabel,
        stats: [
          { label: "Professional Record", value: athlete?.record ?? "0-0", tone: "accent" },
          { label: "Weight Class", value: athlete?.division ?? answers.weightDivision ?? "—" },
          { label: "Ranking", value: athlete?.rank ?? officialRecord.rank },
          { label: "Fight Team", value: athlete?.team ?? club },
          { label: "Coach", value: answers.coachName ?? answers.coachingClub ?? "—" },
        ],
        secondaryStats: [
          { label: "Medical", value: medicalStatus(licenseApplication), tone: medicalStatus(licenseApplication) === "Valid" ? "verified" : "pending" },
          { label: "License", value: officialRecord.statusLabel, tone: officialRecord.statusTone === "verified" ? "verified" : "pending" },
          { label: "Suspension", value: athlete?.status === "Suspended" ? "Active" : "None" },
          { label: "Next Fight", value: "August 14" },
        ],
        quickLinks: [
          { label: "Career Overview", section: "record" },
          { label: "Fight History", section: "history" },
          { label: "Medical Clearance", section: "medical" },
          { label: "Weight Tracking", section: "fighter" },
          { label: "Rankings", section: "rankings" },
          { label: "Championships", section: "achievements" },
        ],
        careerSnapshot: [
          { icon: "🥊", label: "Last Fight", value: "Win via KO", detail: "July 18" },
          { icon: "🔥", label: "Current Streak", value: `${athlete?.winStreak ?? 5} Wins` },
          { icon: "🎯", label: "Next Opponent", value: "Pending" },
        ],
        statistics: [
          { label: "Competitions", value: `${athlete?.matchCount ?? 0}` },
          { label: "Wins", value: `${athlete?.wins ?? 0}` },
          { label: "Losses", value: `${athlete?.losses ?? 0}` },
          { label: "Events Attended", value: `${(athlete?.matchCount ?? 0) + 5}` },
          { label: "Certificates", value: `${athlete?.achievements.length ?? 0}` },
        ],
      };

    case "coach":
      return {
        ...base,
        bannerClass: "from-sky-950/90 via-black/90 to-zinc-950/90",
        accentClass: "text-sky-200",
        roleTitle: "Licensed Coach",
        subtitle: answers.coachingLevel ?? "Level III",
        stats: [
          { label: "Students", value: answers.numberOfStudents ?? "48" },
          { label: "Licensed Fighters", value: answers.championshipsCoached ?? "19" },
          { label: "Champions Produced", value: answers.championsProduced ?? "6" },
          { label: "Years Coaching", value: answers.yearsCoaching ?? "18" },
          { label: "Certification", value: answers.coachingLevel ?? "Level III" },
        ],
        secondaryStats: [
          { label: "Upcoming Corners", value: "4" },
          { label: "Club", value: answers.coachingClub ?? club },
        ],
        quickLinks: [
          { label: "Students", section: "coach-tools" },
          { label: "Club", section: "club" },
          { label: "Certifications", section: "certificates" },
          { label: "Events", section: "calendar" },
        ],
        careerSnapshot: [
          { icon: "🏆", label: "Last Student Fight", value: "Victory" },
          { icon: "🥋", label: "Active Fighters", value: "12 Active" },
          { icon: "📅", label: "Next Corner", value: "Saturday" },
        ],
        statistics: [
          { label: "Students", value: answers.numberOfStudents ?? "48" },
          { label: "Licensed Fighters", value: "19" },
          { label: "Champions", value: answers.championsProduced ?? "6" },
          { label: "Years Coaching", value: answers.yearsCoaching ?? "18" },
          { label: "Events", value: "12" },
        ],
      };

    case "grandmaster":
      return {
        ...base,
        bannerClass: "from-yellow-950/80 via-red-950/70 to-black",
        accentClass: "text-yellow-100",
        roleTitle: "Grand Master",
        subtitle: answers.mainStyle ?? "Bakbakan Kali",
        stats: [
          { label: "System", value: answers.mainStyle ?? "Bakbakan Kali" },
          { label: "Years Training", value: answers.yearsExperience ?? "52" },
          { label: "Years Teaching", value: answers.yearsCoaching ?? "41" },
          { label: "Schools", value: "34" },
          { label: "Countries", value: "12" },
          { label: "Recognized Since", value: "1999" },
        ],
        secondaryStats: [],
        quickLinks: [
          { label: "Hall of Fame", section: "achievements" },
          { label: "Verified Lineage", section: "certificates" },
          { label: "Seminars", section: "calendar" },
          { label: "Biography", section: "membership" },
        ],
        careerSnapshot: [
          { icon: "🥋", label: "Latest Seminar", value: "Cebu" },
          { icon: "🎓", label: "Students Certified", value: "48" },
          { icon: "🏛️", label: "Recent Recognition", value: "Hall of Fame" },
        ],
        statistics: [
          { label: "Schools", value: "34" },
          { label: "Countries", value: "12" },
          { label: "Years Teaching", value: "41" },
          { label: "Seminars", value: "27" },
          { label: "Students", value: "500+" },
        ],
      };

    case "referee":
      return {
        ...base,
        bannerClass: "from-amber-950/85 via-black/90 to-zinc-950/90",
        accentClass: "text-amber-200",
        roleTitle: "Official Referee",
        subtitle: answers.refereeLevel ?? "Level A",
        stats: [
          { label: "Official Bouts", value: "312" },
          { label: "Title Matches", value: "48" },
          { label: "Average Rating", value: "9.8", tone: "accent" },
          { label: "Years Active", value: answers.yearsExperience ?? "9" },
          { label: "Current Status", value: "Available", tone: "verified" },
        ],
        secondaryStats: [
          { label: "Upcoming Assignments", value: "8" },
          { label: "Reports Submitted", value: "100%", tone: "verified" },
        ],
        quickLinks: [
          { label: "Assignments", section: "official-tools" },
          { label: "Rulebooks", section: "important-documents" },
          { label: "Events Worked", section: "calendar" },
          { label: "Ratings", section: "rankings" },
        ],
        careerSnapshot: [
          { icon: "⚖", label: "Last Event", value: "JT Championship 12" },
          { icon: "📅", label: "Next Assignment", value: "National Finals" },
          { icon: "⭐", label: "Performance Rating", value: "9.7" },
        ],
        statistics: [
          { label: "Official Bouts", value: "312" },
          { label: "Title Matches", value: "48" },
          { label: "Rating", value: "9.8" },
          { label: "Assignments", value: "8" },
          { label: "Reports", value: "100%" },
        ],
      };

    case "judge":
      return {
        ...base,
        bannerClass: "from-yellow-950/80 via-black/90 to-zinc-950/90",
        accentClass: "text-yellow-200",
        roleTitle: "Official Judge",
        subtitle: answers.judgeLevel ?? "Sanctioned",
        stats: [
          { label: "Events Judged", value: "291" },
          { label: "Scorecards", value: "761" },
          { label: "Accuracy Rating", value: "98%", tone: "accent" },
          { label: "Title Events", value: "39" },
        ],
        secondaryStats: [{ label: "Current Assignments", value: "5" }],
        quickLinks: [
          { label: "Assignments", section: "judge-tools" },
          { label: "Events", section: "calendar" },
          { label: "Scores Submitted", section: "certificates" },
          { label: "License", section: "licenses" },
        ],
        careerSnapshot: [
          { icon: "📋", label: "Last Event", value: "Regional Finals" },
          { icon: "📅", label: "Next Assignment", value: "National Finals" },
          { icon: "✅", label: "Accuracy", value: "98%" },
        ],
        statistics: [
          { label: "Events Judged", value: "291" },
          { label: "Scorecards", value: "761" },
          { label: "Accuracy", value: "98%" },
          { label: "Title Events", value: "39" },
          { label: "Assignments", value: "5" },
        ],
      };

    case "club_owner":
      return {
        ...base,
        bannerClass: "from-emerald-950/85 via-black/90 to-zinc-950/90",
        accentClass: "text-emerald-200",
        roleTitle: "Affiliated Club",
        subtitle: answers.clubName ?? club,
        displayName: answers.clubName ?? club,
        stats: [
          { label: "Members", value: "174" },
          { label: "Licensed Fighters", value: "34" },
          { label: "Coaches", value: "6" },
          { label: "Events Hosted", value: "19" },
        ],
        secondaryStats: [
          { label: "Club Rank", value: "Gold", tone: "accent" },
          { label: "Affiliation", value: "Active", tone: "verified" },
        ],
        quickLinks: [
          { label: "Club Members", section: "club" },
          { label: "Instructors", section: "coach-tools" },
          { label: "Applications", section: "licenses" },
          { label: "Events", section: "calendar" },
        ],
        careerSnapshot: [
          { icon: "🥋", label: "Club", value: answers.clubName ?? club },
          { icon: "🏆", label: "Club Rank", value: "Gold" },
          { icon: "📅", label: "Next Event", value: "Regional Open" },
        ],
        statistics: [
          { label: "Members", value: "174" },
          { label: "Fighters", value: "34" },
          { label: "Coaches", value: "6" },
          { label: "Events Hosted", value: "19" },
          { label: "Rank", value: "Gold" },
        ],
      };

    case "grand_council":
      return {
        ...base,
        bannerClass: "from-violet-950/90 via-black/90 to-zinc-950/90",
        accentClass: "text-violet-200",
        roleTitle: "Grand Council",
        subtitle: answers.councilProvince ?? answers.officerRegion ?? region,
        stats: [
          { label: "Officials Managed", value: "21" },
          { label: "Events Sanctioned", value: "48" },
          { label: "Licenses Approved", value: "602" },
          { label: "Years Service", value: answers.yearsInService ?? "12" },
        ],
        secondaryStats: [{ label: "Current Committee", value: answers.councilPosition ?? "Competition Rules" }],
        quickLinks: [
          { label: "Council Members", section: "council-tools" },
          { label: "Regions", section: "club" },
          { label: "Approvals", href: "/admin?tab=licenses" },
          { label: "Reports", href: "/admin/reports" },
        ],
        careerSnapshot: [
          { icon: "🏛️", label: "Committee", value: answers.councilPosition ?? "Competition Rules" },
          { icon: "✅", label: "Licenses Approved", value: "602" },
          { icon: "📅", label: "Events Sanctioned", value: "48" },
        ],
        statistics: [
          { label: "Officials", value: "21" },
          { label: "Events", value: "48" },
          { label: "Licenses", value: "602" },
          { label: "Years Service", value: answers.yearsInService ?? "12" },
          { label: "Region", value: region },
        ],
      };

    case "adviser":
      return {
        ...base,
        bannerClass: "from-orange-950/85 via-black/90 to-zinc-950/90",
        accentClass: "text-orange-200",
        roleTitle: "Official Adviser",
        subtitle: answers.adviserPosition ?? answers.areaOfExpertise ?? "Technical",
        stats: [
          { label: "Committee", value: answers.organization ?? "Technical" },
          { label: "Years", value: answers.yearsExperience ?? "15" },
          { label: "Projects", value: "27" },
        ],
        secondaryStats: [{ label: "Current Assignments", value: "3" }],
        quickLinks: [
          { label: "Assignments", section: "council-tools" },
          { label: "Projects", section: "certificates" },
          { label: "License", section: "licenses" },
        ],
        careerSnapshot: [
          { icon: "📋", label: "Committee", value: answers.organization ?? "Technical" },
          { icon: "📅", label: "Assignments", value: "3 Active" },
          { icon: "🏛️", label: "Position", value: answers.adviserPosition ?? "Adviser" },
        ],
        statistics: [
          { label: "Projects", value: "27" },
          { label: "Years", value: answers.yearsExperience ?? "15" },
          { label: "Assignments", value: "3" },
          { label: "Committee", value: "Technical" },
          { label: "License", value: officialRecord.statusLabel },
        ],
      };

    case "staff":
      return {
        ...base,
        bannerClass: "from-zinc-900/95 via-black/90 to-zinc-950/90",
        accentClass: "text-zinc-200",
        roleTitle: "JTGC Staff",
        subtitle: answers.staffPosition ?? "Operations",
        stats: [
          { label: "Department", value: answers.staffPosition ?? "Operations" },
          { label: "Years Service", value: answers.yearsExperience ?? "5" },
          { label: "Events Supported", value: "32" },
        ],
        secondaryStats: [{ label: "Status", value: "Active", tone: "verified" }],
        quickLinks: [
          { label: "Staff Tools", section: "staff-tools" },
          { label: "Events", section: "calendar" },
          { label: "License", section: "licenses" },
        ],
        careerSnapshot: [
          { icon: "🛡️", label: "Role", value: answers.staffPosition ?? "Staff" },
          { icon: "📅", label: "Next Event", value: "JT Championship" },
        ],
        statistics: [
          { label: "Events", value: "32" },
          { label: "Years", value: answers.yearsExperience ?? "5" },
          { label: "Department", value: "Operations" },
          { label: "Status", value: "Active" },
          { label: "License", value: officialRecord.statusLabel },
        ],
      };

    default:
      return {
        ...base,
        bannerClass: "from-red-950/80 via-black/85 to-zinc-950/90",
        accentClass: "text-red-200",
        roleTitle: "Community Member",
        subtitle: getJtgcTierLabel(userData.membershipTier),
        stats: [
          { label: "Member Since", value: new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(new Date(user.createdAt)) },
          { label: "Fan Tier", value: getJtgcTierLabel(userData.membershipTier) },
          { label: "Events Attended", value: `${userData.savedEvents.length}` },
          { label: "Saved Fighters", value: `${userData.savedFighters.length}` },
          { label: "Favorite Team", value: userData.savedTeams[0] ?? "—" },
          { label: "Upcoming Event", value: userData.savedEvents[0] ?? "—" },
        ],
        secondaryStats: [],
        quickLinks: [
          { label: "Community Rewards", section: "membership" },
          { label: "Exclusive Content", section: "membership" },
          { label: "Discounts", href: "/shop" },
          { label: "Member Benefits", href: "/registration" },
        ],
        careerSnapshot: [
          { icon: "🎟️", label: "Saved Events", value: `${userData.savedEvents.length}` },
          { icon: "⭐", label: "Saved Fighters", value: `${userData.savedFighters.length}` },
          { icon: "🛍️", label: "Orders", value: `${ordersCount}` },
        ],
        progressLabel: "Community Progress",
        progressValue: Math.min(100, 40 + userData.savedFighters.length * 5 + userData.savedEvents.length * 5),
        progressMeta: userData.membershipTier === "free" ? "Bronze" : userData.membershipTier === "pro" ? "Silver" : "Gold",
        statistics: [
          { label: "Events Saved", value: `${userData.savedEvents.length}` },
          { label: "Saved Fighters", value: `${userData.savedFighters.length}` },
          { label: "Orders", value: `${ordersCount}` },
          { label: "Fan Tier", value: getJtgcTierLabel(userData.membershipTier) },
          { label: "Teams Saved", value: `${userData.savedTeams.length}` },
        ],
      };
  }
}
