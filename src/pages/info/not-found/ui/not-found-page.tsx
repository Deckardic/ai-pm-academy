import { ArrowRight } from "lucide-react";
import { routes } from "@/shared/config";
import { ButtonLink, Container } from "@/shared/ui";

export function NotFoundPage() {
  return (
    <Container
      size="narrow"
      className="flex flex-1 flex-col items-center justify-center gap-6 py-24 text-center"
    >
      <p className="font-mono text-sm text-fg-subtle">404</p>
      <h1 className="text-[clamp(2rem,5vw,3rem)] leading-tight font-semibold tracking-[-0.035em]">
        Такой страницы нет
      </h1>
      <p className="max-w-md text-lg text-fg-muted">
        Возможно, урок переехал или ссылка устарела. Начните с программы курса — там всё по порядку.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <ButtonLink href={routes.catalog()}>
          Программа курса <ArrowRight aria-hidden />
        </ButtonLink>
        <ButtonLink href={routes.home()} variant="secondary">
          На главную
        </ButtonLink>
      </div>
    </Container>
  );
}
