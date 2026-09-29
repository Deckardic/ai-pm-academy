import Link from "next/link";
import { BookOpen, FileText } from "lucide-react";
import { getGlossary } from "@/entities/glossary/index.server";
import { getPrompts } from "@/entities/prompt/index.server";
import { getTemplates } from "@/entities/template/index.server";
import { PromptCard } from "@/features/copy-prompt";
import { routes } from "@/shared/config";

/** Library items linked to a lesson through their `lessonIds`, minus prompts already embedded in the body. */
export function LessonMaterials({ lessonId, body }: { lessonId: string; body: string }) {
  const embedded = new Set(
    [...body.matchAll(/<PromptCard\s+id="([^"]+)"/g)].map((match) => match[1]),
  );
  const prompts = getPrompts().filter(
    (prompt) => prompt.lessonIds.includes(lessonId) && !embedded.has(prompt.id),
  );
  const templates = getTemplates().filter((template) => template.lessonIds.includes(lessonId));
  const terms = getGlossary().filter((term) => term.lessonIds.includes(lessonId));
  if (prompts.length + templates.length + terms.length === 0) return null;

  return (
    <section aria-labelledby="lesson-materials" className="mt-12 flex max-w-[44rem] flex-col gap-6">
      <h2 id="lesson-materials" className="text-xl font-semibold tracking-tight">
        Материалы к уроку
      </h2>
      {prompts.length > 0 ? (
        <div className="flex flex-col gap-4">
          {prompts.slice(0, 2).map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} compact />
          ))}
          {prompts.length > 2 ? (
            <Link
              href={routes.prompts()}
              className="text-sm font-medium text-accent hover:underline"
            >
              Ещё промпты к уроку в библиотеке: {prompts.length - 2}
            </Link>
          ) : null}
        </div>
      ) : null}
      {templates.length > 0 ? (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-fg-muted">Шаблоны</h3>
          <ul className="flex flex-wrap gap-2">
            {templates.map((template) => (
              <li key={template.id}>
                <Link
                  href={routes.template(template.slug)}
                  className="inline-flex pressable items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium shadow-[inset_0_0_0_1px_var(--line-strong)] hover:bg-bg-subtle"
                >
                  <FileText aria-hidden className="size-3.5 text-accent" /> {template.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {terms.length > 0 ? (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-fg-muted">Термины</h3>
          <ul className="flex flex-wrap gap-2">
            {terms.map((term) => (
              <li key={term.id}>
                <Link
                  href={routes.glossaryTerm(term.slug)}
                  className="inline-flex pressable items-center gap-1.5 rounded-lg px-3 py-2 text-sm shadow-[inset_0_0_0_1px_var(--line)] hover:bg-bg-subtle"
                >
                  <BookOpen aria-hidden className="size-3.5 text-fg-subtle" /> {term.term}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
