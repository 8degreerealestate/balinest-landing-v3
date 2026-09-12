import { useEffect, useState } from "react";

/**
 * Site-wide currency selector. Stores the user's choice in localStorage and
 * broadcasts changes via a `site-currency-change` window event so any consumer
 * (e.g. the listing detail page's price card) can update reactively.
 *
 * FX is IDR-anchored: rates are stored as **IDR per 1 unit** of each currency
 * (IDR = 1). Live quotes prefer Bank Indonesia via Frankfurter, with a local
 * cache and {@link CURRENCY_RATES} fallback. USD/AUD/EUR remain labeled
 * “indicative only” in the Navbar.
 */
export const CURRENCY_STORAGE_KEY = "site.currency";
export const CURRENCY_CHANGE_EVENT = "site-currency-change";
/** Versioned so pre-IDR-anchor caches (USD = 1) are ignored. */
export const CURRENCY_RATES_STORAGE_KEY = "site.currency.rates.idr-v1";
export const CURRENCY_RATES_CHANGE_EVENT = "site-currency-rates-change";

export type SiteCurrency = "USD" | "AUD" | "EUR" | "IDR";

export const CURRENCY_OPTIONS: SiteCurrency[] = ["IDR", "USD", "AUD", "EUR"];

/**
 * Fallback IDR-per-unit rates (updated Sep 2026). Prefer live rates from
 * {@link ensureCurrencyRatesLoaded}. IDR is always 1 (the anchor).
 */
export const CURRENCY_RATES: Record<SiteCurrency, number> = {
  IDR: 1,
  USD: 17_550,
  AUD: 12_650,
  EUR: 20_400,
};

const RATES_CACHE_TTL_MS = 6 * 60 * 60_000;
/** Bank Indonesia USD→IDR (+ AUD/EUR) via Frankfurter v2. */
const FRANKFURTER_BI_URL =
  "https://api.frankfurter.dev/v2/rates?base=USD&quotes=IDR,AUD,EUR&providers=BI";
/** Blended fallback if BI is unavailable. */
const FRANKFURTER_BLEND_URL =
  "https://api.frankfurter.dev/v1/latest?from=USD&to=AUD,EUR,IDR";

/** Locale used to format each currency. */
const CURRENCY_LOCALES: Record<SiteCurrency, string> = {
  USD: "en-US",
  AUD: "en-AU",
  EUR: "de-DE",
  IDR: "id-ID",
};

type CachedRates = {
  fetchedAt: number;
  base: "IDR";
  rates: Record<SiteCurrency, number>;
};

let liveRates: Record<SiteCurrency, number> | null = null;
let ratesLoadPromise: Promise<Record<SiteCurrency, number>> | null = null;

export function safeCurrency(value: string | null | undefined): SiteCurrency {
  if (!value) return "IDR";
  if (CURRENCY_OPTIONS.includes(value as SiteCurrency)) return value as SiteCurrency;
  return "IDR";
}

function isValidRates(value: unknown): value is Record<SiteCurrency, number> {
  if (!value || typeof value !== "object") return false;
  const r = value as Record<string, unknown>;
  // IDR-anchored: IDR = 1, others quoted as IDR per 1 unit (>> 1).
  return (
    r.IDR === 1 &&
    typeof r.USD === "number" &&
    typeof r.AUD === "number" &&
    typeof r.EUR === "number" &&
    r.USD > 100 &&
    r.AUD > 100 &&
    r.EUR > 100
  );
}

/** Round IDR-per-unit quotes to nearest 50 for cleaner display math. */
function roundIdrPerUnit(value: number): number {
  return Math.round(value / 50) * 50;
}

/**
 * Build IDR-per-unit rates from USD-based quotes.
 * USD→IDR anchors everything; AUD/EUR are derived so they follow IDR.
 */
function ratesFromUsdQuotes(usdToIdr: number, usdToAud: number, usdToEur: number): Record<SiteCurrency, number> {
  return {
    IDR: 1,
    USD: roundIdrPerUnit(usdToIdr),
    AUD: roundIdrPerUnit(usdToIdr / usdToAud),
    EUR: roundIdrPerUnit(usdToIdr / usdToEur),
  };
}

function readCachedRates(): CachedRates | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CURRENCY_RATES_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedRates;
    if (
      !parsed ||
      parsed.base !== "IDR" ||
      typeof parsed.fetchedAt !== "number" ||
      !isValidRates(parsed.rates)
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeCachedRates(rates: Record<SiteCurrency, number>): void {
  if (typeof window === "undefined") return;
  try {
    const payload: CachedRates = { fetchedAt: Date.now(), base: "IDR", rates };
    window.localStorage.setItem(CURRENCY_RATES_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore quota / private mode
  }
}

function setLiveRates(rates: Record<SiteCurrency, number>): void {
  liveRates = rates;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CURRENCY_RATES_CHANGE_EVENT));
    // Re-use currency change so existing price cards re-render without new wiring.
    window.dispatchEvent(new Event(CURRENCY_CHANGE_EVENT));
  }
}

/** Active IDR-per-unit rates (live if loaded, otherwise fallback). */
export function getCurrencyRates(): Record<SiteCurrency, number> {
  return liveRates ?? CURRENCY_RATES;
}

function parseV2UsdQuotes(
  rows: unknown,
): { idr: number; aud: number; eur: number } | null {
  if (!Array.isArray(rows)) return null;
  let idr: number | undefined;
  let aud: number | undefined;
  let eur: number | undefined;
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const quote = (row as { quote?: unknown }).quote;
    const rate = (row as { rate?: unknown }).rate;
    if (typeof rate !== "number" || rate <= 0) continue;
    if (quote === "IDR") idr = rate;
    if (quote === "AUD") aud = rate;
    if (quote === "EUR") eur = rate;
  }
  if (idr == null || aud == null || eur == null) return null;
  return { idr, aud, eur };
}

async function fetchWithTimeout(url: string): Promise<Response | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    return res.ok ? res : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchFrankfurterRates(): Promise<Record<SiteCurrency, number> | null> {
  // Prefer Bank Indonesia (IDR market reference for Bali listings).
  const biRes = await fetchWithTimeout(FRANKFURTER_BI_URL);
  if (biRes) {
    try {
      const data = await biRes.json();
      const quotes = parseV2UsdQuotes(data);
      if (quotes) return ratesFromUsdQuotes(quotes.idr, quotes.aud, quotes.eur);
    } catch {
      // fall through to blended
    }
  }

  const blendRes = await fetchWithTimeout(FRANKFURTER_BLEND_URL);
  if (!blendRes) return null;
  try {
    const data = (await blendRes.json()) as { rates?: Record<string, number> };
    const aud = data.rates?.AUD;
    const eur = data.rates?.EUR;
    const idr = data.rates?.IDR;
    if (
      typeof aud !== "number" ||
      typeof eur !== "number" ||
      typeof idr !== "number" ||
      aud <= 0 ||
      eur <= 0 ||
      idr <= 0
    ) {
      return null;
    }
    return ratesFromUsdQuotes(idr, aud, eur);
  } catch {
    return null;
  }
}

/**
 * Load FX rates (cache → network → hardcoded fallback). Safe to call multiple
 * times; concurrent callers share one in-flight request.
 */
export function ensureCurrencyRatesLoaded(): Promise<Record<SiteCurrency, number>> {
  if (liveRates) return Promise.resolve(liveRates);

  const cached = readCachedRates();
  if (cached && Date.now() - cached.fetchedAt < RATES_CACHE_TTL_MS) {
    setLiveRates(cached.rates);
    return Promise.resolve(cached.rates);
  }

  if (ratesLoadPromise) return ratesLoadPromise;

  ratesLoadPromise = (async () => {
    // Prefer stale cache immediately while refreshing in the background.
    if (cached?.rates) setLiveRates(cached.rates);

    const fresh = await fetchFrankfurterRates();
    if (fresh) {
      writeCachedRates(fresh);
      setLiveRates(fresh);
      return fresh;
    }

    const fallback = cached?.rates ?? CURRENCY_RATES;
    setLiveRates(fallback);
    return fallback;
  })().finally(() => {
    ratesLoadPromise = null;
  });

  return ratesLoadPromise;
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

/**
 * Convert a USD listing amount to the target currency via IDR.
 * amount → IDR using the USD/IDR quote, then IDR → target.
 */
export function convertFromUsd(amountUsd: number, target: SiteCurrency): number {
  const rates = getCurrencyRates();
  const amountIdr = amountUsd * rates.USD;
  return amountIdr / rates[target];
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

/** Listing cards / grids: convert canonical USD when known, else keep marketing copy. */
export function formatPriceForSiteCurrency(
  priceUsd: number | null | undefined,
  fallbackLabel: string,
  currency: SiteCurrency,
): string {
  if (priceUsd != null && priceUsd > 0) {
    return formatCurrency(convertFromUsd(priceUsd, currency), currency);
  }
  const parsed = parseUsdNumber(fallbackLabel);
  if (parsed != null && parsed > 0) {
    return formatCurrency(convertFromUsd(parsed, currency), currency);
  }
  return fallbackLabel.trim() || "Price on request";
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

export function useSiteCurrency(defaultCurrency: SiteCurrency = "IDR"): SiteCurrency {
  const [currency, setCurrency] = useState<SiteCurrency>(defaultCurrency);
  // Bump when FX rates refresh so price formatters re-run with new rates.
  const [, setRatesTick] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setCurrency(safeCurrency(window.localStorage.getItem(CURRENCY_STORAGE_KEY)));
    void ensureCurrencyRatesLoaded();

    const onStorage = (event: StorageEvent) => {
      if (event.key === CURRENCY_STORAGE_KEY) {
        setCurrency(safeCurrency(event.newValue));
      }
      if (event.key === CURRENCY_RATES_STORAGE_KEY) {
        setRatesTick((n) => n + 1);
      }
    };
    const onFocus = () => {
      setCurrency(safeCurrency(window.localStorage.getItem(CURRENCY_STORAGE_KEY)));
    };
    const onCurrencyChange = () => {
      setCurrency(safeCurrency(window.localStorage.getItem(CURRENCY_STORAGE_KEY)));
    };
    const onRatesChange = () => {
      setRatesTick((n) => n + 1);
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    window.addEventListener(CURRENCY_CHANGE_EVENT, onCurrencyChange as EventListener);
    window.addEventListener(CURRENCY_RATES_CHANGE_EVENT, onRatesChange as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener(CURRENCY_CHANGE_EVENT, onCurrencyChange as EventListener);
      window.removeEventListener(CURRENCY_RATES_CHANGE_EVENT, onRatesChange as EventListener);
    };
  }, []);

  return currency;
}
