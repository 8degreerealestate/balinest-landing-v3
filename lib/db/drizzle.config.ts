import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

const databaseUrl =
  process.env.DATABASE_URL?.trim() ||
  process.env.SUPABASE_DATABASE_URL?.trim() ||
  process.env.DATABASE_URL_DIRECT?.trim();

if (!databaseUrl) {
  throw new Error(
    "Set DATABASE_URL or SUPABASE_DATABASE_URL (Supabase direct URI on port 5432 recommended for drizzle-kit push).",
  );
}

export default {
  schema: path.join(rootDir, "src/schema"),
  out: path.join(rootDir, "drizzle"),
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
};
