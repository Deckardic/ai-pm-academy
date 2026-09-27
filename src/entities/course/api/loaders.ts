import path from "node:path";
import {
  ContentError,
  contentPath,
  exists,
  listDirs,
  listFiles,
  memoize,
  readMdx,
  readYaml,
} from "@/shared/content/index.server";
import {
  assignmentFrontmatterSchema,
  lessonFrontmatterSchema,
  levelSchema,
  moduleSchema,
} from "../model/schema";
import type { Assignment, Lesson, LessonContext, LessonMeta, Level, Module } from "../model/types";

const COURSE_DIR = contentPath("course");
const showDrafts = process.env.CONTENT_PREVIEW === "1";

function isLessonFile(name: string) {
  return !name.startsWith("assignment");
}

export function getLevels(): Level[] {
  return memoize("levels", () =>
    listDirs(COURSE_DIR)
      .map((dir) => {
        const file = path.join(COURSE_DIR, dir, "_level.yaml");
        if (!exists(file)) throw new ContentError(file, "missing _level.yaml");
        return { ...readYaml(file, levelSchema), dir: path.join(COURSE_DIR, dir) };
      })
      .sort((a, b) => a.order - b.order),
  );
}

export function getLevel(slug: string): Level | null {
  return getLevels().find((level) => level.slug === slug) ?? null;
}

function readLessonMetas(level: Level, moduleDir: string, moduleSlug: string, moduleId: string) {
  return listFiles(moduleDir, ".mdx")
    .filter(isLessonFile)
    .map((name): LessonMeta => {
      const file = path.join(moduleDir, name);
      const { frontmatter } = readMdx(file, lessonFrontmatterSchema);
      return { ...frontmatter, levelSlug: level.slug, moduleSlug, moduleId, file };
    })
    .filter((lesson) => showDrafts || !lesson.draft);
}

export function getModules(levelSlug: string): Module[] {
  return memoize(`modules:${levelSlug}`, () => {
    const level = getLevel(levelSlug);
    if (!level) return [];
    return listDirs(level.dir)
      .map((dir): Module => {
        const moduleDir = path.join(level.dir, dir);
        const file = path.join(moduleDir, "_module.yaml");
        if (!exists(file)) throw new ContentError(file, "missing _module.yaml");
        const data = readYaml(file, moduleSchema);
        const lessons =
          data.status === "published" ? readLessonMetas(level, moduleDir, data.slug, data.id) : [];
        return {
          ...data,
          levelId: level.id,
          levelSlug: level.slug,
          dir: moduleDir,
          lessons,
          hasQuiz: data.status === "published" && exists(path.join(moduleDir, "quiz.yaml")),
          hasAssignment:
            data.status === "published" && exists(path.join(moduleDir, "assignment.mdx")),
        };
      })
      .sort((a, b) => a.order - b.order);
  });
}

export function getModule(levelSlug: string, moduleSlug: string): Module | null {
  return getModules(levelSlug).find((mod) => mod.slug === moduleSlug) ?? null;
}

export function getAllModules(): Module[] {
  return getLevels().flatMap((level) => getModules(level.slug));
}

export function getModuleById(id: string): Module | null {
  return getAllModules().find((mod) => mod.id === id) ?? null;
}

export function getAllLessons(): LessonMeta[] {
  return getAllModules().flatMap((mod) => mod.lessons);
}

export function getLessonById(id: string): LessonMeta | null {
  return getAllLessons().find((lesson) => lesson.id === id) ?? null;
}

export function getLessonContext(
  levelSlug: string,
  moduleSlug: string,
  lessonSlug: string,
): LessonContext | null {
  const level = getLevel(levelSlug);
  const mod = getModule(levelSlug, moduleSlug);
  if (!level || !mod) return null;
  const index = mod.lessons.findIndex((lesson) => lesson.slug === lessonSlug);
  if (index === -1) return null;
  const meta = mod.lessons[index]!;

  // Neighbours continue across module boundaries within a level.
  const levelLessons = getModules(levelSlug).flatMap((m) => m.lessons);
  const flatIndex = levelLessons.findIndex((lesson) => lesson.id === meta.id);
  const { body } = readMdx(meta.file, lessonFrontmatterSchema);
  const lesson: Lesson = { ...meta, body };
  return {
    level,
    module: mod,
    lesson,
    prev: levelLessons[flatIndex - 1] ?? null,
    next: levelLessons[flatIndex + 1] ?? null,
  };
}

export function getAssignment(mod: Module): Assignment | null {
  const file = path.join(mod.dir, "assignment.mdx");
  if (!mod.hasAssignment || !exists(file)) return null;
  const { frontmatter, body } = readMdx(file, assignmentFrontmatterSchema);
  const solutionFile = path.join(mod.dir, "_solution.mdx");
  const solution = exists(solutionFile)
    ? readMdx(solutionFile, assignmentFrontmatterSchema.pick({ id: true })).body
    : null;
  return { ...frontmatter, body, solution, moduleId: mod.id };
}

export function getAllAssignments(): Assignment[] {
  return getAllModules()
    .map((mod) => getAssignment(mod))
    .filter((assignment): assignment is Assignment => assignment !== null);
}

export type CourseStats = {
  lessons: number;
  modulesPublished: number;
  modulesTotal: number;
  minutes: number;
  assignments: number;
};

export function getCourseStats(levelSlug?: string): CourseStats {
  const modules = levelSlug ? getModules(levelSlug) : getAllModules();
  const lessons = modules.flatMap((mod) => mod.lessons);
  return {
    lessons: lessons.length,
    modulesPublished: modules.filter((mod) => mod.status === "published").length,
    modulesTotal: modules.length,
    minutes: lessons.reduce((sum, lesson) => sum + lesson.durationMin, 0),
    assignments: modules.filter((mod) => mod.hasAssignment).length,
  };
}

/** Everything the content version depends on — stored with attempts and certificates. */
export function getContentVersion(): string {
  return process.env.CONTENT_VERSION ?? process.env.GIT_COMMIT_SHA ?? "dev";
}
