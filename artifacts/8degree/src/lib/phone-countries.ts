/**
 * Shared phone country list for flag + dial-code selectors.
 * `ItemText` in dropdowns is flag-only (closed trigger shows emoji only).
 * `countryName` is list-only. `label` is for `textValue` / a11y.
 */
export const PHONE_COUNTRIES = [
  { id: "id", dial: "+62", flag: "🇮🇩", countryName: "Indonesia", label: "Indonesia (+62)" },
  { id: "au", dial: "+61", flag: "🇦🇺", countryName: "Australia", label: "Australia (+61)" },
  { id: "sg", dial: "+65", flag: "🇸🇬", countryName: "Singapore", label: "Singapore (+65)" },
  { id: "my", dial: "+60", flag: "🇲🇾", countryName: "Malaysia", label: "Malaysia (+60)" },
  { id: "us", dial: "+1", flag: "🇺🇸", countryName: "United States", label: "United States (+1)" },
  { id: "gb", dial: "+44", flag: "🇬🇧", countryName: "United Kingdom", label: "United Kingdom (+44)" },
  { id: "nz", dial: "+64", flag: "🇳🇿", countryName: "New Zealand", label: "New Zealand (+64)" },
  { id: "fr", dial: "+33", flag: "🇫🇷", countryName: "France", label: "France (+33)" },
  { id: "de", dial: "+49", flag: "🇩🇪", countryName: "Germany", label: "Germany (+49)" },
  { id: "nl", dial: "+31", flag: "🇳🇱", countryName: "Netherlands", label: "Netherlands (+31)" },
  { id: "other", dial: "", flag: "🌐", countryName: "Other", label: "Other (full international)" },
] as const;

export const PHONE_SELECT_ITEM_CLASS =
  "relative flex w-full cursor-default select-none items-center gap-2 rounded-sm py-2 pl-2 pr-8 text-sm outline-none data-[highlighted]:bg-[#E0FDAC] data-[highlighted]:text-[#1c1917] focus:bg-[#E0FDAC] focus:text-[#1c1917] data-[disabled]:pointer-events-none data-[disabled]:opacity-50";

export function buildInternationalPhone(dial: string, nationalRaw: string): string {
  const nationalDigits = nationalRaw.replace(/\D/g, "").replace(/^0+/, "");
  if (!dial) {
    const digits = nationalRaw.replace(/\D/g, "");
    return digits.startsWith("0") ? `+${digits.replace(/^0+/, "")}` : `+${digits}`;
  }
  return `${dial}${nationalDigits}`;
}
