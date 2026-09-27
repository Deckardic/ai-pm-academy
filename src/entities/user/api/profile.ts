import "server-only";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/shared/db/index.server";

export type UserProfile = Pick<
  typeof schema.user.$inferSelect,
  | "id"
  | "name"
  | "email"
  | "emailVerified"
  | "nameLatin"
  | "emailReminders"
  | "onboarding"
  | "createdAt"
>;

/** Fresh from the database (the session cookie cache can lag behind edits). */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const [row] = await getDb()
    .select({
      id: schema.user.id,
      name: schema.user.name,
      email: schema.user.email,
      emailVerified: schema.user.emailVerified,
      nameLatin: schema.user.nameLatin,
      emailReminders: schema.user.emailReminders,
      onboarding: schema.user.onboarding,
      createdAt: schema.user.createdAt,
    })
    .from(schema.user)
    .where(eq(schema.user.id, userId))
    .limit(1);
  return row ?? null;
}
