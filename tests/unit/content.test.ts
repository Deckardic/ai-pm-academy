import { describe, expect, it } from "vitest";
import {
  getAllAssignments,
  getAllLessons,
  getAllModules,
  getLessonContext,
  getLevels,
} from "@/entities/course/index.server";
import { getGlossary } from "@/entities/glossary/index.server";
import { getPrompts } from "@/entities/prompt/index.server";
import { getLevelExam, getModuleQuiz, getPlacementTest } from "@/entities/quiz/index.server";
import { getTemplates } from "@/entities/template/index.server";

describe("content", () => {
  it("loads every level, mod, lesson and assignment against the schemas", () => {
    expect(getLevels().map((level) => level.id)).toEqual(["junior", "middle", "senior"]);
    expect(getAllModules().length).toBeGreaterThanOrEqual(24);
    expect(getAllLessons().length).toBeGreaterThan(0);
    expect(() => getAllAssignments()).not.toThrow();
  });

  it("has unique lesson ids with the mod prefix", () => {
    const lessons = getAllLessons();
    expect(new Set(lessons.map((lesson) => lesson.id)).size).toBe(lessons.length);
    for (const lesson of lessons) expect(lesson.id.startsWith(`${lesson.moduleId}-`)).toBe(true);
  });

  it("resolves neighbours across the level", () => {
    const [first] = getAllLessons();
    const context = getLessonContext(first!.levelSlug, first!.moduleSlug, first!.slug);
    expect(context?.prev).toBeNull();
    expect(context?.next).not.toBeNull();
  });

  it("gives every published mod with a quiz a matching quiz id", () => {
    for (const mod of getAllModules().filter((item) => item.hasQuiz)) {
      expect(getModuleQuiz(mod.dir)?.id).toBe(`${mod.id}-quiz`);
    }
  });

  it("has an exam with a 3× question pool for every published level", () => {
    for (const level of getLevels().filter((item) => item.status === "published")) {
      const exam = getLevelExam(level.dir);
      expect(exam).not.toBeNull();
      expect(exam!.questions.length).toBeGreaterThanOrEqual(exam!.questionsPerAttempt * 3);
    }
  });

  it("loads the library and placement test", () => {
    expect(getPrompts().length).toBeGreaterThan(0);
    expect(getTemplates().length).toBeGreaterThan(0);
    expect(getGlossary().length).toBeGreaterThan(0);
    expect(getPlacementTest()?.questions.every((question) => question.level)).toBe(true);
  });

  it("applies Russian typography to display text", () => {
    const junior = getLevels()[0]!;
    expect(junior.description).toContain("—");
    expect(junior.description).not.toContain(" - ");
  });
});
