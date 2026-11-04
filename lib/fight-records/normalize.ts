export function isBlankish(value: unknown): boolean {
  if (value == null) return true;
  const text = String(value).trim();
  if (!text) return true;
  const upper = text.toUpperCase();
  return upper === "N/A" || upper === "NA" || upper === "NONE" || upper === "-" || upper === "—";
}

export function cleanText(value: unknown): string {
  if (isBlankish(value)) return "";
  return String(value).replace(/\s+/g, " ").trim();
}

export function titleCaseName(value: string): string {
  return value
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** Drop middle initials like "O." / "M" for fuzzy matching. */
export function normalizePersonName(firstName: string, lastName: string): string {
  const firstTokens = cleanText(firstName)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s.]/gu, " ")
    .split(/\s+/)
    .filter((token) => token && !/^\p{L}\.?$/u.test(token));

  const last = cleanText(lastName)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean)
    .join(" ");

  return `${firstTokens.join(" ")} ${last}`.trim();
}

export function slugifyFighter(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function normalizeGym(value: string): string {
  return cleanText(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const MONTH_INDEX: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

/** Calendar date as YYYY-MM-DD, rejecting overflow like Feb 31. */
function formatUtcDate(year: number, monthIndex: number, day: number): string | null {
  if (!Number.isInteger(year) || !Number.isInteger(monthIndex) || !Number.isInteger(day)) return null;
  if (monthIndex < 0 || monthIndex > 11 || day < 1 || day > 31) return null;
  const parsed = new Date(Date.UTC(year, monthIndex, day));
  if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== monthIndex || parsed.getUTCDate() !== day) {
    return null;
  }
  const month = String(monthIndex + 1).padStart(2, "0");
  const dayText = String(day).padStart(2, "0");
  return `${year}-${month}-${dayText}`;
}

export function parseFlexibleDate(value: unknown): string | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    // Excel serial date
    const epoch = Date.UTC(1899, 11, 30);
    const ms = epoch + Math.round(value) * 86400000;
    return new Date(ms).toISOString().slice(0, 10);
  }
  const text = cleanText(value);
  if (!text) return null;

  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return formatUtcDate(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));

  const monthName = text.match(/^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/);
  if (monthName) {
    const month = MONTH_INDEX[monthName[1].toLowerCase()];
    if (month == null) return null;
    return formatUtcDate(Number(monthName[3]), month, Number(monthName[2]));
  }

  const slash = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (slash) {
    let year = Number(slash[3]);
    if (year < 100) year += year >= 70 ? 1900 : 2000;
    return formatUtcDate(year, Number(slash[1]) - 1, Number(slash[2]));
  }

  const fallback = new Date(text);
  if (Number.isNaN(fallback.getTime())) return null;
  return formatUtcDate(fallback.getFullYear(), fallback.getMonth(), fallback.getDate());
}

export function isMinorDob(dateOfBirth: string | null, asOf = new Date()): boolean {
  if (!dateOfBirth) return false;
  const birth = new Date(`${dateOfBirth}T00:00:00Z`);
  if (Number.isNaN(birth.getTime())) return false;
  const eighteenth = new Date(birth);
  eighteenth.setUTCFullYear(eighteenth.getUTCFullYear() + 18);
  return asOf < eighteenth;
}

export function detectCategory(header: string): "minor" | "female" | "amateur" | "pro" | "" {
  const upper = header.toUpperCase();
  if (upper.includes("MINOR")) return "minor";
  if (upper.includes("FEMALE") || upper.includes("WOMEN")) return "female";
  if (upper.includes("PRO ")) return "pro";
  if (upper.includes("AMATEUR")) return "amateur";
  return "";
}
