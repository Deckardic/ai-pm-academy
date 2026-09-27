import { getLessonContext, getLevels, getModules } from "@/entities/course/index.server";
import { getPrompts } from "@/entities/prompt/index.server";
import { getTemplates } from "@/entities/template/index.server";
import { absoluteUrl, routes, siteConfig } from "@/shared/config";

/** https://llmstxt.org — a map of the site for AI assistants (GEO). Generated from content at build. */
export function GET() {
  const lines: string[] = [
    `# ${siteConfig.name}`,
    "",
    `> ${siteConfig.description}`,
    "",
    "Бесплатный курс на русском языке. Каждая тема: фундамент управления проектами → как это делают сегодня с ИИ → практика. Уроки открыты без регистрации.",
    "",
  ];
  for (const level of getLevels()) {
    lines.push(`## ${level.title}: ${level.tagline}`, "", level.description, "");
    for (const mod of getModules(level.slug).filter((item) => item.status === "published")) {
      for (const lesson of mod.lessons) {
        const context = getLessonContext(lesson.levelSlug, lesson.moduleSlug, lesson.slug);
        if (!context) continue;
        lines.push(
          `- [${lesson.title}](${absoluteUrl(routes.lesson(lesson.levelSlug, lesson.moduleSlug, lesson.slug))}): ${lesson.description}`,
        );
      }
    }
    lines.push("");
  }
  lines.push("## Библиотека", "");
  lines.push(
    `- [Промпты для проект-менеджера](${absoluteUrl(routes.prompts())}): ${getPrompts()
      .map((prompt) => prompt.title)
      .join("; ")}`,
  );
  for (const template of getTemplates()) {
    lines.push(
      `- [Шаблон: ${template.title}](${absoluteUrl(routes.template(template.slug))}): ${template.summary}`,
    );
  }
  lines.push(
    `- [Глоссарий](${absoluteUrl(routes.glossary())}): термины управления проектами и ИИ`,
    "",
  );
  lines.push(
    "## Optional",
    "",
    `- [Полные тексты уроков](${absoluteUrl("/llms-full.txt")})`,
    `- [О проекте](${absoluteUrl(routes.about())})`,
    "",
  );
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
