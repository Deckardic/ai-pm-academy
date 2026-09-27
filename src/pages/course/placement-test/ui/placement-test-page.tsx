import type { Metadata } from "next";
import { getPlacementTest } from "@/entities/quiz/index.server";
import { routes } from "@/shared/config";
import { formatCount } from "@/shared/lib";
import { Badge, Container } from "@/shared/ui";
import { PlacementRunner } from "@/widgets/quiz-runner";

export const placementTestMetadata: Metadata = {
  title: "Тест на уровень",
  description:
    "12 вопросов за 10 минут: узнайте, с какого уровня начать курс управления проектами с ИИ — Junior или Middle. Без регистрации.",
  alternates: { canonical: routes.placementTest() },
};

export function PlacementTestPage() {
  const quiz = getPlacementTest();
  const count = quiz?.questions.length ?? 0;
  return (
    <Container size="narrow" className="py-14 lg:py-20">
      <PlacementRunner
        intro={
          <div className="flex flex-col gap-4">
            <Badge tone="accent" className="self-start">
              Без регистрации · ~10 минут
            </Badge>
            <h1 className="text-[clamp(2.25rem,5vw,3.25rem)] leading-[1.05] font-semibold tracking-[-0.04em]">
              С какого уровня начать?
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-fg-muted">
              {formatCount(count, ["вопрос", "вопроса", "вопросов"])} по управлению проектами и
              работе с ИИ — от базовых до продвинутых. В конце — рекомендация уровня и разбор
              ответов.
            </p>
          </div>
        }
      />
    </Container>
  );
}
