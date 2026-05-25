import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";
import {
  createPoolConfig,
  databaseProviderLabel,
  isDatabaseConfigured,
  requireDatabaseUrl,
  resolveDatabaseUrl,
} from "./connection";

const { Pool } = pg;

type DbSchema = typeof schema;

let poolInstance: pg.Pool | null = null;
let dbInstance: NodePgDatabase<DbSchema> | null = null;

export {
  createPoolConfig,
  databaseProviderLabel,
  isDatabaseConfigured,
  requireDatabaseUrl,
  resolveDatabaseUrl,
};

/** Lazily creates the pool (serverless-safe when only sheet inventory is used). */
export function getPool(): pg.Pool {
  if (!poolInstance) {
    poolInstance = new Pool(createPoolConfig());
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

/** Quick connectivity check (e.g. health endpoint). */
export async function pingDatabase(): Promise<boolean> {
  if (!isDatabaseConfigured()) return false;
  try {
    await getPool().query("select 1 as ok");
    return true;
  } catch {
    return false;
  }
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
