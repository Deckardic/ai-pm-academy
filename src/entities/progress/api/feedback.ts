import "server-only";
import { nanoid } from "nanoid";
import { getDb, schema } from "@/shared/db/index.server";

export async function saveFeedback(input: {
  userId: string | null;
  targetId: string;
  kind: "rating" | "lesson-error" | "question-error";
  rating?: number | null;
  comment?: string | null;
}): Promise<void> {
  await getDb()
    .insert(schema.lessonFeedback)
    .values({ id: nanoid(), rating: null, comment: null, ...input });
}
