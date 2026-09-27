/**
 * Cross-review by a model from a different vendor (see PRD 10.1).
 *
 *   pnpm content:review --module j02
 *   pnpm content:review --lesson j02-01
 *
 * Exits with code 1 if any critical issue is found, so CI can gate on it.
 */
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { getAllLessons } from "@/entities/course/index.server";
import { contentPath } from "@/shared/content/index.server";
import { chat, llmConfig, unfence } from "./lib/llm";
import { reviewSystemPrompt } from "./lib/prompts";

type Issue = {
  severity: "critical" | "major" | "minor";
  quote: string;
  problem: string;
  fix: string;
};

const { values } = parseArgs({
  options: { module: { type: "string" }, lesson: { type: "string" } },
});

/** Cheap local check before spending tokens: numbers that look like statistics need a source. */
function unsourcedNumbers(body: string, hasSources: boolean): Issue[] {
  if (hasSources) return [];
  const matches = body.match(/[^.\n]*\b\d{2,3}\s?%[^.\n]*/g) ?? [];
  return matches.map((quote) => ({
    severity: "major" as const,
    quote: quote.trim(),
    problem: "Процент без источника",
    fix: "Добавьте источник в sources или уберите цифру",
  }));
}

async function main() {
  const lessons = getAllLessons().filter(
    (lesson) =>
      (!values.module || lesson.moduleId === values.module) &&
      (!values.lesson || lesson.id === values.lesson),
  );
  if (lessons.length === 0)
    throw new Error("Нет уроков для проверки (учтите: черновики видны с CONTENT_PREVIEW=1)");
  const styleGuide = fs.readFileSync(contentPath("_meta", "style-guide.md"), "utf8");
  const config = llmConfig("CONTENT_REVIEW");
  const reportDir = contentPath("_reports");
  fs.mkdirSync(reportDir, { recursive: true });
  let critical = 0;

  for (const lesson of lessons) {
    const source = fs.readFileSync(lesson.file, "utf8");
    const local = unsourcedNumbers(source, lesson.sources.length > 0);
    const raw = unfence(
      await chat(
        config,
        [
          { role: "system", content: reviewSystemPrompt(styleGuide) },
          { role: "user", content: source },
        ],
        { temperature: 0 },
      ),
    );
    let issues: Issue[] = [];
    try {
      issues = (JSON.parse(raw) as { issues: Issue[] }).issues;
    } catch {
      issues = [
        { severity: "major", quote: "", problem: "Ревьюер вернул не-JSON", fix: raw.slice(0, 300) },
      ];
    }
    const all = [...local, ...issues];
    critical += all.filter((issue) => issue.severity === "critical").length;
    fs.writeFileSync(
      path.join(reportDir, `${lesson.id}.json`),
      JSON.stringify({ lesson: lesson.id, model: config.model, issues: all }, null, 2),
    );
    const summary =
      all.length === 0
        ? "замечаний нет"
        : all.map((issue) => `[${issue.severity}] ${issue.problem}`).join("; ");
    console.log(
      `${all.some((issue) => issue.severity === "critical") ? "✗" : "✓"} ${lesson.id}: ${summary}`,
    );
  }
  console.log(`\nОтчёты: content/_reports/. Критичных замечаний: ${critical}`);
  if (critical > 0) process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
