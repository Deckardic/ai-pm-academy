"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { getLessonById } from "@/entities/course/index.server";
import { setLessonCompleted } from "@/entities/progress/index.server";
import { getCurrentUser } from "@/entities/user/index.server";

const inputSchema = z.object({ lessonId: z.string().min(1).max(40), completed: z.boolean() });

export type ToggleLessonResult =
  { ok: true; completed: boolean } | { ok: false; error: "unauthorized" | "not-found" };

export async function toggleLessonComplete(
  input: z.input<typeof inputSchema>,
): Promise<ToggleLessonResult> {
  const { lessonId, completed } = inputSchema.parse(input);
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "unauthorized" };
  const lesson = getLessonById(lessonId);
  if (!lesson) return { ok: false, error: "not-found" };
  await setLessonCompleted(user.id, lesson.id, lesson.version, completed);
  refresh();
  return { ok: true, completed };
}
