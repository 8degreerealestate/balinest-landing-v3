/** Public contact channels — set via Vite env at build time (see root `.env.example`). */

const DEFAULT_WHATSAPP_URL = "https://wa.link/paxsz0";
const DEFAULT_WHATSAPP_E164 = "6287787169089";
const DEFAULT_CONTACT_EMAIL = "hello@8degree.com";

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
  return digits || DEFAULT_WHATSAPP_E164;
}

export function getContactEmail(): string {
  return import.meta.env.VITE_CONTACT_EMAIL?.trim() || DEFAULT_CONTACT_EMAIL;
}

/** Human-readable display for phone / WhatsApp (kept in sync with {@link getWhatsappE164}). */
export function formatContactPhoneDisplay(e164Digits: string): string {
  const d = e164Digits.replace(/\D/g, "");
  if (d.startsWith("62") && d.length >= 11) {
    const local = d.slice(2);
    return `+62 ${local.slice(0, 3)} ${local.slice(3, 7)} ${local.slice(7)}`.trim();
  }
  if (d.startsWith("62")) return `+${d}`;
  return d ? `+${d}` : "";
}

export function getContactPhoneDisplay(): string {
  const e164 = getWhatsappE164();
  const fromEnv = import.meta.env.VITE_CONTACT_PHONE_DISPLAY?.trim();
  if (fromEnv) {
    const envDigits = fromEnv.replace(/\D/g, "");
    if (envDigits === e164) return fromEnv;
  }
  return formatContactPhoneDisplay(e164);
}

export function buildWhatsappUrl(message?: string): string {
  const custom = import.meta.env.VITE_WHATSAPP_URL?.trim();
  const base = custom || DEFAULT_WHATSAPP_URL;
  if (base.includes("wa.link") || !message?.trim()) return base;
  const waMe = `https://wa.me/${getWhatsappE164()}`;
  return `${waMe}?text=${encodeURIComponent(message)}`;
}
