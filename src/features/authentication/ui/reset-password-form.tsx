"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/shared/auth";
import { routes } from "@/shared/config";
import { FieldError, Input, Label, LoadingButton } from "@/shared/ui";
import { authErrorMessage } from "../model/errors";

export function ResetPasswordForm({ token }: { token: string | null }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(
    token ? null : "Ссылка недействительна. Запросите новую на странице входа.",
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    const password = String(new FormData(event.currentTarget).get("password") ?? "");
    setPending(true);
    const { error: resetError } = await authClient.resetPassword({ newPassword: password, token });
    setPending(false);
    if (resetError) return setError(authErrorMessage(resetError));
    router.push(routes.signIn());
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="new-password">Новый пароль</Label>
        <Input
          id="new-password"
          name="password"
          type="password"
          minLength={8}
          autoComplete="new-password"
          required
        />
      </div>
      <LoadingButton type="submit" size="lg" pending={pending} disabled={!token}>
        Сохранить пароль
      </LoadingButton>
      <FieldError message={error} />
    </form>
  );
}
