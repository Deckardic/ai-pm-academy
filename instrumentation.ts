/**
 * Runs once when the server starts. Applies migrations automatically for the
 * embedded PGlite database (local dev, e2e) or when DB_AUTO_MIGRATE=true.
 * In production the deploy pipeline runs `pnpm db:migrate` instead.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  const url = process.env.DATABASE_URL ?? "pglite:";
  if (!url.startsWith("pglite:") && process.env.DB_AUTO_MIGRATE !== "true") return;
  const { runMigrations } = await import("@/shared/db/index.server");
  await runMigrations();
}
