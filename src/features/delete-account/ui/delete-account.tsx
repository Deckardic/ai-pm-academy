"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/shared/auth";
import { routes } from "@/shared/config";
import { Dialog, DialogContent, DialogTrigger, FieldError, HoldToConfirm } from "@/shared/ui";

export function DeleteAccount() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onConfirm() {
    setPending(true);
    const { error: deleteError } = await authClient.deleteUser();
    setPending(false);
    if (deleteError) {
      return setError(
        deleteError.status === 400 || deleteError.status === 401
          ? "Для удаления нужно войти заново — выйдите и войдите, затем повторите"
          : "Не удалось удалить аккаунт. Напишите нам, и мы удалим данные вручную",
      );
    }
    router.push(routes.home());
    router.refresh();
  }

  return (
    <Dialog>
      <DialogTrigger className="cursor-pointer self-start text-sm font-medium text-danger hover:underline">
        Удалить аккаунт
      </DialogTrigger>
      <DialogContent
        title="Удалить аккаунт?"
        description="Будут удалены профиль, прогресс, результаты тестов, задания и сертификаты. Отменить это нельзя."
      >
        <HoldToConfirm onConfirm={onConfirm} disabled={pending}>
          Удерживайте, чтобы удалить
        </HoldToConfirm>
        <FieldError message={error} />
      </DialogContent>
    </Dialog>
  );
}
