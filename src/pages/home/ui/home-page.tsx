import { ArrowRight } from "lucide-react";
import { getCourseStats, getLevels } from "@/entities/course/index.server";
import { getGlossary } from "@/entities/glossary/index.server";
import { getPrompt, getPrompts } from "@/entities/prompt/index.server";
import { getTemplates } from "@/entities/template/index.server";
import { absoluteUrl, routes, siteConfig } from "@/shared/config";
import { JsonLd } from "@/shared/lib";
import { ButtonLink } from "@/shared/ui";
import { AiComparison } from "@/widgets/ai-comparison";
import { CtaBand } from "@/widgets/cta-band";
import { Faq, type FaqItem } from "@/widgets/faq";
import { Hero } from "@/widgets/hero";
import { HowItWorks } from "@/widgets/how-it-works";
import { LevelShowcase } from "@/widgets/level-showcase";
import { LibraryTeaser } from "@/widgets/library-teaser";

const faq: FaqItem[] = [
  {
    question: "Это правда бесплатно?",
    answer:
      "Да. Все уроки, тесты, библиотека промптов и шаблонов и сертификаты бесплатны. Платных тарифов и рекламы нет.",
  },
  {
    question: "Нужен ли опыт в управлении проектами?",
    answer:
      "Для уровня Junior — нет, он рассчитан на старт с нуля. Если опыт уже есть, пройдите тест на уровень: он подскажет, с какого уровня начать и какие модули можно пропустить.",
  },
  {
    question: "Какие ИИ-сервисы понадобятся?",
    answer:
      "Любой доступный вам ИИ-ассистент: YandexGPT, GigaChat или сервис, который разрешён в вашей компании. Курс учит принципам, а не кнопкам конкретного сервиса, и в примерах опирается на то, что доступно в России.",
  },
  {
    question: "Сертификат — это диплом?",
    answer:
      "Нет. Сертификат подтверждает прохождение бесплатного онлайн-курса и итогового экзамена, но не является документом об образовании или квалификации. У каждого сертификата есть публичная страница проверки.",
  },
  {
    question: "Сколько времени занимает обучение?",
    answer:
      "Уроки короткие — 10–15 минут. Можно проходить в своём темпе: прогресс сохраняется в аккаунте и синхронизируется между устройствами.",
  },
  {
    question: "Где хранятся мои данные?",
    answer:
      "Все персональные данные хранятся и обрабатываются в России, в соответствии с 152-ФЗ. Мы собираем только то, что нужно для обучения и сертификата.",
  },
];

export function HomePage() {
  const levels = getLevels().map((level) => ({ ...level, stats: getCourseStats(level.slug) }));
  const stats = getCourseStats();
  const prompts = getPrompts();
  const templates = getTemplates();
  const featured = getPrompt("status-report") ?? prompts[0]!;

  return (
    <>
      <Hero
        stats={{
          modules: stats.modulesTotal,
          prompts: prompts.length,
          templates: templates.length,
          terms: getGlossary().length,
        }}
      />
      <LevelShowcase levels={levels} />
      <AiComparison />
      <HowItWorks />
      <LibraryTeaser
        prompt={featured}
        counts={{ prompts: prompts.length, templates: templates.length }}
      />
      <Faq items={faq} />
      <CtaBand
        title="Начните с первого урока — это 12 минут"
        text="Регистрация не нужна, чтобы читать. Аккаунт понадобится, когда захотите сохранить прогресс и сдать тесты."
        actions={
          <>
            <ButtonLink href={routes.level("junior")} size="lg" variant="primary">
              Открыть Junior <ArrowRight aria-hidden />
            </ButtonLink>
            <ButtonLink
              href={routes.placementTest()}
              size="lg"
              variant="ghost"
              className="text-bg/80 hover:bg-bg/10 hover:text-bg"
            >
              Тест на уровень
            </ButtonLink>
          </>
        }
      />
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: siteConfig.name,
            url: siteConfig.url,
            logo: absoluteUrl("/icon.svg"),
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: siteConfig.name,
            url: siteConfig.url,
            inLanguage: "ru",
          },
          ...levels
            .filter((level) => level.status === "published")
            .map((level) => ({
              "@context": "https://schema.org",
              "@type": "Course",
              name: `${level.title}: ${level.tagline}`,
              description: level.description,
              url: absoluteUrl(routes.level(level.slug)),
              inLanguage: "ru",
              isAccessibleForFree: true,
              provider: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
              offers: { "@type": "Offer", price: 0, priceCurrency: "RUB", category: "Free" },
              hasCourseInstance: {
                "@type": "CourseInstance",
                courseMode: "online",
                courseWorkload: `PT${Math.max(1, Math.round(level.stats.minutes / 60))}H`,
              },
            })),
        ]}
      />
    </>
  );
}
