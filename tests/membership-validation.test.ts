/**
 * Focused membership validation tests that mirror lib/membership/validation.ts
 * without relying on Next.js path aliases (Node test runner).
 */
import assert from "node:assert/strict";
import test from "node:test";

type Draft = {
  firstName: string;
  lastName: string;
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
  paymentMethod: string;
  amountPaid: number;
  paymentReferenceNumber: string;
  consentConfirmed: boolean;
};

function sanitize(input: Partial<Draft>): Draft {
  return {
    firstName: input.firstName?.trim() ?? "",
    lastName: input.lastName?.trim() ?? "",
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
    paymentMethod: input.paymentMethod ?? "",
    amountPaid: Number(input.amountPaid ?? 0) || 0,
    paymentReferenceNumber: input.paymentReferenceNumber?.trim() ?? "",
    consentConfirmed: Boolean(input.consentConfirmed),
  };
}

function validate(input: Draft, options?: { requirePayment?: boolean; requireConsent?: boolean }) {
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

const completeBase: Draft = {
  firstName: "Juan",
  lastName: "Dela Cruz",
  nationality: "Filipino",
  dateOfBirth: "1990-01-01",
  placeOfBirth: "Manila",
  gender: "Male",
  facebookUrl: "https://facebook.com/juan",
  contactEmail: "juan@example.com",
  mobileNumber: "09171234567",
  fightTeam: "Team JT",
  martialArtsSystem: "Arnis",
  emergencyContactName: "Maria Dela Cruz",
  emergencyContactRelationship: "Spouse",
  emergencyContactAddress: "Quezon City",
  emergencyContactPhone: "09180001111",
  deliveryRecipientName: "Juan Dela Cruz",
  deliveryAddress: "123 Main St, Quezon City",
  deliveryZip: "1100",
  deliveryLandmark: "Near park",
  deliveryContact: "09171234567",
  paymentMethod: "gcash",
  amountPaid: 0,
  paymentReferenceNumber: "",
  consentConfirmed: true,
};

test("validate requires core fields", () => {
  assert.equal(validate(sanitize({})), "First name is required.");
});

test("validate payment rules", () => {
  const draft = sanitize(completeBase);
  assert.equal(validate(draft, { requirePayment: true, requireConsent: true }), "Enter the amount paid.");
  draft.amountPaid = 500;
  assert.equal(
    validate(draft, { requirePayment: true, requireConsent: true }),
    "Transaction/reference number is required.",
  );
  draft.paymentReferenceNumber = "GCASH-123";
  assert.equal(validate(draft, { requirePayment: true, requireConsent: true }), null);
});

test("cash skips reference requirement", () => {
  const draft = sanitize({ ...completeBase, paymentMethod: "cash", amountPaid: 500 });
  assert.equal(validate(draft, { requirePayment: true, requireConsent: true }), null);
});

test("sanitize trims and defaults", () => {
  const draft = sanitize({
    firstName: "  Ana  ",
    lastName: " Reyes ",
    contactEmail: "Ana@Example.COM ",
    amountPaid: "250" as unknown as number,
  });
  assert.equal(draft.firstName, "Ana");
  assert.equal(draft.lastName, "Reyes");
  assert.equal(draft.contactEmail, "ana@example.com");
  assert.equal(draft.nationality, "Filipino");
  assert.equal(draft.amountPaid, 250);
});
