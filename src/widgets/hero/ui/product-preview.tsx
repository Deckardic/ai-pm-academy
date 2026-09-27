import { Check, Copy, Sparkles } from "lucide-react";
import { cn } from "@/shared/lib";

/**
 * A static illustration of the learning experience, built from real UI
 * primitives. Enters once with a short stagger (first-visit surface only).
 */
export function ProductPreview({ className }: { className?: string }) {
  const modules = [
    { title: "Кто такой PM сегодня", done: true },
    { title: "Основы ИИ для PM", done: true },
    { title: "Промптинг: база", done: false, active: true },
    { title: "Инициация проекта", done: false },
    { title: "Планирование", done: false },
  ];
  return (
    <div aria-hidden className={cn("stagger relative select-none", className)}>
      <div className="overflow-hidden surface-card" style={{ ["--stagger-index" as string]: 5 }}>
        <div className="flex items-center gap-1.5 border-b border-line px-4 py-3">
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="ml-3 truncate font-mono text-xs text-fg-subtle">
            aipm.academy/junior/prompting-baza
          </span>
        </div>
        <div className="grid md:grid-cols-[15rem_1fr]">
          <aside className="hidden flex-col gap-1 border-r border-line bg-bg-subtle p-4 md:flex">
            <p className="px-2 pb-2 text-xs font-medium tracking-wide text-junior uppercase">
              Junior
            </p>
            {modules.map((module) => (
              <div
                key={module.title}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[0.8125rem]",
                  module.active ? "bg-surface text-fg shadow-sm" : "text-fg-muted",
                )}
              >
                <span
                  className={cn(
                    "grid size-4 shrink-0 place-items-center rounded-full",
                    module.done
                      ? "bg-success text-white"
                      : "shadow-[inset_0_0_0_1.5px_var(--line-strong)]",
                  )}
                >
                  {module.done ? <Check className="size-2.5" strokeWidth={3} /> : null}
                </span>
                <span className="truncate">{module.title}</span>
              </div>
            ))}
          </aside>
          <div className="flex flex-col gap-4 p-5 sm:p-7">
            <p className="text-xs text-fg-subtle">Урок 2 · 12 мин</p>
            <p className="text-xl leading-snug font-semibold tracking-tight">
              Анатомия промпта: роль, контекст, задача
            </p>
            <div className="flex flex-col gap-2">
              <span className="h-2 w-full rounded-full bg-surface-sunken" />
              <span className="h-2 w-11/12 rounded-full bg-surface-sunken" />
              <span className="h-2 w-4/5 rounded-full bg-surface-sunken" />
            </div>
            <div className="rounded-xl bg-accent-soft p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-accent">
                <Sparkles className="size-4" /> Совет с ИИ
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">
                Просите модель найти пропуски в вашем плане, а не писать его за вас.
              </p>
            </div>
            <div className="rounded-xl bg-surface p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">Еженедельный статус-отчёт</p>
                <span className="inline-flex h-7 items-center gap-1.5 rounded-md bg-accent px-2.5 text-xs font-medium text-accent-fg">
                  <Copy className="size-3" /> Скопировать
                </span>
              </div>
              <p className="mt-2 font-mono text-xs leading-relaxed text-fg-muted">
                Ты — проект-менеджер, который пишет краткие и честные статус-отчёты…
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating cards: rare, first-visit delight. */}
      <div
        className="absolute -top-5 -left-3 hidden sm:block lg:-left-10"
        style={{ ["--stagger-index" as string]: 8 }}
      >
        <div className="w-52 surface-card p-4">
          <p className="text-xs text-fg-muted">Прогресс уровня</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">
            42<span className="text-base text-fg-muted">%</span>
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-sunken">
            <div className="h-full w-[42%] rounded-full bg-junior" />
          </div>
        </div>
      </div>
      <div
        className="absolute -right-3 -bottom-6 hidden sm:block lg:-right-8"
        style={{ ["--stagger-index" as string]: 10 }}
      >
        <div className="flex items-center gap-3 surface-card p-4 pr-6">
          <span className="grid size-9 place-items-center rounded-full bg-success-soft text-success">
            <Check className="size-5" strokeWidth={2.5} />
          </span>
          <div>
            <p className="text-sm font-medium">Тест модуля пройден</p>
            <p className="text-xs text-fg-muted">5 из 5 · можно дальше</p>
          </div>
        </div>
      </div>
    </div>
  );
}
