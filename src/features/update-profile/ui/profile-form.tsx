"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Checkbox, FieldError, Input, Label, LoadingButton, toast } from "@/shared/ui";
import { updateProfile } from "../api/actions";

export function ProfileForm({
  name,
  nameLatin,
  emailReminders,
}: {
  name: string;
  nameLatin: string | null;
  emailReminders: boolean;
}) {
  const [reminders, setReminders] = useState(emailReminders);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await updateProfile({
        name: String(form.get("name") ?? ""),
        nameLatin: String(form.get("nameLatin") ?? ""),
        emailReminders: reminders,
      });
      if (!result.ok) return setError(result.error);
      setError(null);
      toast.success("Сохранено");
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-name">Имя и фамилия</Label>
          <Input id="profile-name" name="name" defaultValue={name} autoComplete="name" required />
          <p className="text-xs text-fg-subtle">Так они будут написаны в сертификате</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-latin">Имя латиницей (необязательно)</Label>
          <Input
            id="profile-latin"
            name="nameLatin"
            defaultValue={nameLatin ?? ""}
            placeholder="Anna Smirnova"
            autoCapitalize="words"
          />
          <p className="text-xs text-fg-subtle">Для резюме на английском</p>
        </div>
      </div>
      <label className="flex cursor-pointer items-center gap-3 text-[0.9375rem]">
        <Checkbox checked={reminders} onCheckedChange={(value) => setReminders(value === true)} />
        Напоминать на почту о продолжении обучения
      </label>
      <FieldError message={error} />
      <LoadingButton type="submit" pending={pending} className="self-start">
        Сохранить
      </LoadingButton>
    </form>
  );
}
