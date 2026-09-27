/** Applies SQL migrations from ./drizzle — run in the deploy pipeline before the new revision. */
import path from "node:path";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url || url.startsWith("pglite:")) {
  console.log(
    "DATABASE_URL не задан или указывает на PGlite — миграции применятся при старте приложения.",
  );
  process.exit(0);
}

const ca = process.env.DATABASE_CA_CERT;
const client = postgres(url, {
  max: 1,
  ssl: ca ? { ca } : url.includes("sslmode=disable") ? false : "require",
});
await migrate(drizzle({ client }), { migrationsFolder: path.join(process.cwd(), "drizzle") });
await client.end();
console.log("✓ Миграции применены");
