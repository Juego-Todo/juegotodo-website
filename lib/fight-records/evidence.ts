export const CLAIM_EVIDENCE_BUCKET = "fighter-claim-evidence";
export const GUARDIAN_PROOF_BUCKET = "fighter-guardian-proof";
export const EVIDENCE_MAX_BYTES = 5 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);

export function validateEvidenceFile(file: File) {
  if (file.size <= 0 || file.size > EVIDENCE_MAX_BYTES) {
    return "File must be between 1 byte and 5MB.";
  }
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return "Only JPG, PNG, WEBP, and PDF files are allowed.";
  }
  return "";
}
