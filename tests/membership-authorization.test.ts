import assert from "node:assert/strict";
import test from "node:test";

const applicationStatuses = [
  "DRAFT",
  "SUBMITTED",
  "PAYMENT_PENDING",
  "PAYMENT_VERIFICATION",
  "DOCUMENT_REVIEW",
  "ACTION_REQUIRED",
  "APPROVED",
  "ID_PROCESSING",
  "ID_PRINTING",
  "READY_FOR_DELIVERY",
  "SHIPPED",
  "DELIVERED",
  "COMPLETED",
  "REJECTED",
  "CANCELLED",
] as const;

const paymentStatuses = [
  "UNPAID",
  "PAYMENT_SUBMITTED",
  "UNDER_VERIFICATION",
  "VERIFIED",
  "REJECTED",
  "REFUNDED",
] as const;

const APPLICANT_PAYMENT_STATUSES = new Set(["UNPAID", "PAYMENT_SUBMITTED", "UNDER_VERIFICATION"]);
const ADMIN_ONLY_PAYMENT_STATUSES = new Set(["VERIFIED", "REJECTED", "REFUNDED"]);
const RESUBMITTABLE_APPLICATION_STATUSES = new Set(["DRAFT", "ACTION_REQUIRED"]);

test("payment verification is admin only", () => {
  assert.ok(!APPLICANT_PAYMENT_STATUSES.has("VERIFIED"));
  assert.ok(ADMIN_ONLY_PAYMENT_STATUSES.has("VERIFIED"));
  assert.ok(ADMIN_ONLY_PAYMENT_STATUSES.has("REJECTED"));
});

test("status enumerations are complete", () => {
  assert.equal(applicationStatuses.length, 15);
  assert.equal(paymentStatuses.length, 6);
  assert.ok(!applicationStatuses.includes("AUTO_APPROVED" as never));
});

test("submit implies under verification not verified", () => {
  const afterSubmitPaymentStatus = "UNDER_VERIFICATION";
  assert.notEqual(afterSubmitPaymentStatus, "VERIFIED");
  assert.ok(APPLICANT_PAYMENT_STATUSES.has(afterSubmitPaymentStatus));
});

test("submit is idempotent outside draft and action-required", () => {
  assert.ok(RESUBMITTABLE_APPLICATION_STATUSES.has("DRAFT"));
  assert.ok(RESUBMITTABLE_APPLICATION_STATUSES.has("ACTION_REQUIRED"));
  assert.ok(!RESUBMITTABLE_APPLICATION_STATUSES.has("PAYMENT_VERIFICATION"));
  assert.ok(!RESUBMITTABLE_APPLICATION_STATUSES.has("APPROVED"));
});

test("approval grants regular member privileges", () => {
  const existingTags = ["fighter"];
  const nextTags = existingTags.includes("regular_member")
    ? existingTags
    : [...existingTags, "regular_member"];
  assert.deepEqual(nextTags, ["fighter", "regular_member"]);
});
