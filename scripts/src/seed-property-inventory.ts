import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Pool } = pg;

type ListingRow = {
  code: string;
  title: string;
  listingUrl?: string | null;
  description?: string;
  channel: "silent" | "website";
  sortOrder?: number;
};

function usage(): never {
  console.error(
    "Usage: DATABASE_URL=postgres://… pnpm exec tsx scripts/src/seed-property-inventory.ts [path/to.json]\n" +
      "JSON shape: { \"listings\": [{ \"code\", \"title\", \"listingUrl?\", \"description\", \"channel\", \"sortOrder?\" }] }",
  );
  process.exit(1);
}

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) usage();

  const here = path.dirname(fileURLToPath(import.meta.url));
  const defaultJson = path.join(here, "../data/inventory-upsert-sample.json");
  const jsonPath = process.argv[2] ? path.resolve(process.argv[2]) : defaultJson;

  let body: { listings: ListingRow[] };
  try {
    body = JSON.parse(readFileSync(jsonPath, "utf8")) as { listings: ListingRow[] };
  } catch {
    console.error(`Could not read JSON: ${jsonPath}`);
    usage();
  }

  if (!Array.isArray(body.listings) || body.listings.length === 0) {
    console.error("JSON must contain a non-empty `listings` array");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const sql = `
    INSERT INTO property_inventory (code, title, listing_url, description, channel, sort_order)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (code) DO UPDATE SET
      title = EXCLUDED.title,
      listing_url = EXCLUDED.listing_url,
      description = EXCLUDED.description,
      channel = EXCLUDED.channel,
      sort_order = EXCLUDED.sort_order,
      updated_at = now()
  `;

  let n = 0;
  for (const row of body.listings) {
    await pool.query(sql, [
      row.code.trim(),
      (row.title ?? "").trim(),
      row.listingUrl ?? null,
      row.description ?? "",
      row.channel,
      row.sortOrder ?? 0,
    ]);
    n++;
  }

  await pool.end();
  console.log(`Upserted ${n} inventory rows from ${jsonPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
