"use server";

import { z } from "zod";
import {
  getPlacementTest,
  gradeQuestion,
  scorePlacement,
  toPublicQuestion,
  type GradeResult,
  type PlacementResult,
  type PublicQuestion,
} from "@/entities/quiz/index.server";

export type StartPlacementResult =
  { ok: true; attemptId: string; questions: PublicQuestion[] } | { ok: false; error: string };
export type SubmitPlacementResult =
  { ok: true; result: GradeResult; extra: PlacementResult } | { ok: false; error: string };

/** Anonymous: nothing is stored. The "attempt" is only a client-side token. */
export async function startPlacement(): Promise<StartPlacementResult> {
  const quiz = getPlacementTest();
  if (!quiz) return { ok: false, error: "Тест временно недоступен" };
  return {
    ok: true,
    attemptId: "placement",
    questions: quiz.questions.map((question) => toPublicQuestion(question)),
  };
}

const submitSchema = z.record(
  z.string().max(64),
  z.union([z.string().max(64), z.array(z.string().max(64)).max(10)]),
);

export async function submitPlacement(answersInput: unknown): Promise<SubmitPlacementResult> {
  const parsed = submitSchema.safeParse(answersInput);
  const quiz = getPlacementTest();
  if (!parsed.success || !quiz) return { ok: false, error: "Не удалось проверить ответы" };
  const results = quiz.questions.map((question) =>
    gradeQuestion(question, parsed.data[question.id]),
  );
  const correctCount = results.filter((result) => result.correct).length;
  return {
    ok: true,
    result: {
      score: correctCount / results.length,
      correctCount,
      total: results.length,
      passed: true,
      results,
    },
    extra: scorePlacement(quiz, parsed.data),
  };
}
