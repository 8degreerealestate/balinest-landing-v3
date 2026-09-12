/** Public contact channels — set via Vite env at build time (see root `.env.example`). */

const DEFAULT_WHATSAPP_URL = "https://wa.link/hpmtve";
/** WhatsApp display / wa.me digits (matches wa.link/hpmtve). */
const DEFAULT_WHATSAPP_E164 = "6287746615888";
const DEFAULT_WHATSAPP_DISPLAY = "+62 877-4661-5888";
/** Office / voice line (separate from WhatsApp). */
const DEFAULT_PHONE_E164 = "6287846619888";
const DEFAULT_PHONE_DISPLAY = "+62 878-4661-9888";
/** Ignore stale values still set in Vercel env. */
const LEGACY_WHATSAPP_E164 = new Set([
  "6287846616888",
  "6287787169089",
  "6287846621888",
]);
const DEFAULT_CONTACT_EMAIL = "concierge@8degree.co";

export const OFFICE_ADDRESS =
  "Teratai S18, Jl. Kayu Tulang, Canggu, Kec. Kuta Utara, Kabupaten Badung, Bali 80361";

export function getOfficeMapsUrl(): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(OFFICE_ADDRESS)}`;
}

/** Digits only, suitable for `https://wa.me/{e164}` (no +). */
export function getWhatsappE164(): string {
  const raw = import.meta.env.VITE_WHATSAPP_NUMBER_E164?.trim();
  if (!raw) return DEFAULT_WHATSAPP_E164;
  const digits = raw.replace(/\D/g, "");
  if (!digits || LEGACY_WHATSAPP_E164.has(digits)) return DEFAULT_WHATSAPP_E164;
  return digits;
}

export function getContactEmail(): string {
  const raw = import.meta.env.VITE_CONTACT_EMAIL?.trim();
  if (!raw || raw === "hello@8degree.com") return DEFAULT_CONTACT_EMAIL;
  return raw;
}

/** Human-readable display for an E.164 digit string. */
export function formatContactPhoneDisplay(e164Digits: string): string {
  const d = e164Digits.replace(/\D/g, "");
  if (d === DEFAULT_WHATSAPP_E164) return DEFAULT_WHATSAPP_DISPLAY;
  if (d === DEFAULT_PHONE_E164) return DEFAULT_PHONE_DISPLAY;
  if (d.startsWith("62") && d.length >= 11) {
    const local = d.slice(2);
    // +62 XXX-XXXX-XXXX style for Indonesian mobiles
    if (local.length >= 10) {
      return `+62 ${local.slice(0, 3)}-${local.slice(3, 7)}-${local.slice(7)}`.trim();
    }
    return `+62 ${local.slice(0, 3)} ${local.slice(3, 7)} ${local.slice(7)}`.trim();
  }
  if (d.startsWith("62")) return `+${d}`;
  return d ? `+${d}` : "";
}

/** Office phone number shown on the contact page (not WhatsApp). */
export function getContactPhoneDisplay(): string {
  return DEFAULT_PHONE_DISPLAY;
}

export function getContactPhoneTelHref(): string {
  return `tel:+${DEFAULT_PHONE_E164}`;
}

/** WhatsApp number shown next to the WhatsApp channel. */
export function getWhatsappDisplay(): string {
  return formatContactPhoneDisplay(getWhatsappE164());
}

export function getWhatsappUrl(): string {
  return import.meta.env.VITE_WHATSAPP_URL?.trim() || DEFAULT_WHATSAPP_URL;
}

export function buildWhatsappUrl(_message?: string): string {
  return getWhatsappUrl();
}
