import "server-only";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getDb, schema } from "@/shared/db/index.server";

export type Submission = typeof schema.assignmentSubmission.$inferSelect;

export async function getSubmissions(userId: string): Promise<Map<string, Submission>> {
  const rows = await getDb()
    .select()
    .from(schema.assignmentSubmission)
    .where(eq(schema.assignmentSubmission.userId, userId));
  return new Map(rows.map((row) => [row.assignmentId, row]));
}

export async function getSubmission(
  userId: string,
  assignmentId: string,
): Promise<Submission | null> {
  const [row] = await getDb()
    .select()
    .from(schema.assignmentSubmission)
    .where(
      and(
        eq(schema.assignmentSubmission.userId, userId),
        eq(schema.assignmentSubmission.assignmentId, assignmentId),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function upsertSubmission(input: {
  userId: string;
  assignmentId: string;
  moduleId: string;
  text: string | null;
  link: string | null;
  checklist: boolean[];
}): Promise<void> {
  await getDb()
    .insert(schema.assignmentSubmission)
    .values({ id: nanoid(), ...input })
    .onConflictDoUpdate({
      target: [schema.assignmentSubmission.userId, schema.assignmentSubmission.assignmentId],
      set: { text: input.text, link: input.link, checklist: input.checklist },
    });
}
