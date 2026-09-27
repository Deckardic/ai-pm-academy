import { BookOpen, ClipboardCheck, FileCheck2, Sparkles } from "lucide-react";
import { Container, Reveal } from "@/shared/ui";

const steps = [
  {
    icon: BookOpen,
    title: "Урок на 10–15 минут",
    text: "Сначала фундамент профессии, затем — как ту же задачу решают сегодня с ИИ, где он помогает и где вредит.",
  },
  {
    icon: Sparkles,
    title: "Готовый промпт",
    text: "Подставляете свои данные и копируете в любой ИИ-сервис — YandexGPT, GigaChat или тот, что разрешён в компании.",
  },
  {
    icon: FileCheck2,
    title: "Практика с артефактом",
    text: "Устав, WBS, реестр рисков, статус-отчёт — каждый модуль заканчивается документом для портфолио.",
  },
  {
    icon: ClipboardCheck,
    title: "Тест и сертификат",
    text: "Тесты модулей с разбором ошибок и итоговый экзамен с ситуационными кейсами. Сертификат с публичной проверкой.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-y border-line bg-bg-subtle py-24">
      <Container>
        <Reveal className="max-w-2xl">
          <p className="text-sm font-medium text-accent">Как устроено обучение</p>
          <h2 className="mt-3 text-[clamp(2rem,4vw,3rem)] leading-[1.08] font-semibold tracking-[-0.035em]">
            Меньше теории ради теории. Больше того, что пригодится завтра
          </h2>
        </Reveal>
        <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <Reveal key={step.title} delay={index * 70} className="h-full">
              <li className="flex h-full flex-col gap-4 surface-card p-6">
                <div className="flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent">
                    <step.icon aria-hidden className="size-5" />
                  </span>
                  <span className="font-mono text-sm text-fg-subtle">0{index + 1}</span>
                </div>
                <h3 className="text-lg font-semibold tracking-tight">{step.title}</h3>
                <p className="text-[0.9375rem] leading-relaxed text-fg-muted">{step.text}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}
