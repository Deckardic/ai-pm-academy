import type { Metadata } from "next";
import { ArrowRight, Layers, RefreshCw, ShieldCheck, Target } from "lucide-react";
import { routes } from "@/shared/config";
import { Badge, ButtonLink, Container, PageHeader } from "@/shared/ui";

export const aboutMetadata: Metadata = {
  title: "О проекте",
  description:
    "AI PM Academy — бесплатный курс для проект-менеджеров: как устроена программа, методический подход и принципы работы с материалами.",
  alternates: { canonical: routes.about() },
};

const principles = [
  {
    icon: Layers,
    title: "Фундамент + ИИ + практика",
    text: "Каждая тема устроена одинаково: сначала классическая база, затем — как ту же задачу решают сегодня с ИИ, и практика с артефактом для портфолио.",
  },
  {
    icon: Target,
    title: "Принципы, а не кнопки",
    text: "Сервисы меняются быстро, поэтому мы учим паттернам работы с ИИ, которые переносятся между инструментами. Примеры — на том, что доступно в России.",
  },
  {
    icon: RefreshCw,
    title: "Свежесть материалов",
    text: "У каждого урока указана дата последней редакции. Уроки про ИИ-инструменты пересматриваются не реже раза в квартал.",
  },
  {
    icon: ShieldCheck,
    title: "Ответственность остаётся за человеком",
    text: "Сквозная тема курса: проверка ответов ИИ, правила работы с данными и прозрачность перед командой и заказчиком.",
  },
];

export function AboutPage() {
  return (
    <Container className="flex flex-col gap-16 py-14 lg:py-20">
      <PageHeader
        eyebrow={<Badge tone="accent">О проекте</Badge>}
        title="Бесплатный курс для проект-менеджеров, которые работают с ИИ"
        description="AI PM Academy — некоммерческий просветительский проект. Мы собрали траекторию от нуля до уровня Middle, где классическое управление проектами и современные ИИ-практики идут рука об руку."
        actions={
          <ButtonLink href={routes.catalog()}>
            Программа курса <ArrowRight aria-hidden />
          </ButtonLink>
        }
      />
      <section aria-labelledby="principles-title">
        <h2 id="principles-title" className="text-2xl font-semibold tracking-tight">
          Методический подход
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {principles.map((item) => (
            <li key={item.title} className="flex flex-col gap-3 surface-card p-6">
              <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent">
                <item.icon aria-hidden className="size-5" />
              </span>
              <h3 className="text-lg font-semibold tracking-tight">{item.title}</h3>
              <p className="text-[0.9375rem] leading-relaxed text-fg-muted">{item.text}</p>
            </li>
          ))}
        </ul>
      </section>
      <section className="grid gap-6 rounded-2xl bg-bg-subtle p-8 shadow-sm lg:grid-cols-3">
        <div>
          <h2 className="font-semibold">Бесплатно</h2>
          <p className="mt-2 text-[0.9375rem] text-fg-muted">
            Уроки, тесты, библиотека и сертификаты — без тарифов и рекламы.
          </p>
        </div>
        <div>
          <h2 className="font-semibold">Данные в России</h2>
          <p className="mt-2 text-[0.9375rem] text-fg-muted">
            Персональные данные хранятся и обрабатываются в РФ по 152-ФЗ.
          </p>
        </div>
        <div>
          <h2 className="font-semibold">Сертификат</h2>
          <p className="mt-2 text-[0.9375rem] text-fg-muted">
            Подтверждает прохождение курса и экзамена. Не является документом об образовании.
          </p>
        </div>
      </section>
    </Container>
  );
}
