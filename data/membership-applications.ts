export type MembershipApplicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "PAYMENT_PENDING"
  | "PAYMENT_VERIFICATION"
  | "DOCUMENT_REVIEW"
  | "ACTION_REQUIRED"
  | "APPROVED"
  | "ID_PROCESSING"
  | "ID_PRINTING"
  | "READY_FOR_DELIVERY"
  | "SHIPPED"
  | "DELIVERED"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED";

export type MembershipPaymentStatus =
  | "UNPAID"
  | "PAYMENT_SUBMITTED"
  | "UNDER_VERIFICATION"
  | "VERIFIED"
  | "REJECTED"
  | "REFUNDED";

export type MembershipDocumentType =
  | "VALID_ID"
  | "PHOTO_1X1"
  | "E_SIGNATURE"
  | "PAYMENT_SCREENSHOT"
  | "ADDITIONAL_DOCUMENT";

export type MembershipDocumentVerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";

export type MembershipPaymentMethod = "gcash" | "maya" | "qrph" | "cash";

export type MembershipCourier = "Lalamove" | "J&T Express" | "LBC" | "DHL" | "Other" | "";

export const membershipApplicationStatusLabels: Record<MembershipApplicationStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  PAYMENT_PENDING: "Payment Pending",
  PAYMENT_VERIFICATION: "Payment Verification",
  DOCUMENT_REVIEW: "Document Review",
  ACTION_REQUIRED: "Action Required",
  APPROVED: "Approved",
  ID_PROCESSING: "ID Processing",
  ID_PRINTING: "ID Printing",
  READY_FOR_DELIVERY: "Ready for Delivery",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
};

export const membershipPaymentStatusLabels: Record<MembershipPaymentStatus, string> = {
  UNPAID: "Unpaid",
  PAYMENT_SUBMITTED: "Payment Submitted",
  UNDER_VERIFICATION: "Under Verification",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
  REFUNDED: "Refunded",
};

export const membershipDocumentTypeLabels: Record<MembershipDocumentType, string> = {
  VALID_ID: "Valid Government ID",
  PHOTO_1X1: "1×1 Picture",
  E_SIGNATURE: "E-signature",
  PAYMENT_SCREENSHOT: "Payment Screenshot",
  ADDITIONAL_DOCUMENT: "Additional Document",
};

export const membershipPaymentMethodLabels: Record<MembershipPaymentMethod, string> = {
  gcash: "GCash",
  maya: "Maya",
  qrph: "QR PH / InstaPay",
  cash: "Cash",
};

export const membershipCourierOptions: Exclude<MembershipCourier, "">[] = [
  "Lalamove",
  "J&T Express",
  "LBC",
  "DHL",
  "Other",
];

export const membershipPaymentRejectionReasons = [
  "Payment could not be located",
  "Incorrect amount",
  "Screenshot unclear",
  "Invalid transaction reference",
  "Other",
] as const;

export const GCASH_PAYMENT_NUMBER = "09923040694";
export const GCASH_QR_SRC = "/assets/payments/gcash-qr.jpg";
export const MAYA_QR_SRC = "/assets/payments/maya-qr.jpg";

export const MEMBERSHIP_REQUIRED_DOCUMENTS: MembershipDocumentType[] = [
  "VALID_ID",
  "PHOTO_1X1",
  "E_SIGNATURE",
];

export const MEMBERSHIP_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
] as const;

export const MEMBERSHIP_MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export type MembershipApplicationTypeConfig = {
  id: string;
  program: "jt1_member" | string;
  title: string;
  shortDescription: string;
  eligibility?: string;
  requirements: string[];
  fee?: string | null;
  validity?: string | null;
  benefits?: string[];
  applicationHref: string;
};

/** Configurable application types. Fee/validity/benefits left unset until provided. */
export const membershipApplicationTypes: MembershipApplicationTypeConfig[] = [
  {
    id: "local_membership",
    program: "jt1_member",
    title: "Local Membership",
    shortDescription:
      "Apply for Juego Todo local membership through the official online application system. Submit your information, required documents, and payment proof for administrative verification.",
    requirements: [
      "Complete legal name and personal information",
      "Fight team or gym and martial arts system",
      "Emergency contact details",
      "Valid government ID, 1×1 picture, and e-signature",
      "Delivery details for physical ID where applicable",
      "Payment proof for admin verification",
    ],
    fee: null,
    validity: null,
    benefits: undefined,
    applicationHref: "/membership/apply/local-membership",
  },
];

export type MembershipApplicationDraftInput = {
  applicationTypeId?: string;
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  nationality: string;
  dateOfBirth: string;
  placeOfBirth: string;
  gender: string;
  facebookUrl: string;
  contactEmail: string;
  mobileNumber: string;
  fightTeam: string;
  martialArtsSystem: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactAddress: string;
  emergencyContactPhone: string;
  deliveryRecipientName: string;
  deliveryAddress: string;
  deliveryZip: string;
  deliveryLandmark: string;
  deliveryContact: string;
  paymentMethod: MembershipPaymentMethod | "";
  amountPaid: number;
  paymentReferenceNumber: string;
  consentConfirmed: boolean;
  idempotencyKey?: string;
};

export const emptyMembershipApplicationDraft: MembershipApplicationDraftInput = {
  applicationTypeId: "local_membership",
  firstName: "",
  middleName: "",
  lastName: "",
  suffix: "",
  nationality: "Filipino",
  dateOfBirth: "",
  placeOfBirth: "",
  gender: "",
  facebookUrl: "",
  contactEmail: "",
  mobileNumber: "",
  fightTeam: "",
  martialArtsSystem: "",
  emergencyContactName: "",
  emergencyContactRelationship: "",
  emergencyContactAddress: "",
  emergencyContactPhone: "",
  deliveryRecipientName: "",
  deliveryAddress: "",
  deliveryZip: "",
  deliveryLandmark: "",
  deliveryContact: "",
  paymentMethod: "",
  amountPaid: 0,
  paymentReferenceNumber: "",
  consentConfirmed: false,
};

export type MembershipDocumentRecord = {
  id: string;
  applicationId: string;
  documentType: MembershipDocumentType;
  storagePath: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  uploadedBy: string | null;
  verificationStatus: MembershipDocumentVerificationStatus;
  rejectionReason: string;
  createdAt: string;
};

export type MembershipPaymentRecord = {
  id: string;
  applicationId: string;
  paymentMethod: MembershipPaymentMethod | "";
  amount: number;
  referenceNumber: string;
  screenshotDocumentId: string | null;
  submittedAt: string;
  verificationStatus: MembershipPaymentStatus;
  verifiedBy: string | null;
  verifiedAt: string | null;
  rejectionReason: string;
};

export type MembershipHistoryRecord = {
  id: string;
  applicationId: string;
  action: string;
  actorId: string | null;
  actorEmail: string;
  notes: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  applicantVisible?: boolean;
};

export type MembershipApplicationRecord = {
  id: string;
  applicationNumber: string;
  userId: string;
  userEmail: string;
  applicationProgram: string;
  applicationTypeId: string;
  applicationStatus: MembershipApplicationStatus;
  paymentStatus: MembershipPaymentStatus;
  amountDue: number;
  amountPaid: number;
  fullName: string;
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  nationality: string;
  dateOfBirth: string;
  placeOfBirth: string;
  gender: string;
  facebookUrl: string;
  contactEmail: string;
  mobileNumber: string;
  fightTeam: string;
  martialArtsSystem: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactAddress: string;
  emergencyContactPhone: string;
  deliveryRecipientName: string;
  deliveryAddress: string;
  deliveryZip: string;
  deliveryLandmark: string;
  deliveryContact: string;
  courier: MembershipCourier;
  trackingNumber: string;
  shippingDate: string | null;
  deliveryDate: string | null;
  applicantVisibleNotes: string;
  consentConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  completedAt: string | null;
  documents?: MembershipDocumentRecord[];
  payments?: MembershipPaymentRecord[];
  history?: MembershipHistoryRecord[];
};

export const membershipApplicantTimelineSteps: {
  status: MembershipApplicationStatus;
  label: string;
}[] = [
  { status: "SUBMITTED", label: "Application Submitted" },
  { status: "PAYMENT_VERIFICATION", label: "Payment Verification" },
  { status: "DOCUMENT_REVIEW", label: "Application Review" },
  { status: "APPROVED", label: "Approved" },
  { status: "ID_PROCESSING", label: "ID Processing" },
  { status: "ID_PRINTING", label: "Printing" },
  { status: "SHIPPED", label: "Shipping" },
  { status: "DELIVERED", label: "Delivered" },
];

export function buildMembershipFullName(input: {
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
}) {
  const name = [input.firstName, input.middleName, input.lastName].filter(Boolean).join(" ").trim();
  return input.suffix ? `${name}, ${input.suffix}`.trim() : name;
}

export function isMembershipApplicationStatus(value: string): value is MembershipApplicationStatus {
  return value in membershipApplicationStatusLabels;
}

export function isMembershipPaymentStatus(value: string): value is MembershipPaymentStatus {
  return value in membershipPaymentStatusLabels;
}
