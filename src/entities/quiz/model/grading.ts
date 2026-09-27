import type { Question, Quiz } from "./schema";
import type { Answers, GradeResult, PublicQuestion, QuestionResult } from "./public";

type Random = () => number;

export function shuffle<T>(items: readonly T[], random: Random = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

/** Order questions must never arrive in their correct order. */
function shuffleOrderItems<T>(items: readonly T[], random: Random): T[] {
  if (items.length < 2) return [...items];
  let shuffled = shuffle(items, random);
  for (let guard = 0; guard < 10 && shuffled.every((item, i) => item === items[i]); guard++) {
    shuffled = shuffle(items, random);
  }
  if (shuffled.every((item, i) => item === items[i])) shuffled = [...items].reverse();
  return shuffled;
}

export function pickQuestions(quiz: Quiz, random: Random = Math.random): Question[] {
  if (quiz.kind === "placement") return quiz.questions;
  return shuffle(quiz.questions, random).slice(0, quiz.questionsPerAttempt);
}

export function toPublicQuestion(question: Question, random: Random = Math.random): PublicQuestion {
  const base = { id: question.id, scenario: question.scenario, prompt: question.prompt };
  switch (question.type) {
    case "single":
      return { ...base, type: "single", options: shuffle(question.options, random) };
    case "multiple":
      return { ...base, type: "multiple", options: shuffle(question.options, random) };
    case "order":
      return { ...base, type: "order", items: shuffleOrderItems(question.items, random) };
  }
}

function sameSet(a: readonly string[], b: readonly string[]) {
  return a.length === b.length && a.every((value) => b.includes(value));
}

export function gradeQuestion(
  question: Question,
  answer: Answers[string] | undefined,
): QuestionResult {
  const base = {
    questionId: question.id,
    explanation: question.explanation,
    lessonId: question.lessonId,
  };
  switch (question.type) {
    case "single": {
      const option = question.options.find((o) => o.id === question.correct);
      return {
        ...base,
        correct: answer === question.correct,
        correctAnswer: option ? [option.text] : [],
      };
    }
    case "multiple": {
      const selected = Array.isArray(answer) ? answer : [];
      return {
        ...base,
        correct: sameSet(selected, question.correct),
        correctAnswer: question.options
          .filter((o) => question.correct.includes(o.id))
          .map((o) => o.text),
      };
    }
    case "order": {
      const order = Array.isArray(answer) ? answer : [];
      const expected = question.items.map((item) => item.id);
      return {
        ...base,
        correct:
          order.length === expected.length && order.every((value, i) => value === expected[i]),
        correctAnswer: question.items.map((item) => item.text),
      };
    }
  }
}

export function grade(quiz: Quiz, questionIds: readonly string[], answers: Answers): GradeResult {
  const questions = questionIds
    .map((questionId) => quiz.questions.find((question) => question.id === questionId))
    .filter((question): question is Question => question !== undefined);
  const results = questions.map((question) => gradeQuestion(question, answers[question.id]));
  const correctCount = results.filter((result) => result.correct).length;
  const total = results.length;
  const score = total === 0 ? 0 : correctCount / total;
  return { score, correctCount, total, passed: score >= quiz.passScore, results };
}

export type PlacementLevel = "junior" | "middle" | "senior";

export type PlacementResult = {
  recommended: PlacementLevel;
  byLevel: Record<PlacementLevel, { correct: number; total: number }>;
  byArea: Record<"pm" | "ai", { correct: number; total: number }>;
};

/**
 * Recommend the highest level whose questions (and everything below it) the
 * person answers at ≥ 70%. Senior content is not live yet, so a strong result
 * still recommends Middle and says Senior is next.
 */
export function scorePlacement(quiz: Quiz, answers: Answers): PlacementResult {
  const byLevel = {
    junior: { correct: 0, total: 0 },
    middle: { correct: 0, total: 0 },
    senior: { correct: 0, total: 0 },
  };
  const byArea = { pm: { correct: 0, total: 0 }, ai: { correct: 0, total: 0 } };

  for (const question of quiz.questions) {
    const result = gradeQuestion(question, answers[question.id]);
    const level = question.level ?? "junior";
    byLevel[level].total += 1;
    if (result.correct) byLevel[level].correct += 1;
    const area = question.area ?? "pm";
    byArea[area].total += 1;
    if (result.correct) byArea[area].correct += 1;
  }

  const ratio = (bucket: { correct: number; total: number }) =>
    bucket.total === 0 ? 1 : bucket.correct / bucket.total;

  let recommended: PlacementLevel = "junior";
  if (ratio(byLevel.junior) >= 0.7) recommended = "middle";
  if (recommended === "middle" && ratio(byLevel.middle) >= 0.7) recommended = "senior";

  return { recommended, byLevel, byArea };
}
