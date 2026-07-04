export function buildFullName(input: {
  firstName: string;
  middleName?: string;
  lastName: string;
}) {
  return [input.firstName, input.middleName, input.lastName].filter(Boolean).join(" ").trim();
}

export const registerGenderOptions = ["Male", "Female", "Prefer not to say"] as const;

export function validateDateOfBirth(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error("Date of birth is required.");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    throw new Error("Enter a valid date of birth.");
  }

  const parsed = new Date(`${trimmed}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Enter a valid date of birth.");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (parsed > today) {
    throw new Error("Date of birth cannot be in the future.");
  }

  const minimumAgeDate = new Date(today);
  minimumAgeDate.setFullYear(minimumAgeDate.getFullYear() - 13);
  if (parsed > minimumAgeDate) {
    throw new Error("You must be at least 13 years old to register.");
  }

  const oldestAllowed = new Date(today);
  oldestAllowed.setFullYear(oldestAllowed.getFullYear() - 120);
  if (parsed < oldestAllowed) {
    throw new Error("Enter a valid date of birth.");
  }

  return trimmed;
}

export function getLatestAllowedBirthDate(minimumAge = 13) {
  const date = new Date();
  date.setFullYear(date.getFullYear() - minimumAge);
  return date.toISOString().slice(0, 10);
}

export function getEarliestAllowedBirthDate(maximumAge = 120) {
  const date = new Date();
  date.setFullYear(date.getFullYear() - maximumAge);
  return date.toISOString().slice(0, 10);
}
