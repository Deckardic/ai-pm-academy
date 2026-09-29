/**
 * Content validation — runs in CI on every PR (pnpm content:validate).
 * Schemas are enforced by the loaders; this script adds cross-references,
 * uniqueness, MDX compilation and freshness checks.
 */
import { compile } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import {
  getAllAssignments,
  getAllLessons,
  getAllModules,
  getLevels,
} from "@/entities/course/index.server";
import { getLevelExam, getModuleQuiz, getPlacementTest } from "@/entities/quiz/index.server";
import { getPrompts } from "@/entities/prompt/index.server";
import { getTemplates } from "@/entities/template/index.server";
import { getGlossary } from "@/entities/glossary/index.server";
import { lessonComponentNames } from "../../src/widgets/lesson-body/model/component-names";

const errors: string[] = [];
const warnings: string[] = [];
const error = (message: string) => errors.push(message);
const warn = (message: string) => warnings.push(message);

function unique<T>(items: T[], key: (item: T) => string, label: string) {
  const seen = new Set<string>();
  for (const item of items) {
    const value = key(item);
    if (seen.has(value)) error(`Повторяющийся ${label}: ${value}`);
    seen.add(value);
  }
}

async function main() {
  const levels = getLevels();
  const modules = getAllModules();
  const lessons = getAllLessons();
  const lessonIds = new Set(lessons.map((lesson) => lesson.id));
  const prompts = getPrompts();
  const promptIds = new Set(prompts.map((prompt) => prompt.id));
  const templates = getTemplates();
  const templateSlugs = new Set(templates.map((template) => template.slug));
  const glossary = getGlossary();
  const termIds = new Set(glossary.map((term) => term.id));

  unique(levels, (level) => level.slug, "slug уровня");
  unique(modules, (mod) => mod.id, "id модуля");
  unique(lessons, (lesson) => lesson.id, "id урока");
  unique(prompts, (prompt) => prompt.id, "id промпта");
  unique(templates, (template) => template.slug, "slug шаблона");
  unique(glossary, (term) => term.slug, "slug термина");

  for (const level of levels) {
    const levelModules = modules.filter((mod) => mod.levelSlug === level.slug);
    unique(levelModules, (mod) => mod.slug, `slug модуля в ${level.slug}`);
    if (level.status === "published") {
      if (!levelModules.some((mod) => mod.status === "published")) {
        error(`Уровень ${level.slug} опубликован, но в нём нет опубликованных модулей`);
      }
      if (!getLevelExam(level.dir)) error(`У опубликованного уровня ${level.slug} нет _exam.yaml`);
    }
  }

  for (const mod of modules) {
    if (!mod.id.startsWith(mod.levelId[0]!)) {
      error(`Модуль ${mod.id}: префикс id не соответствует уровню ${mod.levelId}`);
    }
    unique(mod.lessons, (lesson) => lesson.slug, `slug урока в ${mod.id}`);
    unique(mod.lessonsPlan, (plan) => plan.slug, `slug в плане ${mod.id}`);
    if (mod.lessonsPlan.length === 0) warn(`Модуль ${mod.id}: нет плана уроков (lessonsPlan)`);
    mod.lessons.forEach((lesson, index) => {
      const plan = mod.lessonsPlan[index];
      if (!plan) warn(`Урок ${lesson.id} не описан в плане модуля ${mod.id}`);
      else if (plan.slug !== lesson.slug) {
        error(`Урок ${lesson.id}: slug «${lesson.slug}» не совпадает с планом («${plan.slug}») на позиции ${index + 1}`);
      }
    });
    if (mod.status === "published") {
      if (mod.lessons.length === 0) error(`Модуль ${mod.id} опубликован, но в нём нет уроков`);
      const quiz = getModuleQuiz(mod.dir);
      if (!quiz) warn(`Модуль ${mod.id} опубликован без теста (quiz.yaml)`);
      if (quiz && quiz.id !== `${mod.id}-quiz`)
        error(`Тест модуля ${mod.id}: id должен быть «${mod.id}-quiz»`);
      if (quiz && quiz.kind !== "module") error(`Тест модуля ${mod.id}: kind должен быть mod`);
      for (const question of quiz?.questions ?? []) {
        if (question.lessonId && !lessonIds.has(question.lessonId)) {
          error(`Тест ${mod.id}, вопрос ${question.id}: нет урока ${question.lessonId}`);
        }
      }
    }
    for (const lesson of mod.lessons) {
      if (!lesson.id.startsWith(`${mod.id}-`)) {
        error(`Урок ${lesson.id} лежит в модуле ${mod.id}, но его id с другим префиксом`);
      }
    }
  }

  for (const level of levels) {
    for (const question of getLevelExam(level.dir)?.questions ?? []) {
      if (question.lessonId && !lessonIds.has(question.lessonId)) {
        error(`Экзамен ${level.slug}, вопрос ${question.id}: нет урока ${question.lessonId}`);
      }
    }
  }

  const placement = getPlacementTest();
  if (!placement) error("Нет content/placement-test.yaml");
  else if (placement.questions.some((question) => !question.level)) {
    error("У каждого вопроса теста на уровень должно быть поле level");
  }

  getAllAssignments();

  const knownComponents = new Set<string>(lessonComponentNames);
  const today = Date.now();
  for (const lesson of getAllLessons()) {
    const { readFileSync } = await import("node:fs");
    const body = readFileSync(lesson.file, "utf8").replace(/^---[\s\S]*?---/, "");
    try {
      await compile(body, { remarkPlugins: [remarkGfm] });
    } catch (cause) {
      error(`Урок ${lesson.id}: MDX не компилируется — ${(cause as Error).message}`);
      continue;
    }
    for (const match of body.matchAll(/<([A-Z][A-Za-z]*)/g)) {
      if (!knownComponents.has(match[1]!))
        error(`Урок ${lesson.id}: неизвестный компонент <${match[1]}>`);
    }
    for (const match of body.matchAll(/<PromptCard\s+id="([^"]+)"/g)) {
      if (!promptIds.has(match[1]!)) error(`Урок ${lesson.id}: нет промпта «${match[1]}»`);
    }
    for (const match of body.matchAll(/<Term\s+id="([^"]+)"/g)) {
      if (!termIds.has(match[1]!))
        error(`Урок ${lesson.id}: нет термина «${match[1]}» в глоссарии`);
    }
    for (const match of body.matchAll(/<TemplateLink\s+slug="([^"]+)"/g)) {
      if (!templateSlugs.has(match[1]!)) error(`Урок ${lesson.id}: нет шаблона «${match[1]}»`);
    }
    const ageDays = (today - new Date(lesson.revisedAt).getTime()) / 86_400_000;
    if (lesson.aiTopic && ageDays > 90) {
      warn(`Урок ${lesson.id} про ИИ не пересматривался ${Math.floor(ageDays)} дней`);
    }
  }

  for (const prompt of prompts) {
    for (const id of prompt.lessonIds)
      if (!lessonIds.has(id)) error(`Промпт ${prompt.id}: нет урока ${id}`);
    const declared = new Set(prompt.variables.map((variable) => variable.name));
    for (const match of prompt.body.matchAll(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g)) {
      if (!declared.has(match[1]!))
        error(`Промпт ${prompt.id}: переменная {{${match[1]}}} не описана`);
    }
  }
  for (const template of templates) {
    for (const id of template.lessonIds)
      if (!lessonIds.has(id)) error(`Шаблон ${template.slug}: нет урока ${id}`);
  }
  for (const term of glossary) {
    for (const id of term.related)
      if (!termIds.has(id)) error(`Термин ${term.id}: нет связанного термина ${id}`);
    for (const id of term.lessonIds)
      if (!lessonIds.has(id)) error(`Термин ${term.id}: нет урока ${id}`);
  }

  for (const message of warnings) console.warn(`⚠ ${message}`);
  if (errors.length > 0) {
    for (const message of errors) console.error(`✗ ${message}`);
    console.error(`\nКонтент не прошёл проверку: ${errors.length} ошибок.`);
    process.exit(1);
  }
  console.log(
    `✓ Контент в порядке: уровней — ${levels.length}, модулей — ${modules.length}, уроков — ${lessons.length}, ` +
      `промптов — ${prompts.length}, шаблонов — ${templates.length}, терминов — ${glossary.length}.`,
  );
}

main().catch((cause) => {
  console.error(cause instanceof Error ? cause.message : cause);
  process.exit(1);
});
