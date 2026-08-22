import assert from "node:assert/strict";
import test from "node:test";

type InquiryInput = {
  inquiryType: "partnership" | "contact" | "seminar";
  fullName: string;
  email: string;
  message: string;
};

function validateInquiry(input: InquiryInput) {
  const errors: string[] = [];
  if (!input.fullName.trim()) errors.push("Full name is required.");
  if (!input.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    errors.push("A valid email is required.");
  }
  if (!input.message.trim() || input.message.trim().length < 10) {
    errors.push("Message must be at least 10 characters.");
  }
  return errors;
}

test("validateInquiry requires core fields", () => {
  const errors = validateInquiry({
    inquiryType: "contact",
    fullName: "",
    email: "bad",
    message: "short",
  });

  assert.ok(errors.length >= 3);
});

test("validateInquiry accepts valid payload", () => {
  const errors = validateInquiry({
    inquiryType: "partnership",
    fullName: "Juan Dela Cruz",
    email: "juan@example.com",
    message: "We would like to partner with Juego Todo for broadcast coverage.",
  });

  assert.equal(errors.length, 0);
});
