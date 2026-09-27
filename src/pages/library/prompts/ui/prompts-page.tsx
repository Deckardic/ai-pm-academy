import type { Metadata } from "next";
import { getPrompts } from "@/entities/prompt/index.server";
import { routes } from "@/shared/config";
import { Badge, Container, PageHeader } from "@/shared/ui";
import { PromptLibrary } from "@/widgets/prompt-library";

export const promptsMetadata: Metadata = {
  title: "Промпты для проект-менеджера",
  description:
    "Готовые промпты для задач PM: протоколы встреч, статус-отчёты, WBS, риски, требования. С переменными, объяснением и чек-листом проверки. Работают в YandexGPT и GigaChat.",
  alternates: { canonical: routes.prompts() },
};

export function PromptsPage() {
  const prompts = getPrompts();
  return (
    <Container className="flex flex-col gap-12 py-14 lg:py-20">
      <PageHeader
        eyebrow={<Badge tone="accent">Библиотека</Badge>}
        title="Промпты для проект-менеджера"
        description="Подставьте свои данные и скопируйте в любой ИИ-ассистент. У каждого промпта — объяснение, почему он работает, и что проверить в ответе."
      />
      <PromptLibrary prompts={prompts} />
    </Container>
  );
}
