import Link from "next/link";
import type { LessonMeta } from "@/entities/course";
import { LessonStatusIcon, type LessonStatus } from "@/entities/progress";
import { routes } from "@/shared/config";
import { cn, formatDuration } from "@/shared/lib";

type ModuleOutlineProps = {
  lessons: LessonMeta[];
  /** lessonId → version at completion */
  completed?: ReadonlyMap<string, { lessonVersion: number }>;
  currentId?: string;
  variant?: "full" | "compact";
};

export function lessonStatus(
  lesson: LessonMeta,
  completed?: ReadonlyMap<string, { lessonVersion: number }>,
): LessonStatus {
  const entry = completed?.get(lesson.id);
  if (!entry) return "todo";
  return entry.lessonVersion < lesson.version ? "updated" : "done";
}

export function ModuleOutline({
  lessons,
  completed,
  currentId,
  variant = "full",
}: ModuleOutlineProps) {
  return (
    <ol className={cn("flex flex-col", variant === "full" ? "gap-2" : "gap-0.5")}>
      {lessons.map((lesson, index) => {
        const current = lesson.id === currentId;
        const status = lessonStatus(lesson, completed);
        return (
          <li key={lesson.id}>
            <Link
              href={routes.lesson(lesson.levelSlug, lesson.moduleSlug, lesson.slug)}
              aria-current={current ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-lg transition-colors duration-150 ease-[ease]",
                variant === "full"
                  ? "surface-card p-4 hover:shadow-card-hover sm:px-5"
                  : "px-2.5 py-2 text-sm text-fg-muted hover:bg-bg-subtle hover:text-fg",
                current && variant === "compact" && "bg-bg-subtle text-fg",
              )}
            >
              <LessonStatusIcon status={status} />
              <span className="min-w-0 flex-1">
                <span className={cn("block truncate", variant === "full" && "font-medium")}>
                  {variant === "full" ? (
                    <span className="mr-2 text-fg-subtle tabular-nums">{index + 1}.</span>
                  ) : null}
                  {lesson.title}
                </span>
                {variant === "full" ? (
                  <span className="mt-0.5 block truncate text-sm text-fg-muted">
                    {lesson.description}
                  </span>
                ) : null}
              </span>
              <span className="shrink-0 text-sm text-fg-subtle tabular-nums">
                {formatDuration(lesson.durationMin)}
              </span>
              {status === "updated" && variant === "full" ? (
                <span className="shrink-0 text-xs font-medium text-warning">Обновлён</span>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
