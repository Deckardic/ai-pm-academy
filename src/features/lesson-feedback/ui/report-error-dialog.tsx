"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Flag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  FieldError,
  Label,
  LoadingButton,
  Textarea,
  toast,
} from "@/shared/ui";
import { reportError } from "../api/actions";

export function ReportErrorDialog({
  targetId,
  kind = "lesson-error",
  label = "Сообщить об ошибке",
}: {
  targetId: string;
  kind?: "lesson-error" | "question-error";
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const comment = String(new FormData(event.currentTarget).get("comment") ?? "");
    startTransition(async () => {
      const result = await reportError({ targetId, kind, comment });
      if (!result.ok) return setError(result.error);
      setOpen(false);
      setError(null);
      toast.success("Спасибо! Мы проверим и исправим");
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-fg-muted transition-colors duration-150 ease-[ease] hover:text-fg">
        <Flag aria-hidden className="size-3.5" /> {label}
      </DialogTrigger>
      <DialogContent
        title="Нашли ошибку?"
        description="Опишите, что не так: неточность, опечатка, устаревшая информация. Персональные данные писать не нужно."
      >
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <Label htmlFor={`report-${targetId}`} className="sr-only">
            Описание ошибки
          </Label>
          <Textarea
            id={`report-${targetId}`}
            name="comment"
            required
            minLength={5}
            maxLength={2000}
            autoFocus
          />
          <FieldError message={error} />
          <LoadingButton type="submit" pending={pending}>
            Отправить
          </LoadingButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
