import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

type DbSchema = typeof schema;

let poolInstance: pg.Pool | null = null;
let dbInstance: NodePgDatabase<DbSchema> | null = null;

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }
  return url;
}

/** Lazily creates the pool (serverless-safe when only sheet inventory is used). */
export function getPool(): pg.Pool {
  if (!poolInstance) {
    poolInstance = new Pool({ connectionString: requireDatabaseUrl() });
  }
  return poolInstance;
}

/** Lazily creates the Drizzle client. */
export function getDb(): NodePgDatabase<DbSchema> {
  if (!dbInstance) {
    dbInstance = drizzle(getPool(), { schema });
  }
  return dbInstance;
}

function proxyPool(): pg.Pool {
  return new Proxy({} as pg.Pool, {
    get(_target, prop) {
      const p = getPool();
      const value = Reflect.get(p, prop, p);
      return typeof value === "function" ? (value as (...args: unknown[]) => unknown).bind(p) : value;
    },
  });
}

function proxyDb(): NodePgDatabase<DbSchema> {
  return new Proxy({} as NodePgDatabase<DbSchema>, {
    get(_target, prop) {
      const d = getDb();
      const value = Reflect.get(d, prop, d);
      return typeof value === "function" ? (value as (...args: unknown[]) => unknown).bind(d) : value;
    },
  });
}

/** Back-compat: defers connection until first query. */
export const pool = proxyPool();
export const db = proxyDb();

export * from "./schema";
