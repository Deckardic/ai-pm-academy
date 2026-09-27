import Link from "next/link";
import { FileText } from "lucide-react";
import type { Template } from "@/entities/template";
import { routes } from "@/shared/config";

export function TemplateLink({ template }: { template: Template | null }) {
  if (!template) return null;
  return (
    <Link
      href={routes.template(template.slug)}
      data-plain
      className="not-prose flex items-center gap-4 surface-card p-4 transition-shadow duration-200 ease-out hover:shadow-card-hover"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
        <FileText aria-hidden className="size-5" />
      </span>
      <span className="flex flex-col">
        <span className="text-sm font-semibold">Шаблон: {template.title}</span>
        <span className="text-sm text-fg-muted">{template.summary}</span>
      </span>
    </Link>
  );
}
