/**
 * Shared phone country list for flag + dial-code selectors.
 * `ItemText` in dropdowns is flag-only (closed trigger shows emoji only).
 * `countryName` is list-only. `label` is for `textValue` / a11y.
 */
import { PHONE_COUNTRIES_DATA, type PhoneCountry } from "./phone-countries-data.generated";

export type { PhoneCountry };

export const DEFAULT_PHONE_COUNTRY_ID = "id";

export const PHONE_COUNTRIES: readonly PhoneCountry[] = PHONE_COUNTRIES_DATA;

export const PHONE_SELECT_ITEM_CLASS =
  "relative flex w-full cursor-default select-none items-center gap-2 rounded-sm py-2 pl-2 pr-8 text-sm outline-none data-[highlighted]:bg-[#E0FDAC] data-[highlighted]:text-[#1c1917] focus:bg-[#E0FDAC] focus:text-[#1c1917] data-[disabled]:pointer-events-none data-[disabled]:opacity-50";

export function findPhoneCountry(countryId: string | undefined): PhoneCountry {
  if (countryId) {
    const hit = PHONE_COUNTRIES.find((c) => c.id === countryId);
    if (hit) return hit;
  }
  return PHONE_COUNTRIES[0];
}

/** Example national number (without country code) for the selected country. */
export function phoneNationalPlaceholder(countryId: string): string {
  switch (countryId) {
    case "id":
      return "0812-345-678";
    case "au":
      return "0412-345-678";
    case "us":
    case "ca":
      return "(555) 555-5555";
    case "gb":
      return "07123 456789";
    case "sg":
      return "9123 4567";
    case "my":
      return "012-345 6789";
    case "nz":
      return "021 123 4567";
    case "fr":
    case "de":
      return "0612345678";
    default:
      return "812 345 6789";
  }
}

export function buildInternationalPhone(dial: string, nationalRaw: string): string {
  const nationalDigits = nationalRaw.replace(/\D/g, "").replace(/^0+/, "");
  if (!dial) {
    const digits = nationalRaw.replace(/\D/g, "");
    return digits.startsWith("0") ? `+${digits.replace(/^0+/, "")}` : `+${digits}`;
  }
  return `${dial}${nationalDigits}`;
}
