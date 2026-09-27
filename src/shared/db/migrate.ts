import "server-only";
import path from "node:path";
import { getDb, isPglite } from "./client";

const MIGRATIONS = path.join(process.cwd(), "drizzle");

type MigrateGlobal = { __aipmMigrated?: Promise<void> };
const globalForMigrate = globalThis as MigrateGlobal;

/** Idempotent; runs once per process. */
export function runMigrations(): Promise<void> {
  globalForMigrate.__aipmMigrated ??= (async () => {
    const db = getDb();
    if (isPglite()) {
      const { migrate } = await import("drizzle-orm/pglite/migrator");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await migrate(db as any, { migrationsFolder: MIGRATIONS });
    } else {
      const { migrate } = await import("drizzle-orm/postgres-js/migrator");
      await migrate(db, { migrationsFolder: MIGRATIONS });
    }
  })();
  return globalForMigrate.__aipmMigrated;
}
