import "server-only";
import { and, eq } from "drizzle-orm";
import { getDb, schema } from "@/shared/db/index.server";

export type CompletedLesson = { lessonId: string; lessonVersion: number; completedAt: Date };

export async function getCompletedLessons(userId: string): Promise<Map<string, CompletedLesson>> {
  const rows = await getDb()
    .select({
      lessonId: schema.lessonProgress.lessonId,
      lessonVersion: schema.lessonProgress.lessonVersion,
      completedAt: schema.lessonProgress.completedAt,
    })
    .from(schema.lessonProgress)
    .where(eq(schema.lessonProgress.userId, userId));
  return new Map(rows.map((row) => [row.lessonId, row]));
}

export async function isLessonCompleted(userId: string, lessonId: string): Promise<boolean> {
  const rows = await getDb()
    .select({ lessonId: schema.lessonProgress.lessonId })
    .from(schema.lessonProgress)
    .where(
      and(eq(schema.lessonProgress.userId, userId), eq(schema.lessonProgress.lessonId, lessonId)),
    )
    .limit(1);
  return rows.length > 0;
}

export async function setLessonCompleted(
  userId: string,
  lessonId: string,
  lessonVersion: number,
  completed: boolean,
): Promise<void> {
  const db = getDb();
  if (!completed) {
    await db
      .delete(schema.lessonProgress)
      .where(
        and(eq(schema.lessonProgress.userId, userId), eq(schema.lessonProgress.lessonId, lessonId)),
      );
    return;
  }
  await db
    .insert(schema.lessonProgress)
    .values({ userId, lessonId, lessonVersion })
    .onConflictDoUpdate({
      target: [schema.lessonProgress.userId, schema.lessonProgress.lessonId],
      set: { lessonVersion, completedAt: new Date() },
    });
}
