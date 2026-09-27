"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { cn } from "@/shared/lib";
import { rateLesson } from "../api/actions";

export function LessonRating({ lessonId }: { lessonId: string }) {
  const [rating, setRating] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [, startTransition] = useTransition();
  const shown = hover ?? rating ?? 0;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium" id={`rate-${lessonId}`}>
        {rating ? "Спасибо за оценку!" : "Насколько полезен урок?"}
      </p>
      <div
        role="radiogroup"
        aria-labelledby={`rate-${lessonId}`}
        className="flex gap-1"
        onMouseLeave={() => setHover(null)}
      >
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={rating === value}
            aria-label={`${value} из 5`}
            onMouseEnter={() => setHover(value)}
            onFocus={() => setHover(value)}
            onBlur={() => setHover(null)}
            onClick={() => {
              setRating(value);
              startTransition(async () => {
                await rateLesson({ lessonId, rating: value });
              });
            }}
            className="grid size-9 pressable cursor-pointer place-items-center rounded-lg hover:bg-bg-subtle"
          >
            <Star
              aria-hidden
              className={cn(
                "size-5 transition-colors duration-150 ease-[ease]",
                value <= shown ? "fill-warning text-warning" : "text-fg-subtle",
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
