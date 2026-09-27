import path from "node:path";
import { contentPath, exists, memoize, readYaml } from "@/shared/content/index.server";
import { quizSchema, type Quiz } from "../model/schema";

export function loadQuiz(file: string): Quiz | null {
  if (!exists(file)) return null;
  return memoize(`quiz:${file}`, () => readYaml(file, quizSchema));
}

/** Module test lives next to the lessons: <module dir>/quiz.yaml */
export function getModuleQuiz(moduleDir: string): Quiz | null {
  return loadQuiz(path.join(moduleDir, "quiz.yaml"));
}

/** Final exam lives in the level folder: <level dir>/_exam.yaml */
export function getLevelExam(levelDir: string): Quiz | null {
  return loadQuiz(path.join(levelDir, "_exam.yaml"));
}

export function getPlacementTest(): Quiz | null {
  return loadQuiz(contentPath("placement-test.yaml"));
}
