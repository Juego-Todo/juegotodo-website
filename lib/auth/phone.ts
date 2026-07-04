import { findRegistrationCountry, type RegistrationCountry } from "@/data/countries";

export function normalizeLocalPhoneDigits(countryName: string, value: string) {
  let digits = value.replace(/\D/g, "");

  if (countryName === "Philippines" && digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  if (countryName === "Philippines" && digits.startsWith("63")) {
    digits = digits.slice(2);
  }

  return digits;
}

export function buildRegistrationPhone(countryName: string, localValue: string) {
  const country = findRegistrationCountry(countryName);
  const localDigits = normalizeLocalPhoneDigits(countryName, localValue);

  if (!localDigits) {
    return "";
  }

  return `${country.dialCode}${localDigits}`;
}

export function validateRegistrationPhone(countryName: string, localValue: string) {
  const trimmed = localValue.trim();

  if (!trimmed) {
    return "";
  }

  const country = findRegistrationCountry(countryName);
  const localDigits = normalizeLocalPhoneDigits(countryName, trimmed);

  if (localDigits.length < 7 || localDigits.length > 12) {
    throw new Error(`Enter a valid ${country.name} mobile number.`);
  }

  return buildRegistrationPhone(countryName, trimmed);
}

export function getPhoneDialCode(countryName: string) {
  return findRegistrationCountry(countryName).dialCode;
}

export function getPhonePlaceholder(countryName: string) {
  return findRegistrationCountry(countryName).placeholder;
}

export type { RegistrationCountry };
