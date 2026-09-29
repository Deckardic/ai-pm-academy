"use server";

import { z } from "zod";
import {
  getPlacementTest,
  gradeQuestion,
  pickQuestions,
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

/**
 * Anonymous: nothing is stored. The attempt id is just the list of question ids
 * shown, so the result is scored on exactly those questions.
 */
export async function startPlacement(): Promise<StartPlacementResult> {
  const quiz = getPlacementTest();
  if (!quiz) return { ok: false, error: "Тест временно недоступен" };
  const questions = pickQuestions(quiz);
  return {
    ok: true,
    attemptId: questions.map((question) => question.id).join(","),
    questions: questions.map((question) => toPublicQuestion(question)),
  };
}

const submitSchema = z.record(
  z.string().max(64),
  z.union([z.string().max(64), z.array(z.string().max(64)).max(10)]),
);

const attemptSchema = z.string().max(4000);

export async function submitPlacement(
  attemptInput: unknown,
  answersInput: unknown,
): Promise<SubmitPlacementResult> {
  const parsed = submitSchema.safeParse(answersInput);
  const attempt = attemptSchema.safeParse(attemptInput);
  const quiz = getPlacementTest();
  if (!parsed.success || !attempt.success || !quiz) {
    return { ok: false, error: "Не удалось проверить ответы" };
  }
  const requested = new Set(attempt.data.split(","));
  const asked = quiz.questions.filter((question) => requested.has(question.id));
  if (asked.length === 0) return { ok: false, error: "Не удалось проверить ответы" };
  const results = asked.map((question) => gradeQuestion(question, parsed.data[question.id]));
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
    extra: scorePlacement(
      quiz,
      parsed.data,
      asked.map((question) => question.id),
    ),
  };
}
