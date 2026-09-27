import path from "node:path";
import { contentPath, listFiles, memoize, readYaml } from "@/shared/content/index.server";
import { templateSchema, type Template } from "../model/schema";

const DIR = contentPath("library", "templates");

export function getTemplates(): Template[] {
  return memoize("templates", () =>
    listFiles(DIR, ".yaml").map((name) => readYaml(path.join(DIR, name), templateSchema)),
  );
}

export function getTemplate(slug: string): Template | null {
  return getTemplates().find((template) => template.slug === slug) ?? null;
}
