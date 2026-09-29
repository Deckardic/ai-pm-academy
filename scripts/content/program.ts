/**
 * Builds docs/PROGRAM.md — the human-readable course program — from module specs.
 *   pnpm content:program          # write the file
 *   pnpm content:program --check  # CI: fail if the file is out of date
 */
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { getLevels, getModules } from "@/entities/course/index.server";
import { formatDuration, pluralize } from "@/shared/lib";

const { values } = parseArgs({ options: { check: { type: "boolean", default: false } } });
const target = path.join(process.cwd(), "docs", "PROGRAM.md");

const lines: string[] = [
  "# Программа курса AI PM Academy",
  "",
  "> Файл генерируется из `content/course/**/_module.yaml` командой `pnpm content:program`. Не редактируйте вручную.",
  "",
];

for (const level of getLevels().filter((item) => item.status === "published")) {
  const modules = getModules(level.slug);
  const lessons = modules.flatMap((mod) => mod.lessonsPlan);
  const minutes = lessons.reduce((sum, lesson) => sum + lesson.durationMin, 0);
  lines.push(
    `## ${level.title}: ${level.tagline}`,
    "",
    level.description,
    "",
    `**${modules.length} ${pluralize(modules.length, ["модуль", "модуля", "модулей"])} · ${lessons.length} ${pluralize(lessons.length, ["урок", "урока", "уроков"])} · ≈${formatDuration(minutes).replace(/ /g, " ")} чтения**`,
    "",
  );
  for (const mod of modules) {
    const published = new Set(mod.lessons.map((lesson) => lesson.slug));
    lines.push(`### ${mod.id.toUpperCase()}. ${mod.title}`, "", mod.summary, "");
    lines.push(`**Цели:** ${mod.goals.join("; ")}.`, "");
    mod.lessonsPlan.forEach((plan, index) => {
      const status = published.has(plan.slug) ? "✅ опубликован" : "⏳ к генерации";
      lines.push(
        `${index + 1}. **${plan.title}** — ${plan.focus} (${plan.durationMin} мин, ${status})`,
      );
      for (const point of plan.keyPoints) lines.push(`   - ${point}`);
      if (plan.aiAngle) lines.push(`   - *ИИ:* ${plan.aiAngle}`);
      if (plan.practice) lines.push(`   - *Практика:* ${plan.practice}`);
    });
    lines.push("");
    if (mod.assignment) {
      lines.push(
        `**Практическое задание — ${mod.assignment.title}.** ${mod.assignment.brief} *Результат:* ${mod.assignment.deliverable}.`,
        "",
      );
    }
    if (mod.quizFocus.length > 0)
      lines.push(`**Тест модуля проверяет:** ${mod.quizFocus.join("; ")}.`, "");
  }
}

const output = `${lines.join("\n").trimEnd()}\n`;
if (values.check) {
  const current = fs.existsSync(target) ? fs.readFileSync(target, "utf8") : "";
  if (current !== output) {
    console.error("docs/PROGRAM.md устарел — выполните pnpm content:program");
    process.exit(1);
  }
  console.log("✓ docs/PROGRAM.md актуален");
} else {
  fs.writeFileSync(target, output);
  console.log(`✓ docs/PROGRAM.md обновлён`);
}
