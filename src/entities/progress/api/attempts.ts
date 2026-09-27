import "server-only";
import { and, desc, eq, isNotNull, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getDb, schema } from "@/shared/db/index.server";

export type QuizAttempt = typeof schema.quizAttempt.$inferSelect;

export async function createAttempt(input: {
  userId: string;
  quizId: string;
  kind: "module" | "exam";
  levelSlug: string;
  moduleId: string | null;
  contentVersion: string;
  questionIds: string[];
}): Promise<QuizAttempt> {
  const [row] = await getDb()
    .insert(schema.quizAttempt)
    .values({ id: nanoid(), ...input })
    .returning();
  return row!;
}

export async function getAttempt(id: string, userId: string): Promise<QuizAttempt | null> {
  const [row] = await getDb()
    .select()
    .from(schema.quizAttempt)
    .where(and(eq(schema.quizAttempt.id, id), eq(schema.quizAttempt.userId, userId)))
    .limit(1);
  return row ?? null;
}

/** Only an unsubmitted attempt can be graded — prevents replaying answers. */
export async function completeAttempt(
  id: string,
  userId: string,
  result: { answers: Record<string, string | string[]>; score: number; passed: boolean },
): Promise<QuizAttempt | null> {
  const [row] = await getDb()
    .update(schema.quizAttempt)
    .set({ ...result, submittedAt: new Date() })
    .where(
      and(
        eq(schema.quizAttempt.id, id),
        eq(schema.quizAttempt.userId, userId),
        isNull(schema.quizAttempt.submittedAt),
      ),
    )
    .returning();
  return row ?? null;
}

export async function getSubmittedAttempts(
  userId: string,
  levelSlug?: string,
): Promise<QuizAttempt[]> {
  return getDb()
    .select()
    .from(schema.quizAttempt)
    .where(
      and(
        eq(schema.quizAttempt.userId, userId),
        isNotNull(schema.quizAttempt.submittedAt),
        levelSlug ? eq(schema.quizAttempt.levelSlug, levelSlug) : undefined,
      ),
    )
    .orderBy(desc(schema.quizAttempt.submittedAt));
}

export async function getPassedQuizIds(userId: string): Promise<Set<string>> {
  const rows = await getDb()
    .select({ quizId: schema.quizAttempt.quizId })
    .from(schema.quizAttempt)
    .where(and(eq(schema.quizAttempt.userId, userId), eq(schema.quizAttempt.passed, true)));
  return new Set(rows.map((row) => row.quizId));
}

export async function getLastSubmittedAttempt(
  userId: string,
  quizId: string,
): Promise<QuizAttempt | null> {
  const [row] = await getDb()
    .select()
    .from(schema.quizAttempt)
    .where(
      and(
        eq(schema.quizAttempt.userId, userId),
        eq(schema.quizAttempt.quizId, quizId),
        isNotNull(schema.quizAttempt.submittedAt),
      ),
    )
    .orderBy(desc(schema.quizAttempt.submittedAt))
    .limit(1);
  return row ?? null;
}
