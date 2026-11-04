export const FIGHT_CATEGORIES = [
  { value: "minor", label: "Minor" },
  { value: "female", label: "Female" },
  { value: "amateur", label: "Amateur" },
  { value: "pro", label: "Pro" },
] as const;

export function formatRecord(wins: number, losses: number, draws: number) {
  return `${wins}-${losses}-${draws}`;
}

export function formatCardDate(value: string | null) {
  if (!value) return "Date TBA";
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatCategory(value: string) {
  const match = FIGHT_CATEGORIES.find((category) => category.value === value);
  if (match) return match.label;
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatResult(value: string) {
  if (value === "no_contest") return "No contest";
  if (!value) return "Result pending";
  return value.charAt(0).toUpperCase() + value.slice(1);
}
