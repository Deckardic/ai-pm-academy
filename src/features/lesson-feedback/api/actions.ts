"use server";

import { z } from "zod";
import { saveFeedback } from "@/entities/progress/index.server";
import { getCurrentUser } from "@/entities/user/index.server";

const ratingSchema = z.object({
  lessonId: z.string().min(1).max(40),
  rating: z.number().int().min(1).max(5),
});
const reportSchema = z.object({
  targetId: z.string().min(1).max(80),
  kind: z.enum(["lesson-error", "question-error"]),
  comment: z.string().trim().min(5, "Опишите ошибку чуть подробнее").max(2000),
});

export async function rateLesson(input: z.input<typeof ratingSchema>) {
  const data = ratingSchema.parse(input);
  const user = await getCurrentUser();
  await saveFeedback({
    userId: user?.id ?? null,
    targetId: data.lessonId,
    kind: "rating",
    rating: data.rating,
  });
  return { ok: true as const };
}

export async function reportError(input: z.input<typeof reportSchema>) {
  const parsed = reportSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Проверьте текст" };
  const user = await getCurrentUser();
  await saveFeedback({ userId: user?.id ?? null, ...parsed.data });
  return { ok: true as const };
}
