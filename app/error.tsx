"use client";

import { RotateCcw } from "lucide-react";
import { Button, Container } from "@/shared/ui";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Container
      size="narrow"
      className="flex flex-1 flex-col items-center justify-center gap-6 py-24 text-center"
    >
      <h1 className="text-3xl font-semibold tracking-tight">Что-то пошло не так</h1>
      <p className="max-w-md text-fg-muted">
        Мы уже знаем об ошибке. Попробуйте обновить страницу.
      </p>
      <Button onClick={reset}>
        <RotateCcw aria-hidden /> Попробовать снова
      </Button>
    </Container>
  );
}
