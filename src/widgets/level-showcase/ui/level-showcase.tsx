import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { levelTheme, type Level } from "@/entities/course";
import { routes } from "@/shared/config";
import { cn, formatCount, formatDuration } from "@/shared/lib";
import { Badge, Container, Reveal } from "@/shared/ui";

type LevelShowcaseProps = {
  levels: (Level & { stats: { lessons: number; modulesTotal: number; minutes: number } })[];
};

export function LevelShowcase({ levels }: LevelShowcaseProps) {
  return (
    <section id="programma" className="scroll-mt-20 py-24">
      <Container>
        <Reveal className="max-w-2xl">
          <p className="text-sm font-medium text-accent">Три уровня</p>
          <h2 className="mt-3 text-[clamp(2rem,4vw,3rem)] leading-[1.08] font-semibold tracking-[-0.035em]">
            Одна траектория — от первого проекта до AI-трансформации
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-fg-muted">
            Каждая тема устроена одинаково: фундамент профессии, как это делают сегодня с ИИ, и
            практика с артефактом для портфолио.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {levels.map((level, index) => {
            const theme = levelTheme[level.id];
            const soon = level.status === "soon";
            return (
              <Reveal key={level.id} delay={index * 80}>
                <Link
                  href={routes.level(level.slug)}
                  className={cn(
                    "group relative flex h-full flex-col overflow-hidden surface-card p-7 transition-[box-shadow,transform] duration-300 ease-out hover:-translate-y-1 hover:shadow-card-hover",
                  )}
                >
                  <div aria-hidden className={cn("absolute inset-x-0 top-0 h-1", theme.bg)} />
                  <div className="flex items-center justify-between">
                    <span
                      className={cn("text-sm font-semibold tracking-wide uppercase", theme.text)}
                    >
                      {level.title}
                    </span>
                    {soon ? (
                      <Badge size="sm">Скоро</Badge>
                    ) : (
                      <ArrowUpRight
                        aria-hidden
                        className="size-5 text-fg-subtle transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-fg"
                      />
                    )}
                  </div>
                  <h3 className="mt-4 text-xl leading-snug font-semibold tracking-tight">
                    {level.tagline}
                  </h3>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-fg-muted">
                    {level.audience}
                  </p>
                  <ul className="mt-6 flex flex-col gap-2.5">
                    {level.outcomes.slice(0, 4).map((outcome) => (
                      <li key={outcome} className="flex gap-2.5 text-sm leading-relaxed">
                        <Check
                          aria-hidden
                          className={cn("mt-0.5 size-4 shrink-0", theme.text)}
                          strokeWidth={2.5}
                        />
                        {outcome}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-auto pt-8 text-sm text-fg-subtle">
                    {soon
                      ? "Программа готовится"
                      : `${formatCount(level.stats.modulesTotal, ["модуль", "модуля", "модулей"])} · ${
                          level.stats.lessons > 0
                            ? `${formatDuration(level.stats.minutes)} уроков сейчас`
                            : "уроки скоро"
                        }`}
                  </p>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
