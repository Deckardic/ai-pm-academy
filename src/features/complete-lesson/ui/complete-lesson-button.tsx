"use client";

import { useOptimistic, useTransition } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowRight, Check, Circle } from "lucide-react";
import { cn } from "@/shared/lib";
import { Button, toast } from "@/shared/ui";
import { toggleLessonComplete } from "../api/actions";

type CompleteLessonButtonProps = {
  lessonId: string;
  completed: boolean;
  next?: { href: Route; title: string } | null;
};

/**
 * Optimistic: the state flips on press; the server confirms in the background.
 * The two labels share one grid cell and crossfade with a light blur.
 */
export function CompleteLessonButton({ lessonId, completed, next }: CompleteLessonButtonProps) {
  const [optimistic, setOptimistic] = useOptimistic(completed);
  const [, startTransition] = useTransition();

  const onClick = () => {
    const target = !optimistic;
    startTransition(async () => {
      setOptimistic(target);
      const result = await toggleLessonComplete({ lessonId, completed: target });
      if (!result.ok) {
        toast.error(
          result.error === "unauthorized"
            ? "Войдите, чтобы сохранять прогресс"
            : "Не удалось сохранить",
        );
        return;
      }
      if (target) {
        toast.success("Урок пройден", {
          description: next ? `Дальше: ${next.title}` : "Вы прошли все уроки уровня",
        });
      }
    });
  };

  const layer =
    "col-start-1 row-start-1 inline-flex items-center justify-center gap-2 transition-[opacity,filter,transform] duration-200 ease-out motion-reduce:transition-opacity";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Button
        size="lg"
        variant={optimistic ? "secondary" : "primary"}
        aria-pressed={optimistic}
        onClick={onClick}
        className={cn("grid min-w-56", optimistic && "text-success")}
      >
        <span
          className={cn(layer, optimistic && "scale-95 opacity-0 blur-[2px]")}
          aria-hidden={optimistic}
        >
          <Circle aria-hidden /> Отметить урок пройденным
        </span>
        <span
          className={cn(layer, !optimistic && "scale-95 opacity-0 blur-[2px]")}
          aria-hidden={!optimistic}
        >
          <Check aria-hidden strokeWidth={2.5} /> Урок пройден
        </span>
      </Button>
      {optimistic && next ? (
        <Link
          href={next.href}
          className="inline-flex items-center gap-1.5 text-[0.9375rem] font-medium text-accent transition-[opacity,transform] duration-300 ease-out starting:translate-x-[-4px] starting:opacity-0"
        >
          Следующий урок <ArrowRight aria-hidden className="size-4" />
        </Link>
      ) : null}
    </div>
  );
}
