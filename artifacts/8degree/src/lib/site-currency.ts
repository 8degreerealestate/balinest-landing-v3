import { useEffect, useState } from "react";

/**
 * Site-wide currency selector. Stores the user's choice in localStorage and
 * broadcasts changes via a `site-currency-change` window event so any consumer
 * (e.g. the listing detail page's price card) can update reactively.
 *
 * Rates are indicative only — the Navbar UI already labels USD/AUD/EUR as
 * "indicative only". Update `CURRENCY_RATES` centrally when needed.
 */
export const CURRENCY_STORAGE_KEY = "site.currency";
export const CURRENCY_CHANGE_EVENT = "site-currency-change";

export type SiteCurrency = "USD" | "AUD" | "EUR" | "IDR";

export const CURRENCY_OPTIONS: SiteCurrency[] = ["USD", "AUD", "EUR", "IDR"];

/** Indicative USD→X conversion rates. Treat these as marketing approximations. */
export const CURRENCY_RATES: Record<SiteCurrency, number> = {
  USD: 1,
  AUD: 1.52,
  EUR: 0.92,
  IDR: 16_500,
};

/** Locale used to format each currency. */
const CURRENCY_LOCALES: Record<SiteCurrency, string> = {
  USD: "en-US",
  AUD: "en-AU",
  EUR: "de-DE",
  IDR: "id-ID",
};

export function safeCurrency(value: string | null | undefined): SiteCurrency {
  if (!value) return "USD";
  if (CURRENCY_OPTIONS.includes(value as SiteCurrency)) return value as SiteCurrency;
  return "USD";
}

/**
 * Writes the new currency to localStorage and broadcasts the change so the
 * Navbar (and any other `useSiteCurrency` consumer) updates immediately.
 * No-op outside the browser.
 */
export function setSiteCurrency(next: SiteCurrency): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CURRENCY_STORAGE_KEY, next);
  window.dispatchEvent(new Event(CURRENCY_CHANGE_EVENT));
}

/** Convert a USD amount to the target currency using the indicative rate. */
export function convertFromUsd(amountUsd: number, target: SiteCurrency): number {
  return amountUsd * CURRENCY_RATES[target];
}

/**
 * Format a number into the target currency, no fractional digits.
 * E.g. formatCurrency(2_800_000, "USD") -> "$2,800,000".
 */
export function formatCurrency(amount: number, currency: SiteCurrency): string {
  return new Intl.NumberFormat(CURRENCY_LOCALES[currency], {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Best-effort numeric parser for legacy free-form price strings like
 * "USD 2,800,000" or "$1.4m". Falls back to null if nothing usable is found.
 */
export function parseUsdNumber(text: string | undefined | null): number | null {
  if (!text) return null;
  const cleaned = text.replace(/[^\d.,kKmM]/g, " ").trim();
  if (!cleaned) return null;
  // Handle suffix shortcuts (e.g. "1.4m", "950k").
  const suffix = cleaned.match(/([\d.,]+)\s*([kKmM])\s*$/);
  if (suffix) {
    const base = parseFloat(suffix[1].replace(/,/g, ""));
    if (!Number.isFinite(base)) return null;
    return suffix[2].toLowerCase() === "m" ? base * 1_000_000 : base * 1_000;
  }
  const match = cleaned.match(/[\d.,]+/);
  if (!match) return null;
  const num = parseFloat(match[0].replace(/,/g, ""));
  return Number.isFinite(num) ? num : null;
}

export function useSiteCurrency(defaultCurrency: SiteCurrency = "USD"): SiteCurrency {
  const [currency, setCurrency] = useState<SiteCurrency>(defaultCurrency);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setCurrency(safeCurrency(window.localStorage.getItem(CURRENCY_STORAGE_KEY)));

    const onStorage = (event: StorageEvent) => {
      if (event.key !== CURRENCY_STORAGE_KEY) return;
      setCurrency(safeCurrency(event.newValue));
    };
    const onFocus = () => {
      setCurrency(safeCurrency(window.localStorage.getItem(CURRENCY_STORAGE_KEY)));
    };
    const onCurrencyChange = () => {
      setCurrency(safeCurrency(window.localStorage.getItem(CURRENCY_STORAGE_KEY)));
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    window.addEventListener(CURRENCY_CHANGE_EVENT, onCurrencyChange as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener(CURRENCY_CHANGE_EVENT, onCurrencyChange as EventListener);
    };
  }, []);

  return currency;
}
