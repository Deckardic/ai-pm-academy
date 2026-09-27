/**
 * Pure progress math, shared by the dashboard, level and module pages.
 * Works on plain ids so it has no dependency on the course entity.
 */
export type ProgressModuleInput = {
  id: string;
  quizId: string | null;
  lessonIds: string[];
  status: "published" | "planned";
};

export type LevelProgress = {
  lessonsDone: number;
  lessonsTotal: number;
  quizzesPassed: number;
  quizzesTotal: number;
  /** 0..1 — lessons and tests weighted equally per item. */
  ratio: number;
  /** Every published module test is passed — the exam unlocks. */
  examUnlocked: boolean;
  nextLessonId: string | null;
};

export function computeLevelProgress(
  modules: ProgressModuleInput[],
  completedLessonIds: ReadonlySet<string> | ReadonlyMap<string, unknown>,
  passedQuizIds: ReadonlySet<string>,
): LevelProgress {
  const published = modules.filter((module) => module.status === "published");
  const lessonIds = published.flatMap((module) => module.lessonIds);
  const quizIds = published
    .map((module) => module.quizId)
    .filter((id): id is string => id !== null);
  const lessonsDone = lessonIds.filter((id) => completedLessonIds.has(id)).length;
  const quizzesPassed = quizIds.filter((id) => passedQuizIds.has(id)).length;
  const total = lessonIds.length + quizIds.length;
  return {
    lessonsDone,
    lessonsTotal: lessonIds.length,
    quizzesPassed,
    quizzesTotal: quizIds.length,
    ratio: total === 0 ? 0 : (lessonsDone + quizzesPassed) / total,
    examUnlocked: quizIds.length > 0 && quizzesPassed === quizIds.length,
    nextLessonId: lessonIds.find((id) => !completedLessonIds.has(id)) ?? null,
  };
}
