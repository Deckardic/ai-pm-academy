"use client";

import { useId, useState } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/shared/lib";

type InlineQuizProps = {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
};

/** Self-check inside a lesson. Not graded, so the answer can live on the client. */
export function InlineQuiz({ question, options, correct, explanation }: InlineQuizProps) {
  const id = useId();
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;

  return (
    <fieldset className="not-prose surface-card p-5 sm:p-6">
      <legend className="sr-only">Проверьте себя</legend>
      <p className="text-xs font-semibold tracking-wide text-fg-subtle uppercase">Проверьте себя</p>
      <p id={`${id}-q`} className="mt-2 text-[1.0625rem] leading-snug font-medium">
        {question}
      </p>
      <div role="radiogroup" aria-labelledby={`${id}-q`} className="mt-4 flex flex-col gap-2">
        {options.map((option, index) => {
          const isCorrect = index === correct;
          const isSelected = index === selected;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={answered}
              onClick={() => setSelected(index)}
              className={cn(
                "flex w-full pressable cursor-pointer items-center justify-between gap-3 rounded-lg px-4 py-3 text-left text-[0.9375rem] shadow-[inset_0_0_0_1px_var(--line-strong)] hover:bg-bg-subtle disabled:cursor-default disabled:hover:bg-transparent",
                answered &&
                  isCorrect &&
                  "bg-success-soft! shadow-[inset_0_0_0_1.5px_var(--success)]",
                answered &&
                  isSelected &&
                  !isCorrect &&
                  "bg-danger-soft! shadow-[inset_0_0_0_1.5px_var(--danger)]",
                answered && !isCorrect && !isSelected && "opacity-60",
              )}
            >
              {option}
              {answered && isCorrect ? (
                <Check aria-hidden className="size-4 shrink-0 text-success" />
              ) : null}
              {answered && isSelected && !isCorrect ? (
                <X aria-hidden className="size-4 shrink-0 text-danger" />
              ) : null}
            </button>
          );
        })}
      </div>
      {answered ? (
        <p
          role="status"
          className="mt-4 translate-y-0 text-[0.9375rem] leading-relaxed text-fg-muted opacity-100 transition-[opacity,transform] duration-300 ease-out starting:translate-y-1 starting:opacity-0"
        >
          <span
            className={cn("font-semibold", selected === correct ? "text-success" : "text-danger")}
          >
            {selected === correct ? "Верно. " : "Не совсем. "}
          </span>
          {explanation}
        </p>
      ) : null}
    </fieldset>
  );
}
