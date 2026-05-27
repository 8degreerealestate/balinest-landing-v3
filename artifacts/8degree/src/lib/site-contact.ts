/** Public contact channels — set via Vite env at build time (see root `.env.example`). */

const DEFAULT_WHATSAPP_E164 = "6287787169089";
const DEFAULT_CONTACT_EMAIL = "hello@8degree.com";
const DEFAULT_CONTACT_PHONE_DISPLAY = "+62 877 8716 9089";

/** Digits only, suitable for `https://wa.me/{e164}` (no +). */
export function getWhatsappE164(): string {
  const raw = import.meta.env.VITE_WHATSAPP_NUMBER_E164?.trim();
  if (!raw) return DEFAULT_WHATSAPP_E164;
  const digits = raw.replace(/\D/g, "");
  return digits || DEFAULT_WHATSAPP_E164;
}

export function getContactEmail(): string {
  return import.meta.env.VITE_CONTACT_EMAIL?.trim() || DEFAULT_CONTACT_EMAIL;
}

export function getContactPhoneDisplay(): string {
  return import.meta.env.VITE_CONTACT_PHONE_DISPLAY?.trim() || DEFAULT_CONTACT_PHONE_DISPLAY;
}

export function buildWhatsappUrl(message?: string): string {
  const base = `https://wa.me/${getWhatsappE164()}`;
  if (!message?.trim()) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}
