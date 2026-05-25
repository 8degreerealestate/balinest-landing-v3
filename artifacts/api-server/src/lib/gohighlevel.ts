import { logger } from "./logger";

const GHL_API_BASE = "https://services.leadconnectorhq.com";
const GHL_API_VERSION = "2021-07-28";

export type EnquiryCrmPayload = {
  name: string;
  email: string;
  phone?: string | null;
  whatsapp?: string | null;
  country?: string | null;
  budgetRange?: string | null;
  message?: string | null;
  source?: string | null;
  interestedProjectTitle?: string | null;
};

type GoHighLevelConfig = {
  token: string;
  locationId: string;
  baseUrl: string;
};

let cachedLocationId: string | null = null;

function envFalsy(name: string): boolean {
  const v = process.env[name]?.trim().toLowerCase();
  return v === "0" || v === "false" || v === "no" || v === "off";
}

export function isGoHighLevelSyncEnabled(): boolean {
  if (envFalsy("GOHIGHLEVEL_SYNC_ENABLED") || envFalsy("GOHIGHLEVEL_ENABLED")) {
    return false;
  }
  return Boolean(getToken());
}

function getToken(): string | null {
  return process.env.GOHIGHLEVEL_API_TOKEN?.trim() || null;
}

async function ghlFetch(
  config: GoHighLevelConfig,
  path: string,
  init: RequestInit,
): Promise<Response> {
  const url = `${config.baseUrl}${path}`;
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  headers.set("Version", GHL_API_VERSION);
  headers.set("Authorization", `Bearer ${config.token}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(url, { ...init, headers });
}

async function resolveLocationId(config: GoHighLevelConfig): Promise<string | null> {
  const fromEnv = process.env.GOHIGHLEVEL_LOCATION_ID?.trim();
  if (fromEnv) return fromEnv;
  if (cachedLocationId) return cachedLocationId;

  try {
    const res = await ghlFetch(config, "/locations/search", { method: "GET" });
    if (!res.ok) {
      logger.warn({ status: res.status }, "GoHighLevel locations/search failed");
      return null;
    }
    const data = (await res.json()) as { locations?: Array<{ id?: string }> };
    const ids = (data.locations ?? [])
      .map((l) => l.id?.trim())
      .filter((id): id is string => Boolean(id));
    if (ids.length === 1) {
      cachedLocationId = ids[0];
      logger.info({ locationId: ids[0] }, "GoHighLevel location resolved from search");
      return ids[0];
    }
    if (ids.length > 1) {
      logger.warn(
        { count: ids.length },
        "GoHighLevel: multiple locations; set GOHIGHLEVEL_LOCATION_ID",
      );
    }
  } catch (err) {
    logger.warn({ err }, "GoHighLevel location lookup error");
  }
  return null;
}

async function loadConfig(): Promise<GoHighLevelConfig | null> {
  const token = getToken();
  if (!token) return null;

  const baseUrl = (process.env.GOHIGHLEVEL_API_BASE_URL?.trim() || GHL_API_BASE).replace(
    /\/$/,
    "",
  );
  const stub: GoHighLevelConfig = { token, locationId: "", baseUrl };
  const locationId = await resolveLocationId(stub);
  if (!locationId) return null;

  return { token, locationId, baseUrl };
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim();
  if (!trimmed) return { firstName: "Website", lastName: "Lead" };
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function normalizePhone(phone: string | null | undefined): string | undefined {
  if (!phone?.trim()) return undefined;
  const digits = phone.replace(/[^\d+]/g, "");
  if (!digits) return undefined;
  return digits.startsWith("+") ? digits : `+${digits.replace(/^\+/, "")}`;
}

function tagsForSource(source: string | null | undefined): string[] {
  const base = ["8degree-website", "website-lead"];
  if (!source?.trim()) return base;
  const slug = source.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return [...base, `source-${slug}`];
}

function buildNoteBody(payload: EnquiryCrmPayload): string {
  const lines: string[] = ["8 Degree website enquiry"];
  if (payload.source) lines.push(`Source: ${payload.source}`);
  if (payload.interestedProjectTitle) {
    lines.push(`Project: ${payload.interestedProjectTitle}`);
  }
  if (payload.budgetRange) lines.push(`Budget: ${payload.budgetRange}`);
  if (payload.country) lines.push(`Country: ${payload.country}`);
  if (payload.message?.trim()) lines.push("", payload.message.trim());
  return lines.join("\n");
}

async function addContactNote(
  config: GoHighLevelConfig,
  contactId: string,
  body: string,
): Promise<void> {
  const res = await ghlFetch(config, `/contacts/${contactId}/notes`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    logger.warn(
      { status: res.status, contactId, detail: text.slice(0, 200) },
      "GoHighLevel contact note failed",
    );
  }
}

/**
 * Upserts a contact in Go High Level (LeadConnector). Never throws — logs and returns status.
 */
export async function syncEnquiryToGoHighLevel(
  payload: EnquiryCrmPayload,
): Promise<{ synced: boolean; contactId?: string; error?: string }> {
  if (!isGoHighLevelSyncEnabled()) {
    return { synced: false, error: "Go High Level sync disabled or missing GOHIGHLEVEL_API_TOKEN" };
  }

  const config = await loadConfig();
  if (!config) {
    logger.warn("GoHighLevel sync skipped: missing API token or location ID");
    return {
      synced: false,
      error: "Missing GOHIGHLEVEL_API_TOKEN or GOHIGHLEVEL_LOCATION_ID",
    };
  }

  const { firstName, lastName } = splitName(payload.name);
  const phone = normalizePhone(payload.whatsapp) ?? normalizePhone(payload.phone);

  const upsertBody: Record<string, unknown> = {
    locationId: config.locationId,
    firstName,
    lastName: lastName || undefined,
    name: payload.name.trim(),
    email: payload.email.trim(),
    phone,
    country: payload.country?.trim() || undefined,
    source: payload.source?.trim() || "8degree.co",
    tags: tagsForSource(payload.source),
  };

  try {
    const res = await ghlFetch(config, "/contacts/upsert", {
      method: "POST",
      body: JSON.stringify(upsertBody),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const scopeHint =
        res.status === 401 && text.includes("scope")
          ? " — regenerate the Private Integration Token with contacts.write scope in Go High Level"
          : "";
      logger.warn(
        { status: res.status, detail: text.slice(0, 300) },
        `GoHighLevel contact upsert failed${scopeHint}`,
      );
      return { synced: false, error: text.slice(0, 200) || `HTTP ${res.status}` };
    }

    const data = (await res.json()) as { contact?: { id?: string } };
    const contactId = data.contact?.id;
    if (contactId) {
      const note = buildNoteBody(payload);
      if (note.length > 0) {
        await addContactNote(config, contactId, note);
      }
      logger.info({ contactId, source: payload.source }, "GoHighLevel contact synced");
      return { synced: true, contactId };
    }

    logger.info({ source: payload.source }, "GoHighLevel upsert ok (no contact id in response)");
    return { synced: true };
  } catch (err) {
    logger.warn({ err }, "GoHighLevel sync error");
    return { synced: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/** Lightweight check for health/diagnostics (does not create contacts). */
export async function probeGoHighLevel(): Promise<{
  configured: boolean;
  ok: boolean;
  detail?: string;
}> {
  if (!isGoHighLevelSyncEnabled()) {
    return { configured: false, ok: false, detail: "sync disabled or no token" };
  }
  const config = await loadConfig();
  if (!config) {
    return { configured: true, ok: false, detail: "missing location id" };
  }
  try {
    const res = await ghlFetch(config, `/locations/${config.locationId}`, { method: "GET" });
    if (res.ok) return { configured: true, ok: true };
    const text = await res.text().catch(() => "");
    return { configured: true, ok: false, detail: text.slice(0, 120) || `HTTP ${res.status}` };
  } catch (err) {
    return {
      configured: true,
      ok: false,
      detail: err instanceof Error ? err.message : String(err),
    };
  }
}
