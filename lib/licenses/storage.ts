import {
  buildLicenseIdNumber,
  normalizeLicenseApplication,
  prepareLicenseApplicationInput,
  resolveApplicationProgram,
  type LicenseApplication,
  type LicenseApplicationInput,
  type LicenseApplicationStatus,
} from "@/data/license-applications";
import { resolveLicenseTag } from "@/data/user-type-tags";
import { sendLicenseSubmissionConfirmation } from "@/lib/licenses/email";
import { addAdminAssignedTag } from "@/lib/profile/account-tags";

const LICENSES_KEY = "juego-todo.license.applications";

function readApplications(): LicenseApplication[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(LICENSES_KEY);
    const parsed = raw ? (JSON.parse(raw) as LicenseApplication[]) : [];
    return parsed.map((application) => normalizeLicenseApplication(application));
  } catch {
    return [];
  }
}

function writeApplications(applications: LicenseApplication[]) {
  window.localStorage.setItem(LICENSES_KEY, JSON.stringify(applications));
}

function buildIdNumber(userId: string, input: LicenseApplicationInput) {
  return buildLicenseIdNumber(userId, resolveApplicationProgram(input));
}

function addYears(date: Date, years: number) {
  const next = new Date(date);
  next.setFullYear(next.getFullYear() + years);
  return next.toISOString();
}

export function getLicenseApplicationByUserId(userId: string) {
  return readApplications().find((application) => application.userId === userId) ?? null;
}

export function getLicenseApplicationById(applicationId: string) {
  return readApplications().find((application) => application.id === applicationId) ?? null;
}

export function deleteLicenseApplicationsByUserId(userId: string) {
  writeApplications(readApplications().filter((application) => application.userId !== userId));
}

export function getAllLicenseApplications() {
  return readApplications().sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  );
}

export function submitLicenseApplication(
  userId: string,
  userEmail: string,
  input: LicenseApplicationInput,
): LicenseApplication {
  const applications = readApplications();
  const existingIndex = applications.findIndex((application) => application.userId === userId);
  const prepared = prepareLicenseApplicationInput(input);
  const existing = existingIndex >= 0 ? applications[existingIndex] : null;
  const preserveIdNumber =
    existing &&
    resolveApplicationProgram(existing) === resolveApplicationProgram(input) &&
    existing.idNumber;

  const application: LicenseApplication = {
    ...prepared,
    id: existingIndex >= 0 ? applications[existingIndex].id : crypto.randomUUID(),
    userId,
    userEmail,
    status: "pending",
    idNumber: preserveIdNumber || buildIdNumber(userId, input),
    issuedDate: null,
    expiryDate: null,
    submittedAt: new Date().toISOString(),
    reviewedAt: null,
    reviewNotes: "",
  };

  if (existingIndex >= 0) {
    applications[existingIndex] = application;
  } else {
    applications.push(application);
  }

  writeApplications(applications);
  return application;
}

export function updateLicenseApplicationStatus(
  applicationId: string,
  status: LicenseApplicationStatus,
  reviewNotes = "",
) {
  const applications = readApplications();
  const index = applications.findIndex((application) => application.id === applicationId);

  if (index === -1) {
    throw new Error("License application not found.");
  }

  const current = applications[index];
  const reviewedAt = new Date().toISOString();

  applications[index] = {
    ...current,
    status,
    reviewNotes,
    reviewedAt,
    issuedDate: status === "approved" ? reviewedAt : current.issuedDate,
    expiryDate: status === "approved" ? addYears(new Date(reviewedAt), 1) : current.expiryDate,
  };

  writeApplications(applications);

  if (status === "approved") {
    const licenseTag = resolveLicenseTag(current.restrictionCode);
    if (licenseTag) {
      addAdminAssignedTag(current.userId, licenseTag);
    }
  }

  return applications[index];
}

export async function fetchLicenseApplicationByUserId(userId: string) {
  return getLicenseApplicationByUserId(userId);
}

export async function fetchLicenseApplicationById(applicationId: string) {
  return getLicenseApplicationById(applicationId);
}

export async function fetchAllLicenseApplications() {
  return getAllLicenseApplications();
}

export function getPendingLicenseApplicationCount() {
  return readApplications().filter((application) => application.status === "pending").length;
}

export function getReviewQueueLicenseApplicationCount() {
  return readApplications().filter(
    (application) => application.status === "pending" || application.status === "needs_info",
  ).length;
}

export async function saveLicenseApplication(
  userId: string,
  userEmail: string,
  input: LicenseApplicationInput,
) {
  const application = submitLicenseApplication(userId, userEmail, input);
  await sendLicenseSubmissionConfirmation(userId, userEmail, application.fullName);
  return application;
}

export async function reviewLicenseApplication(
  applicationId: string,
  status: LicenseApplicationStatus,
  reviewNotes = "",
) {
  return updateLicenseApplicationStatus(applicationId, status, reviewNotes);
}
