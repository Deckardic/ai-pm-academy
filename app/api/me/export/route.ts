import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/shared/auth/index.server";
import { getDb, schema } from "@/shared/db/index.server";

/** 152-ФЗ / right of access: everything we store about the user, as JSON. */
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new Response("Unauthorized", { status: 401 });
  const db = getDb();
  const userId = session.user.id;
  const [user] = await db.select().from(schema.user).where(eq(schema.user.id, userId));
  const [lessons, attempts, submissions, certificates, feedback, accounts] = await Promise.all([
    db.select().from(schema.lessonProgress).where(eq(schema.lessonProgress.userId, userId)),
    db.select().from(schema.quizAttempt).where(eq(schema.quizAttempt.userId, userId)),
    db
      .select()
      .from(schema.assignmentSubmission)
      .where(eq(schema.assignmentSubmission.userId, userId)),
    db.select().from(schema.certificate).where(eq(schema.certificate.userId, userId)),
    db.select().from(schema.lessonFeedback).where(eq(schema.lessonFeedback.userId, userId)),
    db
      .select({ providerId: schema.account.providerId, createdAt: schema.account.createdAt })
      .from(schema.account)
      .where(eq(schema.account.userId, userId)),
  ]);
  const body = JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      user,
      accounts,
      lessons,
      attempts,
      submissions,
      certificates,
      feedback,
    },
    null,
    2,
  );
  return new Response(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="ai-pm-academy-data.json"',
      "Cache-Control": "no-store",
    },
  });
}
