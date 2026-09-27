import "server-only";
import fs from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { drizzle as drizzlePostgres, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type Db = PostgresJsDatabase<typeof schema>;

/**
 * DATABASE_URL:
 *   postgres://…        — Yandex Managed Service for PostgreSQL (production)
 *   pglite:./.data/db   — embedded Postgres (WASM) for local development
 *   pglite:memory       — in-memory, for e2e tests
 */
export function databaseUrl(): string {
  return process.env.DATABASE_URL ?? "pglite:./.data/pglite";
}

export function isPglite(url = databaseUrl()): boolean {
  return url.startsWith("pglite:");
}

function createPglite(url: string): Db {
  const target = url.slice("pglite:".length);
  if (target === "memory") return drizzlePglite({ client: new PGlite(), schema }) as unknown as Db;
  const dir = path.resolve(target);
  fs.mkdirSync(path.dirname(dir), { recursive: true });
  const client = new PGlite(dir);
  // Same SQL dialect and query API; typed as the production driver for simplicity.
  return drizzlePglite({ client, schema }) as unknown as Db;
}

function createPostgres(url: string): Db {
  const ca = process.env.DATABASE_CA_CERT;
  const client = postgres(url, {
    max: Number(process.env.DATABASE_POOL_SIZE ?? 5),
    ssl: ca
      ? { ca, rejectUnauthorized: true }
      : url.includes("sslmode=disable")
        ? false
        : "require",
  });
  return drizzlePostgres({ client, schema });
}

type DbGlobal = { __aipmDb?: Db };
const globalForDb = globalThis as DbGlobal;

/** One connection pool per process (survives dev HMR and duplicated server bundles). */
export function getDb(): Db {
  if (!globalForDb.__aipmDb) {
    const url = databaseUrl();
    globalForDb.__aipmDb = isPglite(url) ? createPglite(url) : createPostgres(url);
  }
  return globalForDb.__aipmDb;
}

/**
 * Same database, connected on first use. Modules that need a db object at
 * import time (the auth config) get this, so `next build` workers never open
 * a connection — or an embedded PGlite file — unless a query actually runs.
 */
export const lazyDb: Db = new Proxy({} as Db, {
  get(_target, property) {
    const db = getDb();
    const value = Reflect.get(db, property, db) as unknown;
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(db)
      : value;
  },
  has(_target, property) {
    return Reflect.has(getDb(), property);
  },
});
