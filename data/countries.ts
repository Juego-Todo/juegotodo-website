export type RegistrationCountry = {
  name: string;
  dialCode: string;
  placeholder: string;
};

export const registrationCountries: RegistrationCountry[] = [
  { name: "Philippines", dialCode: "+63", placeholder: "917 123 4567" },
  { name: "United States", dialCode: "+1", placeholder: "555 123 4567" },
  { name: "Canada", dialCode: "+1", placeholder: "416 555 1234" },
  { name: "Australia", dialCode: "+61", placeholder: "412 345 678" },
  { name: "United Kingdom", dialCode: "+44", placeholder: "7700 900123" },
  { name: "United Arab Emirates", dialCode: "+971", placeholder: "50 123 4567" },
  { name: "Saudi Arabia", dialCode: "+966", placeholder: "50 123 4567" },
  { name: "Singapore", dialCode: "+65", placeholder: "8123 4567" },
  { name: "Malaysia", dialCode: "+60", placeholder: "12 345 6789" },
  { name: "Indonesia", dialCode: "+62", placeholder: "812 3456 7890" },
  { name: "Thailand", dialCode: "+66", placeholder: "81 234 5678" },
  { name: "Vietnam", dialCode: "+84", placeholder: "91 234 56 78" },
  { name: "Japan", dialCode: "+81", placeholder: "90 1234 5678" },
  { name: "South Korea", dialCode: "+82", placeholder: "10 1234 5678" },
  { name: "China", dialCode: "+86", placeholder: "131 2345 6789" },
  { name: "Hong Kong", dialCode: "+852", placeholder: "5123 4567" },
  { name: "Taiwan", dialCode: "+886", placeholder: "912 345 678" },
  { name: "India", dialCode: "+91", placeholder: "98765 43210" },
  { name: "Germany", dialCode: "+49", placeholder: "1512 3456789" },
  { name: "France", dialCode: "+33", placeholder: "6 12 34 56 78" },
  { name: "Italy", dialCode: "+39", placeholder: "312 345 6789" },
  { name: "Spain", dialCode: "+34", placeholder: "612 34 56 78" },
  { name: "Netherlands", dialCode: "+31", placeholder: "6 12345678" },
  { name: "Switzerland", dialCode: "+41", placeholder: "78 123 45 67" },
  { name: "Sweden", dialCode: "+46", placeholder: "70 123 45 67" },
  { name: "Norway", dialCode: "+47", placeholder: "412 34 567" },
  { name: "Brazil", dialCode: "+55", placeholder: "11 91234 5678" },
  { name: "Mexico", dialCode: "+52", placeholder: "55 1234 5678" },
  { name: "Qatar", dialCode: "+974", placeholder: "3312 3456" },
  { name: "Kuwait", dialCode: "+965", placeholder: "5000 1234" },
  { name: "Bahrain", dialCode: "+973", placeholder: "3600 1234" },
  { name: "Oman", dialCode: "+968", placeholder: "9212 3456" },
  { name: "New Zealand", dialCode: "+64", placeholder: "21 123 4567" },
  { name: "Guam", dialCode: "+1", placeholder: "671 300 1234" },
];

export const defaultRegistrationCountry = registrationCountries[0];

export function findRegistrationCountry(name: string) {
  return registrationCountries.find((country) => country.name === name) ?? defaultRegistrationCountry;
}

export const registrationCountryNames = registrationCountries.map((country) => country.name);
