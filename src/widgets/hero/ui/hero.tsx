import { ArrowRight } from "lucide-react";
import { routes } from "@/shared/config";
import { formatCount } from "@/shared/lib";
import { Badge, ButtonLink, Container } from "@/shared/ui";
import { ProductPreview } from "./product-preview";

type HeroProps = {
  stats: { modules: number; prompts: number; templates: number; terms: number };
};

export function Hero({ stats }: HeroProps) {
  const facts = [
    `${formatCount(stats.modules, ["модуль", "модуля", "модулей"])} в программе`,
    formatCount(stats.prompts, ["промпт", "промпта", "промптов"]),
    formatCount(stats.templates, ["шаблон", "шаблона", "шаблонов"]),
    formatCount(stats.terms, ["термин", "термина", "терминов"]),
  ];
  return (
    <section className="relative isolate overflow-hidden pt-16 pb-24 sm:pt-24">
      <div aria-hidden className="bg-grid absolute inset-0 -z-10" />
      <div
        aria-hidden
        className="absolute top-[-20rem] left-1/2 -z-10 h-[40rem] w-[60rem] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl"
      />
      <Container className="flex flex-col items-center text-center">
        <div className="stagger flex flex-col items-center">
          <div style={{ ["--stagger-index" as string]: 0 }}>
            <Badge tone="neutral" className="bg-surface">
              <span className="size-1.5 rounded-full bg-success" /> Бесплатно · Junior и Middle уже
              доступны
            </Badge>
          </div>
          <h1
            style={{ ["--stagger-index" as string]: 1 }}
            className="mt-6 max-w-4xl text-[clamp(2.25rem,6.5vw,4.75rem)] leading-[1.02] font-semibold tracking-[-0.045em]"
          >
            Станьте <span className="sm:whitespace-nowrap">проект-менеджером</span>, который{" "}
            <span className="bg-linear-to-r from-junior via-middle to-accent bg-clip-text text-transparent">
              работает с&nbsp;ИИ
            </span>
          </h1>
          <p
            style={{ ["--stagger-index" as string]: 2 }}
            className="mt-6 max-w-2xl text-lg leading-relaxed text-fg-muted sm:text-xl"
          >
            Курс от нуля до Middle: классическое управление проектами и современные ИИ-практики — на
            реальных задачах, с тестами, практикой и сертификатом.
          </p>
          <div
            style={{ ["--stagger-index" as string]: 3 }}
            className="mt-9 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row"
          >
            <ButtonLink href={routes.level("junior")} size="lg">
              Начать с Junior <ArrowRight aria-hidden />
            </ButtonLink>
            <ButtonLink href={routes.placementTest()} size="lg" variant="secondary">
              Пройти тест на уровень
            </ButtonLink>
          </div>
          <ul
            style={{ ["--stagger-index" as string]: 4 }}
            className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-fg-muted"
          >
            {facts.map((fact) => (
              <li key={fact} className="flex items-center gap-2">
                <span aria-hidden className="size-1 rounded-full bg-fg-subtle" />
                {fact}
              </li>
            ))}
          </ul>
        </div>
        <ProductPreview className="mt-16 w-full max-w-5xl text-left sm:mt-20" />
      </Container>
    </section>
  );
}
