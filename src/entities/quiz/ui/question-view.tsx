"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { Answer, PublicQuestion } from "../model/public";

type QuestionViewProps = {
  question: PublicQuestion;
  answer: Answer | undefined;
  onAnswer: (answer: Answer) => void;
};

const optionClass =
  "pressable flex w-full cursor-pointer items-center gap-3.5 rounded-xl bg-surface px-4 py-3.5 text-left text-[0.9375rem] leading-snug shadow-[inset_0_0_0_1px_var(--line-strong)] hover:bg-bg-subtle has-checked:bg-accent-soft has-checked:shadow-[inset_0_0_0_1.5px_var(--accent)] has-focus-visible:outline-2 has-focus-visible:outline-accent";

export function QuestionView({ question, answer, onAnswer }: QuestionViewProps) {
  const id = useId();
  return (
    <fieldset
      className="flex flex-col gap-5"
      data-question-id={question.id}
      data-question-type={question.type}
    >
      {question.scenario ? (
        <p className="rounded-xl bg-bg-subtle px-4 py-3 text-[0.9375rem] leading-relaxed text-fg-muted shadow-sm">
          <span className="font-medium text-fg">Ситуация. </span>
          {question.scenario}
        </p>
      ) : null}
      <legend className="contents">
        <span className="block text-xl leading-snug font-semibold tracking-tight">
          {question.prompt}
        </span>
      </legend>
      {question.type === "multiple" ? (
        <p className="-mt-2 text-sm text-fg-muted">Выберите все подходящие варианты</p>
      ) : null}
      {question.type === "order" ? (
        <p className="-mt-2 text-sm text-fg-muted">Расставьте по порядку стрелками</p>
      ) : null}

      {question.type === "single" ? (
        <div className="flex flex-col gap-2">
          {question.options.map((option) => (
            <label key={option.id} className={optionClass} data-option-id={option.id}>
              <input
                type="radio"
                name={`${id}-q`}
                value={option.id}
                checked={answer === option.id}
                onChange={() => onAnswer(option.id)}
                className="peer sr-only"
              />
              <span
                aria-hidden
                className="grid size-5 shrink-0 place-items-center rounded-full shadow-[inset_0_0_0_1.5px_var(--line-strong)] transition-shadow duration-150 ease-out peer-checked:shadow-[inset_0_0_0_5px_var(--accent)]"
              />
              {option.text}
            </label>
          ))}
        </div>
      ) : null}

      {question.type === "multiple" ? (
        <div className="flex flex-col gap-2">
          {question.options.map((option) => {
            const selected = Array.isArray(answer) ? answer : [];
            const checked = selected.includes(option.id);
            return (
              <label key={option.id} className={optionClass} data-option-id={option.id}>
                <input
                  type="checkbox"
                  value={option.id}
                  checked={checked}
                  onChange={() =>
                    onAnswer(
                      checked
                        ? selected.filter((value) => value !== option.id)
                        : [...selected, option.id],
                    )
                  }
                  className="peer sr-only"
                />
                <span
                  aria-hidden
                  className="grid size-5 shrink-0 place-items-center rounded-md text-accent-fg shadow-[inset_0_0_0_1.5px_var(--line-strong)] transition-[background-color,box-shadow] duration-150 ease-out peer-checked:bg-accent peer-checked:shadow-none [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100"
                >
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    className="size-3.5 transition-opacity duration-150"
                  >
                    <path
                      d="M3.5 8.5l3 3 6-7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                {option.text}
              </label>
            );
          })}
        </div>
      ) : null}

      {question.type === "order" ? (
        <OrderList
          items={question.items}
          order={Array.isArray(answer) ? answer : question.items.map((item) => item.id)}
          onChange={onAnswer}
        />
      ) : null}
    </fieldset>
  );
}

function OrderList({
  items,
  order,
  onChange,
}: {
  items: { id: string; text: string }[];
  order: string[];
  onChange: (order: string[]) => void;
}) {
  const reduceMotion = useReducedMotion();
  const byId = new Map(items.map((item) => [item.id, item]));
  const move = (index: number, delta: -1 | 1) => {
    const next = [...order];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target]!, next[index]!];
    onChange(next);
  };
  return (
    <ol className="flex flex-col gap-2">
      {order.map((itemId, index) => (
        // Items travel on screen, so they settle with a gentle spring (interruptible if clicked fast).
        <motion.li
          key={itemId}
          layout={!reduceMotion}
          data-item-id={itemId}
          transition={{ type: "spring", duration: 0.35, bounce: 0.12 }}
          className="flex items-center gap-3 rounded-xl bg-surface px-3 py-2.5 shadow-[inset_0_0_0_1px_var(--line-strong)]"
        >
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent-soft text-sm font-semibold text-accent tabular-nums">
            {index + 1}
          </span>
          <span className="flex-1 text-[0.9375rem] leading-snug">{byId.get(itemId)?.text}</span>
          <span className="flex shrink-0 gap-1">
            <button
              type="button"
              aria-label="Выше"
              disabled={index === 0}
              onClick={() => move(index, -1)}
              className="grid size-8 pressable cursor-pointer place-items-center rounded-lg text-fg-muted hover:bg-bg-subtle hover:text-fg disabled:opacity-30"
            >
              <ArrowUp className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Ниже"
              disabled={index === order.length - 1}
              onClick={() => move(index, 1)}
              className="grid size-8 pressable cursor-pointer place-items-center rounded-lg text-fg-muted hover:bg-bg-subtle hover:text-fg disabled:opacity-30"
            >
              <ArrowDown className="size-4" />
            </button>
          </span>
        </motion.li>
      ))}
    </ol>
  );
}

export function isAnswered(question: PublicQuestion, answer: Answer | undefined): boolean {
  if (question.type === "single") return typeof answer === "string";
  if (question.type === "multiple") return Array.isArray(answer) && answer.length > 0;
  return true;
}

export function initialAnswer(question: PublicQuestion): Answer | undefined {
  return question.type === "order" ? question.items.map((item) => item.id) : undefined;
}
