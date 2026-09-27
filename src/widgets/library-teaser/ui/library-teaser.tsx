import { ArrowRight } from "lucide-react";
import type { Prompt } from "@/entities/prompt";
import { PromptCard } from "@/features/copy-prompt";
import { routes } from "@/shared/config";
import { ButtonLink, Container, Reveal } from "@/shared/ui";

export function LibraryTeaser({
  prompt,
  counts,
}: {
  prompt: Prompt;
  counts: { prompts: number; templates: number };
}) {
  return (
    <section className="py-24">
      <Container className="grid items-center gap-12 lg:grid-cols-[1fr_1.15fr]">
        <Reveal>
          <p className="text-sm font-medium text-accent">Библиотека</p>
          <h2 className="mt-3 text-[clamp(2rem,4vw,3rem)] leading-[1.08] font-semibold tracking-[-0.035em]">
            Промпты и шаблоны, которые можно взять в работу сегодня
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-fg-muted">
            {counts.prompts} проверенных промптов под задачи PM и {counts.templates} шаблонов
            документов. У каждого промпта — объяснение, почему он работает, и чек-лист проверки
            ответа.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={routes.prompts()} variant="secondary">
              Все промпты <ArrowRight aria-hidden />
            </ButtonLink>
            <ButtonLink href={routes.templates()} variant="ghost">
              Шаблоны документов
            </ButtonLink>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <PromptCard prompt={prompt} />
        </Reveal>
      </Container>
    </section>
  );
}
