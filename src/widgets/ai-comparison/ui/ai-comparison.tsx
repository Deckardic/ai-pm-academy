import { Check, Clock } from "lucide-react";
import { cn } from "@/shared/lib";
import { Container, Reveal } from "@/shared/ui";
import { ComparisonSlider } from "./comparison-slider";

type Step = { text: string; minutes: number };

const manual: Step[] = [
  { text: "Собрать статусы задач из трекера и чатов", minutes: 20 },
  { text: "Вспомнить, что обсуждали на неделе", minutes: 10 },
  { text: "Написать отчёт с нуля", minutes: 25 },
  { text: "Переписать тон для руководства", minutes: 10 },
];

const withAi: Step[] = [
  { text: "Выгрузить задачи и отдать ИИ вместе с шаблоном", minutes: 3 },
  { text: "Проверить цифры, даты и статус по чек-листу", minutes: 8 },
  { text: "Дописать выводы и запрос к руководству", minutes: 4 },
];

function Panel({ steps, tone }: { steps: Step[]; tone: "manual" | "ai" }) {
  const total = steps.reduce((sum, step) => sum + step.minutes, 0);
  return (
    <div className="flex min-h-[26rem] flex-col justify-end gap-6 p-6 pt-16 sm:p-10 sm:pt-20">
      <div className={cn("flex flex-col gap-1", tone === "ai" && "sm:items-end sm:text-right")}>
        <p className="flex items-center gap-2 text-sm text-fg-muted">
          <Clock aria-hidden className="size-4" /> Еженедельный статус-отчёт
        </p>
        <p className="text-5xl font-semibold tracking-[-0.04em] tabular-nums sm:text-6xl">
          ≈{total}
          <span className="text-2xl text-fg-muted"> мин</span>
        </p>
      </div>
      <ol className={cn("flex flex-col gap-2.5", tone === "ai" && "sm:items-end")}>
        {steps.map((step) => (
          <li
            key={step.text}
            className={cn(
              "flex max-w-md items-center gap-3 rounded-xl px-4 py-3 text-sm shadow-sm",
              tone === "ai" ? "bg-accent-soft" : "bg-bg-subtle",
            )}
          >
            {tone === "ai" ? (
              <Check aria-hidden className="size-4 shrink-0 text-accent" strokeWidth={2.5} />
            ) : (
              <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-fg-subtle" />
            )}
            <span className="flex-1">{step.text}</span>
            <span className="text-fg-muted tabular-nums">{step.minutes} мин</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function AiComparison() {
  return (
    <section className="py-24">
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-accent">До и после</p>
          <h2 className="mt-3 text-[clamp(2rem,4vw,3rem)] leading-[1.08] font-semibold tracking-[-0.035em]">
            ИИ не заменяет PM. Он забирает рутину
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-fg-muted">
            Потяните разделитель: та же задача вручную и с ИИ-ассистентом. Время уходит не на текст,
            а на проверку и выводы — этому и учит курс.
          </p>
        </Reveal>
        <Reveal delay={100} className="mt-12">
          <ComparisonSlider
            labelBefore="Вручную"
            labelAfter="С ИИ"
            initial={55}
            before={<Panel steps={manual} tone="manual" />}
            after={<Panel steps={withAi} tone="ai" />}
          />
        </Reveal>
      </Container>
    </section>
  );
}
