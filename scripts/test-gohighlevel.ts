/**
 * Verify Go High Level CRM credentials (contacts/upsert).
 * Usage: pnpm --filter @workspace/scripts run crm:test
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const envPath = resolve(import.meta.dirname, "..", ".env");
try {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
} catch {
  /* use existing process.env */
}

const token = process.env.GOHIGHLEVEL_API_TOKEN?.trim();
const locationId = process.env.GOHIGHLEVEL_LOCATION_ID?.trim();

if (!token || !locationId) {
  console.error("Set GOHIGHLEVEL_API_TOKEN and GOHIGHLEVEL_LOCATION_ID in .env");
  process.exit(1);
}

const email = `crm-test-${Date.now()}@example.com`;
const body = {
  locationId,
  firstName: "CRM",
  lastName: "Test",
  email,
  phone: "+6287787169089",
  country: "Indonesia",
  source: "8degree.co",
  tags: ["8degree-website", "website-lead", "source-contact-page"],
};

const res = await fetch("https://services.leadconnectorhq.com/contacts/upsert", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    Version: "2021-07-28",
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  body: JSON.stringify(body),
});

const text = await res.text();
console.log("HTTP", res.status);
console.log(text);

if (!res.ok) {
  if (res.status === 401 && text.includes("scope")) {
    console.error(
      "\nFix: Go High Level → Settings → Private Integrations → edit your token → enable contacts.write → save → paste new PIT into .env and Vercel GOHIGHLEVEL_API_TOKEN",
    );
  }
  process.exit(1);
}

console.log("\nOK — contact upsert works. Check Go High Level for", email);
