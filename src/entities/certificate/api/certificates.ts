import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getDb, schema } from "@/shared/db/index.server";
import { generateCertificateCode, normalizeCertificateCode } from "../model/code";

export type Certificate = typeof schema.certificate.$inferSelect;

export async function getCertificateByCode(code: string): Promise<Certificate | null> {
  const [row] = await getDb()
    .select()
    .from(schema.certificate)
    .where(eq(schema.certificate.code, normalizeCertificateCode(code)))
    .limit(1);
  return row ?? null;
}

export async function getUserCertificates(userId: string): Promise<Certificate[]> {
  return getDb()
    .select()
    .from(schema.certificate)
    .where(eq(schema.certificate.userId, userId))
    .orderBy(desc(schema.certificate.issuedAt));
}

/** Idempotent: one certificate per user and level; returns the existing one if present. */
export async function issueCertificate(input: {
  userId: string;
  levelSlug: string;
  fullName: string;
  fullNameLatin: string | null;
  contentVersion: string;
}): Promise<Certificate> {
  const db = getDb();
  const [existing] = await db
    .select()
    .from(schema.certificate)
    .where(
      and(
        eq(schema.certificate.userId, input.userId),
        eq(schema.certificate.levelSlug, input.levelSlug),
      ),
    )
    .limit(1);
  if (existing) return existing;
  const [row] = await db
    .insert(schema.certificate)
    .values({ id: nanoid(), code: generateCertificateCode(input.levelSlug), ...input })
    .onConflictDoNothing()
    .returning();
  if (row) return row;
  // Lost a race with a parallel request — read the winner.
  const [winner] = await db
    .select()
    .from(schema.certificate)
    .where(
      and(
        eq(schema.certificate.userId, input.userId),
        eq(schema.certificate.levelSlug, input.levelSlug),
      ),
    )
    .limit(1);
  return winner!;
}
