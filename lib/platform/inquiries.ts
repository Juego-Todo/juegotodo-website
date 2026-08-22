export type InquiryType = "partnership" | "contact" | "seminar";

export type InquiryInput = {
  inquiryType: InquiryType;
  fullName: string;
  email: string;
  phone?: string;
  organization?: string;
  subject?: string;
  message: string;
  metadata?: Record<string, unknown>;
};

export function validateInquiry(input: InquiryInput) {
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

export type InquiryRecord = InquiryInput & {
  id: string;
  status: "new" | "reviewed" | "closed";
  createdAt: string;
};

const LOCAL_KEY = "juego-todo.platform.inquiries";

function readLocal(): InquiryRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as InquiryRecord[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(records: InquiryRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_KEY, JSON.stringify(records));
}

export function createInquiryLocal(input: InquiryInput): InquiryRecord {
  const record: InquiryRecord = {
    ...input,
    id: crypto.randomUUID(),
    status: "new",
    createdAt: new Date().toISOString(),
  };
  writeLocal([record, ...readLocal()]);
  return record;
}

export function listInquiriesLocal(type?: InquiryType) {
  const records = readLocal();
  return type ? records.filter((entry) => entry.inquiryType === type) : records;
}
