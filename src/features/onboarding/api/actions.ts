"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { getCurrentUser } from "@/entities/user/index.server";
import { getDb, schema, type OnboardingAnswers } from "@/shared/db/index.server";

const inputSchema = z.object({
  role: z.string().trim().max(120).default(""),
  experience: z.enum(["none", "lt1", "1to4", "5plus"]),
  goal: z.enum(["enter", "systematize", "ai", "promotion"]),
  aiRestricted: z.enum(["yes", "no", "unknown"]),
});

function recommend(
  experience: OnboardingAnswers["experience"],
): OnboardingAnswers["recommendedLevel"] {
  // Senior is not published yet: experienced PMs start from Middle.
  return experience === "none" || experience === "lt1" ? "junior" : "middle";
}

export async function saveOnboarding(input: z.input<typeof inputSchema>) {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Ответьте на все вопросы" };
  const user = await getCurrentUser();
  if (!user) return { ok: false as const, error: "Войдите заново" };
  const answers: OnboardingAnswers = {
    ...parsed.data,
    recommendedLevel: recommend(parsed.data.experience),
  };
  await getDb().update(schema.user).set({ onboarding: answers }).where(eq(schema.user.id, user.id));
  return { ok: true as const, recommendedLevel: answers.recommendedLevel };
}
