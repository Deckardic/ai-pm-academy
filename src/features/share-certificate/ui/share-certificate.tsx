"use client";

import { Printer } from "lucide-react";
import { Button, CopyButton } from "@/shared/ui";

export function ShareCertificate({ url, title }: { url: string; title: string }) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const linkClass =
    "pressable inline-flex h-8 items-center gap-2 rounded-md bg-surface px-3 text-sm font-medium shadow-sm hover:bg-bg-subtle";
  return (
    <div className="flex flex-col gap-4 print:hidden">
      <div className="flex flex-wrap gap-2">
        <a
          className={linkClass}
          href={`https://vk.com/share.php?url=${encodedUrl}&title=${encodedTitle}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          ВКонтакте
        </a>
        <a
          className={linkClass}
          href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Telegram
        </a>
        <CopyButton text={url} label="Скопировать ссылку" />
        <Button variant="secondary" size="sm" onClick={() => window.print()}>
          <Printer aria-hidden /> Сохранить в PDF
        </Button>
      </div>
      <p className="text-sm leading-relaxed text-fg-muted">
        Как добавить в резюме на hh.ru: в разделе «Образование» → «Курсы и тренинги» укажите «AI PM
        Academy», название уровня и год, а в описании — ссылку на эту страницу для проверки.
      </p>
    </div>
  );
}
