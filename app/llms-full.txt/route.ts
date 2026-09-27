import { getAllLessons, getLessonContext } from "@/entities/course/index.server";
import { absoluteUrl, routes, siteConfig } from "@/shared/config";
import { mdxToMarkdown } from "@/shared/content/index.server";

/** Full lesson texts as Markdown for AI assistants. */
export function GET() {
  const parts = [`# ${siteConfig.name} — полные тексты уроков`, ""];
  for (const meta of getAllLessons()) {
    const context = getLessonContext(meta.levelSlug, meta.moduleSlug, meta.slug);
    if (!context) continue;
    parts.push(
      `# ${meta.title}`,
      "",
      `Источник: ${absoluteUrl(routes.lesson(meta.levelSlug, meta.moduleSlug, meta.slug))} · уровень ${context.level.title} · обновлено ${meta.revisedAt}`,
      "",
      meta.description,
      "",
      mdxToMarkdown(context.lesson.body),
      "",
      "---",
      "",
    );
  }
  return new Response(parts.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
