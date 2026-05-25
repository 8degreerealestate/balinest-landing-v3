import type { PoolConfig } from "pg";

/**
 * Postgres connection URL. Prefer `DATABASE_URL`; `SUPABASE_DATABASE_URL` is an alias.
 * On Supabase, use the **Transaction pooler** URI (port 6543) for Vercel/serverless.
 */
export function resolveDatabaseUrl(): string | null {
  const url =
    process.env.DATABASE_URL?.trim() || process.env.SUPABASE_DATABASE_URL?.trim() || null;
  return url || null;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(resolveDatabaseUrl());
}

export function requireDatabaseUrl(): string {
  const url = resolveDatabaseUrl();
  if (!url) {
    throw new Error(
      "DATABASE_URL (or SUPABASE_DATABASE_URL) must be set. Use your Supabase connection string.",
    );
  }
  return url;
}

function isSupabaseHost(connectionString: string): boolean {
  try {
    const host = new URL(connectionString.replace(/^postgres(ql)?:\/\//, "https://")).hostname;
    return host.endsWith(".supabase.co") || host.includes("pooler.supabase.com");
  } catch {
    return connectionString.includes("supabase.co");
  }
}

/** Pool tuned for Supabase + Vercel serverless (small pool, SSL, timeouts). */
export function createPoolConfig(): PoolConfig {
  const connectionString = requireDatabaseUrl();
  const serverless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  const supabase = isSupabaseHost(connectionString);
  const ssl =
    supabase || connectionString.includes("sslmode=require")
      ? { rejectUnauthorized: false as const }
      : undefined;

  // Prefer discrete credentials when set — avoids URL parsers breaking passwords with ? & etc.
  const user = process.env.SUPABASE_DB_USER?.trim();
  const password = process.env.SUPABASE_DB_PASSWORD?.trim();
  const host = process.env.SUPABASE_DB_HOST?.trim();
  const port = process.env.SUPABASE_DB_PORT?.trim();
  const database = process.env.SUPABASE_DB_NAME?.trim() || "postgres";

  if (user && password && host) {
    return {
      user,
      password,
      host,
      port: port ? Number(port) : 6543,
      database,
      max: serverless ? 2 : 10,
      idleTimeoutMillis: 20_000,
      connectionTimeoutMillis: 15_000,
      ssl,
    };
  }

  return {
    connectionString,
    max: serverless ? 2 : 10,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 15_000,
    ssl,
  };
}

export function databaseProviderLabel(): "supabase" | "postgres" | "none" {
  const url = resolveDatabaseUrl();
  if (!url) return "none";
  return isSupabaseHost(url) ? "supabase" : "postgres";
}
