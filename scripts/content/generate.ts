/**
 * Generates missing lessons and the module test from a module spec.
 *
 *   pnpm content:generate --module j02            # all missing lessons + quiz
 *   pnpm content:generate --module j02 --dry-run  # print prompts, write nothing
 *
 * Output is written as draft (draft: true). Then: pnpm content:review → fix →
 * pnpm content:validate → PR. Publishing = setting status: published + draft: false.
 */
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import { getAllModules, getLevel, lessonFrontmatterSchema } from "@/entities/course/index.server";
import { getGlossary } from "@/entities/glossary/index.server";
import { getPrompts } from "@/entities/prompt/index.server";
import { quizSchema } from "@/entities/quiz/index.server";
import { contentPath } from "@/shared/content/index.server";
import { lessonComponentNames } from "../../src/widgets/lesson-body/model/component-names";
import { chat, llmConfig, unfence, type ChatMessage } from "./lib/llm";
import {
  lessonSystemPrompt,
  lessonUserPrompt,
  PROMPT_VERSION,
  QUIZ_SCHEMA_HINT,
  quizSystemPrompt,
} from "./lib/prompts";

const { values } = parseArgs({
  options: {
    module: { type: "string" },
    "dry-run": { type: "boolean", default: false },
    "skip-quiz": { type: "boolean", default: false },
  },
});

const MAX_ATTEMPTS = 3;
const today = new Date().toISOString().slice(0, 10);

function frontmatterErrors(source: string): string | null {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);
  if (!match) return "Нет frontmatter";
  const result = lessonFrontmatterSchema.safeParse(parseYaml(match[1]!));
  return result.success
    ? null
    : result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
}

async function generateWithRetry(
  messages: ChatMessage[],
  validate: (text: string) => string | null,
) {
  const config = llmConfig("CONTENT_LLM");
  const history = [...messages];
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const text = unfence(await chat(config, history));
    const problem = validate(text);
    if (!problem) return { text, model: config.model };
    console.warn(`  попытка ${attempt}: ${problem}`);
    history.push(
      { role: "assistant", content: text },
      { role: "user", content: `Исправь ошибки и пришли файл целиком: ${problem}` },
    );
  }
  throw new Error("Не удалось получить валидный результат");
}

async function main() {
  const moduleId = values.module;
  if (!moduleId) throw new Error("Укажите модуль: --module j02");
  const mod = getAllModules().find((item) => item.id === moduleId);
  if (!mod) throw new Error(`Модуль ${moduleId} не найден`);
  const level = getLevel(mod.levelSlug)!;
  const styleGuide = fs.readFileSync(contentPath("_meta", "style-guide.md"), "utf8");
  const template = fs.readFileSync(contentPath("_meta", "lesson-template.mdx"), "utf8");
  const system = lessonSystemPrompt(styleGuide, template, lessonComponentNames);
  const existing = fs.readdirSync(mod.dir).filter((name) => /^\d{2}-.*\.mdx$/.test(name));
  let model = "";

  for (const [index, plan] of mod.lessonsPlan.entries()) {
    const number = String(index + 1).padStart(2, "0");
    if (existing.some((name) => name.startsWith(`${number}-`))) {
      console.log(`✓ ${number} «${plan.title}» уже есть`);
      continue;
    }
    const lessonId = `${mod.id}-${number}`;
    const user = lessonUserPrompt({
      levelTitle: level.title,
      levelTagline: level.tagline,
      moduleTitle: mod.title,
      moduleSummary: mod.summary,
      moduleGoals: mod.goals,
      keyConcepts: mod.keyConcepts,
      searchQueries: mod.searchQueries,
      lessonTitle: plan.title,
      lessonFocus: plan.focus,
      lessonId,
      otherLessons: mod.lessonsPlan.filter((item) => item !== plan).map((item) => item.title),
      promptIds: getPrompts().map((prompt) => prompt.id),
      termIds: getGlossary().map((term) => term.id),
      today,
    });
    if (values["dry-run"]) {
      console.log(`\n--- ${lessonId} ---\n${user}`);
      continue;
    }
    console.log(`→ генерирую ${lessonId} «${plan.title}»`);
    const result = await generateWithRetry(
      [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      frontmatterErrors,
    );
    model = result.model;
    const slug = /^slug:\s*(\S+)/m.exec(result.text)?.[1] ?? lessonId;
    fs.writeFileSync(path.join(mod.dir, `${number}-${slug}.mdx`), `${result.text}\n`);
  }

  const quizFile = path.join(mod.dir, "quiz.yaml");
  if (!values["skip-quiz"] && !values["dry-run"] && !fs.existsSync(quizFile)) {
    const lessons = fs
      .readdirSync(mod.dir)
      .filter((name) => /^\d{2}-.*\.mdx$/.test(name))
      .map((name) => fs.readFileSync(path.join(mod.dir, name), "utf8"));
    console.log("→ генерирую тест модуля");
    const result = await generateWithRetry(
      [
        { role: "system", content: quizSystemPrompt(QUIZ_SCHEMA_HINT) },
        {
          role: "user",
          content: `Модуль ${mod.id} «${mod.title}». Составь 8 вопросов, questionsPerAttempt: 5.\n\nУроки:\n\n${lessons.join("\n\n---\n\n")}`,
        },
      ],
      (text) => {
        try {
          const parsed = quizSchema.safeParse(parseYaml(text));
          return parsed.success
            ? null
            : parsed.error.issues
                .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
                .join("; ");
        } catch (error) {
          return `YAML: ${(error as Error).message}`;
        }
      },
    );
    model = result.model;
    fs.writeFileSync(quizFile, `${result.text}\n`);
  }

  if (model) {
    const specFile = path.join(mod.dir, "_module.yaml");
    const spec = parseYaml(fs.readFileSync(specFile, "utf8")) as Record<string, unknown>;
    spec.generation = { model, promptVersion: PROMPT_VERSION, generatedAt: today };
    fs.writeFileSync(specFile, stringifyYaml(spec, { lineWidth: 100 }));
    console.log(
      "\nГотово. Дальше: pnpm content:review --module",
      mod.id,
      "→ pnpm content:validate",
    );
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
