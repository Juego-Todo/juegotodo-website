import {
  buildMembershipFullName,
  emptyMembershipApplicationDraft,
  type MembershipApplicationDraftInput,
  type MembershipApplicationRecord,
  type MembershipApplicationStatus,
  type MembershipCourier,
  type MembershipDocumentRecord,
  type MembershipDocumentType,
  type MembershipDocumentVerificationStatus,
  type MembershipHistoryRecord,
  type MembershipPaymentMethod,
  type MembershipPaymentRecord,
  type MembershipPaymentStatus,
} from "@/data/membership-applications";
import type { Json } from "@/lib/supabase/types";

export function validateMembershipDraft(
  input: MembershipApplicationDraftInput,
  options?: { requirePayment?: boolean; requireConsent?: boolean },
) {
  if (!input.firstName.trim()) return "First name is required.";
  if (!input.lastName.trim()) return "Last name is required.";
  if (!input.nationality.trim()) return "Nationality is required.";
  if (!input.dateOfBirth.trim()) return "Date of birth is required.";
  if (!input.placeOfBirth.trim()) return "Place of birth is required.";
  if (!input.gender.trim()) return "Gender is required.";
  if (!input.facebookUrl.trim()) return "Facebook profile link is required.";
  try {
    const parsed = new URL(input.facebookUrl.trim());
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "Enter a valid Facebook profile URL.";
    }
  } catch {
    return "Enter a valid Facebook profile URL.";
  }
  if (!input.contactEmail.trim() || !input.contactEmail.includes("@")) {
    return "A valid email address is required.";
  }
  if (!input.mobileNumber.trim()) return "Contact number is required.";
  if (!input.fightTeam.trim()) return "Fight team or gym is required.";
  if (!input.martialArtsSystem.trim()) return "Martial arts system is required.";
  if (!input.emergencyContactName.trim()) return "Emergency contact full name is required.";
  if (!input.emergencyContactRelationship.trim()) return "Emergency contact relationship is required.";
  if (!input.emergencyContactAddress.trim()) return "Emergency contact address is required.";
  if (!input.emergencyContactPhone.trim()) return "Emergency contact number is required.";
  if (!input.deliveryRecipientName.trim()) return "Delivery recipient legal name is required.";
  if (!input.deliveryAddress.trim()) return "Complete delivery address is required.";
  if (!input.deliveryZip.trim()) return "ZIP code is required.";
  if (!input.deliveryLandmark.trim()) return "Landmark is required.";
  if (!input.deliveryContact.trim()) return "Active delivery contact number is required.";

  if (options?.requirePayment) {
    if (!input.paymentMethod) return "Select a payment method.";
    if (!(input.amountPaid > 0)) return "Enter the amount paid.";
    if (input.paymentMethod !== "cash" && !input.paymentReferenceNumber.trim()) {
      return "Transaction/reference number is required.";
    }
  }

  if (options?.requireConsent && !input.consentConfirmed) {
    return "Please confirm that the information you provided is accurate and complete.";
  }

  return null;
}

export function sanitizeMembershipDraft(
  input: Partial<MembershipApplicationDraftInput>,
): MembershipApplicationDraftInput {
  return {
    ...emptyMembershipApplicationDraft,
    ...input,
    firstName: input.firstName?.trim() ?? "",
    middleName: input.middleName?.trim() ?? "",
    lastName: input.lastName?.trim() ?? "",
    suffix: input.suffix?.trim() ?? "",
    nationality: input.nationality?.trim() || "Filipino",
    dateOfBirth: input.dateOfBirth?.trim() ?? "",
    placeOfBirth: input.placeOfBirth?.trim() ?? "",
    gender: input.gender?.trim() ?? "",
    facebookUrl: input.facebookUrl?.trim() ?? "",
    contactEmail: input.contactEmail?.trim().toLowerCase() ?? "",
    mobileNumber: input.mobileNumber?.trim() ?? "",
    fightTeam: input.fightTeam?.trim() ?? "",
    martialArtsSystem: input.martialArtsSystem?.trim() ?? "",
    emergencyContactName: input.emergencyContactName?.trim() ?? "",
    emergencyContactRelationship: input.emergencyContactRelationship?.trim() ?? "",
    emergencyContactAddress: input.emergencyContactAddress?.trim() ?? "",
    emergencyContactPhone: input.emergencyContactPhone?.trim() ?? "",
    deliveryRecipientName: input.deliveryRecipientName?.trim() ?? "",
    deliveryAddress: input.deliveryAddress?.trim() ?? "",
    deliveryZip: input.deliveryZip?.trim() ?? "",
    deliveryLandmark: input.deliveryLandmark?.trim() ?? "",
    deliveryContact: input.deliveryContact?.trim() ?? "",
    paymentMethod: (input.paymentMethod ?? "") as MembershipPaymentMethod | "",
    amountPaid: Number(input.amountPaid ?? 0) || 0,
    paymentReferenceNumber: input.paymentReferenceNumber?.trim() ?? "",
    consentConfirmed: Boolean(input.consentConfirmed),
    idempotencyKey: input.idempotencyKey?.trim() || undefined,
  };
}

type ApplicationRow = {
  id: string;
  user_id: string;
  user_email: string;
  status: string;
  application_program: string;
  restriction_code: string;
  full_name: string;
  id_number: string;
  submitted_at: string | null;
  reviewed_at: string | null;
  payload: Json;
  created_at: string;
  updated_at: string;
  application_number?: string | null;
  application_status?: string | null;
  payment_status?: string | null;
  amount_due?: number | null;
  amount_paid?: number | null;
  place_of_birth?: string | null;
  facebook_url?: string | null;
  martial_arts_system?: string | null;
  fight_team?: string | null;
  delivery_recipient_name?: string | null;
  delivery_address?: string | null;
  delivery_zip?: string | null;
  delivery_landmark?: string | null;
  delivery_contact?: string | null;
  courier?: string | null;
  tracking_number?: string | null;
  shipping_date?: string | null;
  delivery_date?: string | null;
  approved_at?: string | null;
  rejected_at?: string | null;
  completed_at?: string | null;
  applicant_visible_notes?: string | null;
  consent_confirmed?: boolean | null;
};

type DocumentRow = {
  id: string;
  application_id: string;
  document_type: string;
  storage_path: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  uploaded_by: string | null;
  verification_status: string;
  rejection_reason: string;
  created_at: string;
};

type PaymentRow = {
  id: string;
  application_id: string;
  payment_method: string;
  amount: number;
  reference_number: string;
  screenshot_document_id: string | null;
  submitted_at: string;
  verification_status: string;
  verified_by: string | null;
  verified_at: string | null;
  rejection_reason: string;
};

type HistoryRow = {
  id: string;
  application_id: string;
  action: string;
  actor_id: string | null;
  actor_email: string;
  notes: string;
  metadata: Json;
  created_at: string;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

export function mapMembershipDocument(row: DocumentRow): MembershipDocumentRecord {
  return {
    id: row.id,
    applicationId: row.application_id,
    documentType: row.document_type as MembershipDocumentType,
    storagePath: row.storage_path,
    originalFilename: row.original_filename,
    mimeType: row.mime_type,
    fileSize: Number(row.file_size) || 0,
    uploadedBy: row.uploaded_by,
    verificationStatus: row.verification_status as MembershipDocumentVerificationStatus,
    rejectionReason: row.rejection_reason ?? "",
    createdAt: row.created_at,
  };
}

export function mapMembershipPayment(row: PaymentRow): MembershipPaymentRecord {
  return {
    id: row.id,
    applicationId: row.application_id,
    paymentMethod: (row.payment_method || "") as MembershipPaymentMethod | "",
    amount: Number(row.amount) || 0,
    referenceNumber: row.reference_number ?? "",
    screenshotDocumentId: row.screenshot_document_id,
    submittedAt: row.submitted_at,
    verificationStatus: row.verification_status as MembershipPaymentStatus,
    verifiedBy: row.verified_by,
    verifiedAt: row.verified_at,
    rejectionReason: row.rejection_reason ?? "",
  };
}

export function mapMembershipHistory(row: HistoryRow): MembershipHistoryRecord {
  const metadata = asRecord(row.metadata);
  return {
    id: row.id,
    applicationId: row.application_id,
    action: row.action,
    actorId: row.actor_id,
    actorEmail: row.actor_email ?? "",
    notes: row.notes ?? "",
    metadata,
    createdAt: row.created_at,
    applicantVisible: Boolean(metadata.applicantVisible),
  };
}

export function mapMembershipApplication(
  row: ApplicationRow,
  extras?: {
    documents?: MembershipDocumentRecord[];
    payments?: MembershipPaymentRecord[];
    history?: MembershipHistoryRecord[];
  },
): MembershipApplicationRecord {
  const payload = asRecord(row.payload);
  const firstName = asString(payload.firstName);
  const middleName = asString(payload.middleName);
  const lastName = asString(payload.lastName);
  const suffix = asString(payload.suffix);

  return {
    id: row.id,
    applicationNumber: row.application_number || asString(payload.applicationNumber) || row.id_number || row.id,
    userId: row.user_id,
    userEmail: row.user_email,
    applicationProgram: row.application_program || "jt1_member",
    applicationTypeId: asString(payload.applicationTypeId, "local_membership"),
    applicationStatus: (row.application_status || "DRAFT") as MembershipApplicationStatus,
    paymentStatus: (row.payment_status || "UNPAID") as MembershipPaymentStatus,
    amountDue: Number(row.amount_due ?? 0) || 0,
    amountPaid: Number(row.amount_paid ?? payload.amountPaid ?? 0) || 0,
    fullName:
      row.full_name ||
      buildMembershipFullName({ firstName, middleName, lastName, suffix }) ||
      asString(payload.fullName),
    firstName,
    middleName,
    lastName,
    suffix,
    nationality: asString(payload.nationality, "Filipino"),
    dateOfBirth: asString(payload.dateOfBirth),
    placeOfBirth: row.place_of_birth || asString(payload.placeOfBirth),
    gender: asString(payload.gender),
    facebookUrl: row.facebook_url || asString(payload.facebookUrl),
    contactEmail: asString(payload.contactEmail, row.user_email),
    mobileNumber: asString(payload.mobileNumber),
    fightTeam: row.fight_team || asString(payload.fightTeam),
    martialArtsSystem: row.martial_arts_system || asString(payload.martialArtsSystem),
    emergencyContactName: asString(payload.emergencyContactName),
    emergencyContactRelationship: asString(payload.emergencyContactRelationship),
    emergencyContactAddress: asString(payload.emergencyContactAddress),
    emergencyContactPhone: asString(payload.emergencyContactPhone),
    deliveryRecipientName: row.delivery_recipient_name || asString(payload.deliveryRecipientName),
    deliveryAddress: row.delivery_address || asString(payload.deliveryAddress),
    deliveryZip: row.delivery_zip || asString(payload.deliveryZip),
    deliveryLandmark: row.delivery_landmark || asString(payload.deliveryLandmark),
    deliveryContact: row.delivery_contact || asString(payload.deliveryContact),
    courier: (row.courier || "") as MembershipCourier,
    trackingNumber: row.tracking_number || "",
    shippingDate: row.shipping_date ?? null,
    deliveryDate: row.delivery_date ?? null,
    applicantVisibleNotes: row.applicant_visible_notes || "",
    consentConfirmed: Boolean(row.consent_confirmed ?? payload.consentConfirmed),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    submittedAt: row.submitted_at ?? null,
    approvedAt: row.approved_at ?? null,
    rejectedAt: row.rejected_at ?? null,
    completedAt: row.completed_at ?? null,
    documents: extras?.documents,
    payments: extras?.payments,
    history: extras?.history,
  };
}

export function buildMembershipPayload(input: MembershipApplicationDraftInput) {
  const fullName = buildMembershipFullName(input);
  return {
    applicationTypeId: input.applicationTypeId || "local_membership",
    firstName: input.firstName,
    middleName: input.middleName,
    lastName: input.lastName,
    suffix: input.suffix,
    nationality: input.nationality,
    dateOfBirth: input.dateOfBirth,
    placeOfBirth: input.placeOfBirth,
    gender: input.gender,
    facebookUrl: input.facebookUrl,
    contactEmail: input.contactEmail,
    mobileNumber: input.mobileNumber,
    fightTeam: input.fightTeam,
    martialArtsSystem: input.martialArtsSystem,
    emergencyContactName: input.emergencyContactName,
    emergencyContactRelationship: input.emergencyContactRelationship,
    emergencyContactAddress: input.emergencyContactAddress,
    emergencyContactPhone: input.emergencyContactPhone,
    deliveryRecipientName: input.deliveryRecipientName,
    deliveryAddress: input.deliveryAddress,
    deliveryZip: input.deliveryZip,
    deliveryLandmark: input.deliveryLandmark,
    deliveryContact: input.deliveryContact,
    paymentMethod: input.paymentMethod,
    amountPaid: input.amountPaid,
    paymentReferenceNumber: input.paymentReferenceNumber,
    consentConfirmed: input.consentConfirmed,
    fullName,
    backgroundAnswers: {
      fightTeam: input.fightTeam,
      martialArtsSystem: input.martialArtsSystem,
    },
  };
}
