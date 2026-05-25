/**
 * Smoke-test DATABASE_URL / SUPABASE_DATABASE_URL.
 * Usage: pnpm run db:check
 */
import { databaseProviderLabel, pingDatabase, resolveDatabaseUrl } from "@workspace/db";

const url = resolveDatabaseUrl();
if (!url) {
  console.error("No DATABASE_URL or SUPABASE_DATABASE_URL set.");
  process.exit(1);
}

const provider = databaseProviderLabel();
console.log(`Provider: ${provider}`);
console.log(`Host: ${url.replace(/:[^:@/]+@/, ":***@").split("?")[0]}`);

const ok = await pingDatabase();
if (!ok) {
  console.error("Connection failed. Check password, SSL, project paused, or use pooler URI on Vercel.");
  process.exit(1);
}

console.log("Connection OK.");
