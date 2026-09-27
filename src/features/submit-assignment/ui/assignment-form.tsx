"use client";

import { useState, useTransition } from "react";
import { Checkbox, FieldError, Input, Label, LoadingButton, Textarea, toast } from "@/shared/ui";
import { submitAssignment } from "../api/actions";

type AssignmentFormProps = {
  assignmentId: string;
  checklist: string[];
  initial?: { text: string | null; link: string | null } | null;
};

export function AssignmentForm({ assignmentId, checklist, initial }: AssignmentFormProps) {
  const [checked, setChecked] = useState<boolean[]>(() => checklist.map(() => Boolean(initial)));
  const [text, setText] = useState(initial?.text ?? "");
  const [link, setLink] = useState(initial?.link ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const done = checked.filter(Boolean).length;

  const submit = () =>
    startTransition(async () => {
      const result = await submitAssignment({ assignmentId, text, link, checklist: checked });
      if (!result.ok) return setError(result.error);
      setError(null);
      toast.success(initial ? "Решение обновлено" : "Задание сдано", {
        description: "Эталонное решение открыто ниже",
      });
    });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="assignment-link">Ссылка на документ</Label>
        <Input
          id="assignment-link"
          type="url"
          inputMode="url"
          value={link}
          onChange={(event) => setLink(event.target.value)}
          placeholder="https://disk.yandex.ru/…"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="assignment-text">или текст решения</Label>
        <Textarea
          id="assignment-text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          className="min-h-48"
          placeholder="Вставьте решение. Без персональных данных и сведений работодателя."
        />
      </div>
      <fieldset className="flex flex-col gap-3 surface-card p-5">
        <legend className="sr-only">Чек-лист самопроверки</legend>
        <div className="flex items-center justify-between">
          <p className="font-semibold">Самопроверка</p>
          <span className="text-sm text-fg-muted tabular-nums">
            {done} из {checklist.length}
          </span>
        </div>
        {checklist.map((item, index) => (
          <label
            key={item}
            className="flex cursor-pointer items-start gap-3 text-[0.9375rem] leading-relaxed"
          >
            <Checkbox
              checked={checked[index]}
              onCheckedChange={(value) =>
                setChecked((prev) =>
                  prev.map((current, i) => (i === index ? value === true : current)),
                )
              }
              className="mt-0.5"
            />
            {item}
          </label>
        ))}
      </fieldset>
      <div className="flex flex-col items-start gap-3">
        <LoadingButton size="lg" pending={pending} onClick={submit}>
          {initial ? "Обновить решение" : "Сдать задание"}
        </LoadingButton>
        <FieldError message={error} />
      </div>
    </div>
  );
}
