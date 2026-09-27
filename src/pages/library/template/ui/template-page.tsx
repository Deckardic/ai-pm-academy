import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Download } from "lucide-react";
import { getLessonById } from "@/entities/course/index.server";
import { getTemplate, getTemplates } from "@/entities/template/index.server";
import { routes } from "@/shared/config";
import { renderMdx } from "@/shared/content/index.server";
import { Breadcrumbs, ButtonLink, Container, CopyButton, PageSkeleton } from "@/shared/ui";

type Params = { slug: string };

export function generateTemplateParams(): Params[] {
  return getTemplates().map((template) => ({ slug: template.slug }));
}

export async function generateTemplateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const template = getTemplate((await params).slug);
  return template
    ? {
        title: `Шаблон: ${template.title}`,
        description: template.summary,
        alternates: { canonical: routes.template(template.slug) },
      }
    : {};
}

export function TemplatePage({ params }: { params: Promise<Params> }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Promise<Params> }) {
  const template = getTemplate((await params).slug);
  if (!template) notFound();
  const lessons = template.lessonIds
    .map((id) => getLessonById(id))
    .filter((lesson) => lesson !== null);

  return (
    <Container className="py-10 lg:py-14">
      <Breadcrumbs
        items={[
          { label: "Шаблоны", href: routes.templates() },
          { label: template.title, href: routes.template(template.slug) },
        ]}
      />
      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0">
          <h1 className="text-[clamp(2rem,4vw,2.75rem)] leading-[1.08] font-semibold tracking-[-0.035em]">
            {template.title}
          </h1>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-fg-muted">{template.summary}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <CopyButton
              text={template.body}
              variant="primary"
              size="md"
              label="Скопировать шаблон"
            />
            <ButtonLink
              href={routes.templateDownload(template.slug)}
              variant="secondary"
              prefetch={false}
            >
              <Download aria-hidden /> Скачать .md
            </ButtonLink>
          </div>
          <div className="mt-10 surface-card p-6 sm:p-10">
            <div className="prose-lesson max-w-none">{await renderMdx(template.body, {})}</div>
          </div>
        </div>
        <aside className="flex flex-col gap-4">
          <div className="surface-card p-6">
            <h2 className="font-semibold">Как использовать</h2>
            <ol className="mt-4 flex flex-col gap-3 text-[0.9375rem] leading-relaxed text-fg/85">
              {template.howToUse.map((tip, index) => (
                <li key={tip} className="flex gap-3">
                  <span className="text-fg-subtle tabular-nums">{index + 1}.</span>
                  {tip}
                </li>
              ))}
            </ol>
          </div>
          {lessons.length > 0 ? (
            <div className="surface-card p-6">
              <h2 className="font-semibold">Где в курсе</h2>
              <ul className="mt-3 flex flex-col gap-2">
                {lessons.map((lesson) => (
                  <li key={lesson.id}>
                    <a
                      href={routes.lesson(lesson.levelSlug, lesson.moduleSlug, lesson.slug)}
                      className="text-[0.9375rem] text-accent hover:underline"
                    >
                      {lesson.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>
    </Container>
  );
}
