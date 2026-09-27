import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLessonById } from "@/entities/course/index.server";
import { getGlossary, getTerm } from "@/entities/glossary/index.server";
import { absoluteUrl, routes, siteConfig } from "@/shared/config";
import { JsonLd } from "@/shared/lib";
import { Breadcrumbs, Container, PageSkeleton } from "@/shared/ui";

type Params = { slug: string };

export function generateTermParams(): Params[] {
  return getGlossary().map((term) => ({ slug: term.slug }));
}

export async function generateTermMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const term = getTerm((await params).slug);
  return term
    ? {
        title: `${term.term}${term.en ? ` (${term.en})` : ""} — что это`,
        description: term.definition,
        alternates: { canonical: routes.glossaryTerm(term.slug) },
      }
    : {};
}

export function GlossaryTermPage({ params }: { params: Promise<Params> }) {
  return (
    <Suspense fallback={<PageSkeleton size="narrow" />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Promise<Params> }) {
  const term = getTerm((await params).slug);
  if (!term) notFound();
  const related = term.related.map((id) => getTerm(id)).filter((item) => item !== null);
  const lessons = term.lessonIds.map((id) => getLessonById(id)).filter((lesson) => lesson !== null);

  return (
    <Container size="narrow" className="py-10 lg:py-14">
      <Breadcrumbs
        items={[
          { label: "Глоссарий", href: routes.glossary() },
          { label: term.term, href: routes.glossaryTerm(term.slug) },
        ]}
      />
      <article className="mt-10 flex flex-col gap-6">
        <header>
          <h1 className="text-[clamp(2.25rem,5vw,3.25rem)] leading-[1.05] font-semibold tracking-[-0.04em]">
            {term.term}
          </h1>
          {term.en ? <p className="mt-2 text-lg text-fg-muted">англ. {term.en}</p> : null}
        </header>
        <p className="text-xl leading-relaxed">{term.definition}</p>
        {lessons.length > 0 ? (
          <section className="surface-card p-6">
            <h2 className="font-semibold">Подробно в уроках</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {lessons.map((lesson) => (
                <li key={lesson.id}>
                  <Link
                    href={routes.lesson(lesson.levelSlug, lesson.moduleSlug, lesson.slug)}
                    className="text-accent hover:underline"
                  >
                    {lesson.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {related.length > 0 ? (
          <section>
            <h2 className="text-sm font-medium text-fg-muted">Связанные термины</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {related.map((item) => (
                <li key={item.id}>
                  <Link
                    href={routes.glossaryTerm(item.slug)}
                    className="inline-flex h-8 pressable items-center rounded-full px-3.5 text-sm font-medium shadow-[inset_0_0_0_1px_var(--line-strong)] hover:bg-bg-subtle"
                  >
                    {item.term}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </article>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "DefinedTerm",
          name: term.term,
          alternateName: term.en,
          description: term.definition,
          url: absoluteUrl(routes.glossaryTerm(term.slug)),
          inDefinedTermSet: {
            "@type": "DefinedTermSet",
            name: `Глоссарий ${siteConfig.name}`,
            url: absoluteUrl(routes.glossary()),
          },
        }}
      />
    </Container>
  );
}
