import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight, FileText } from "lucide-react";
import { getTemplates } from "@/entities/template/index.server";
import { routes } from "@/shared/config";
import { Badge, Container, PageHeader } from "@/shared/ui";

export const templatesMetadata: Metadata = {
  title: "Шаблоны документов проекта",
  description:
    "Бесплатные шаблоны для проект-менеджера: устав проекта, реестр рисков, статус-отчёт, протокол встречи, аудит Kanban-доски. Копируйте или скачивайте.",
  alternates: { canonical: routes.templates() },
};

const levelLabel = { junior: "Junior", middle: "Middle", senior: "Senior" } as const;

export function TemplatesPage() {
  const templates = getTemplates();
  return (
    <Container className="flex flex-col gap-12 py-14 lg:py-20">
      <PageHeader
        eyebrow={<Badge tone="accent">Библиотека</Badge>}
        title="Шаблоны документов"
        description="Рабочие шаблоны, на которых строится практика курса. Скопируйте в свой редактор или скачайте файлом."
      />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <li key={template.id}>
            <Link
              href={routes.template(template.slug)}
              className="group flex h-full flex-col gap-4 surface-card p-6 transition-shadow duration-200 ease-out hover:shadow-card-hover"
            >
              <div className="flex items-center justify-between">
                <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent">
                  <FileText aria-hidden className="size-5" />
                </span>
                <ArrowUpRight
                  aria-hidden
                  className="size-4 text-fg-subtle transition-colors duration-150 ease-[ease] group-hover:text-fg"
                />
              </div>
              <div>
                <h2 className="text-lg font-semibold tracking-tight">{template.title}</h2>
                <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-fg-muted">
                  {template.summary}
                </p>
              </div>
              <Badge size="sm" className="mt-auto self-start">
                {levelLabel[template.level]}
              </Badge>
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
