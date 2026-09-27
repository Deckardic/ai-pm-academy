import type { z } from "zod";
import type {
  assignmentFrontmatterSchema,
  lessonFrontmatterSchema,
  levelSchema,
  moduleSchema,
} from "./schema";

export type { LevelId } from "./schema";

export type Level = z.output<typeof levelSchema> & {
  dir: string;
};

export type LessonMeta = z.output<typeof lessonFrontmatterSchema> & {
  levelSlug: string;
  moduleSlug: string;
  moduleId: string;
  file: string;
};

export type Module = z.output<typeof moduleSchema> & {
  levelId: Level["id"];
  levelSlug: string;
  dir: string;
  lessons: LessonMeta[];
  hasQuiz: boolean;
  hasAssignment: boolean;
};

export type Lesson = LessonMeta & {
  body: string;
};

export type Assignment = z.output<typeof assignmentFrontmatterSchema> & {
  body: string;
  solution: string | null;
  moduleId: string;
};

export type LessonContext = {
  level: Level;
  module: Module;
  lesson: Lesson;
  prev: LessonMeta | null;
  next: LessonMeta | null;
};
