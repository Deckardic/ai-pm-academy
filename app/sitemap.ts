import type { MetadataRoute } from "next";
import { getAllLessons, getAllModules, getLevels } from "@/entities/course/index.server";
import { getGlossary } from "@/entities/glossary/index.server";
import { getTemplates } from "@/entities/template/index.server";
import { absoluteUrl, routes } from "@/shared/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const lessons = getAllLessons();
  const latest = lessons.reduce(
    (max, lesson) => (lesson.revisedAt > max ? lesson.revisedAt : max),
    "2026-01-01",
  );
  const page = (path: string, priority: number, lastModified: string = latest) => ({
    url: absoluteUrl(path),
    lastModified,
    priority,
  });
  return [
    page(routes.home(), 1),
    page(routes.catalog(), 0.9),
    page(routes.placementTest(), 0.7),
    ...getLevels().map((level) =>
      page(routes.level(level.slug), level.status === "published" ? 0.9 : 0.5),
    ),
    ...getAllModules()
      .filter((module) => module.status === "published")
      .map((module) => page(routes.module(module.levelSlug, module.slug), 0.8)),
    ...lessons.map((lesson) =>
      page(routes.lesson(lesson.levelSlug, lesson.moduleSlug, lesson.slug), 0.8, lesson.revisedAt),
    ),
    page(routes.prompts(), 0.8),
    page(routes.templates(), 0.7),
    ...getTemplates().map((template) => page(routes.template(template.slug), 0.6)),
    page(routes.glossary(), 0.7),
    ...getGlossary().map((term) => page(routes.glossaryTerm(term.slug), 0.5)),
    page(routes.about(), 0.4),
  ];
}
