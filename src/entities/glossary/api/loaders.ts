import { contentPath, memoize, readYaml } from "@/shared/content/index.server";
import { glossarySchema, type GlossaryTerm } from "../model/schema";

export function getGlossary(): GlossaryTerm[] {
  return memoize("glossary", () =>
    readYaml(contentPath("library", "glossary.yaml"), glossarySchema).terms.sort((a, b) =>
      a.term.localeCompare(b.term, "ru"),
    ),
  );
}

export function getTerm(idOrSlug: string): GlossaryTerm | null {
  return getGlossary().find((term) => term.id === idOrSlug || term.slug === idOrSlug) ?? null;
}
