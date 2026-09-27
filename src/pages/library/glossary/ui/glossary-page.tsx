import Link from "next/link";
import type { Metadata } from "next";
import { getGlossary } from "@/entities/glossary/index.server";
import type { GlossaryTerm } from "@/entities/glossary";
import { absoluteUrl, routes, siteConfig } from "@/shared/config";
import { JsonLd } from "@/shared/lib";
import { Badge, Container, PageHeader } from "@/shared/ui";

export const glossaryMetadata: Metadata = {
  title: "Глоссарий проектного управления и ИИ",
  description:
    "Термины проектного управления и искусственного интеллекта простыми словами: WBS, WIP-лимит, закон Литтла, LLM, галлюцинации, промпт и другие — с английскими эквивалентами.",
  alternates: { canonical: routes.glossary() },
};

function groupByLetter(terms: GlossaryTerm[]) {
  const groups = new Map<string, GlossaryTerm[]>();
  for (const term of terms) {
    const letter = term.term[0]!.toUpperCase();
    groups.set(letter, [...(groups.get(letter) ?? []), term]);
  }
  return [...groups.entries()];
}

export function GlossaryPage() {
  const terms = getGlossary();
  const groups = groupByLetter(terms);
  return (
    <Container className="flex flex-col gap-12 py-14 lg:py-20">
      <PageHeader
        eyebrow={<Badge tone="accent">Библиотека</Badge>}
        title="Глоссарий"
        description="Термины проектного управления и ИИ простыми словами — с английскими эквивалентами, которые вы встретите в работе."
      />
      <nav aria-label="Алфавитный указатель" className="flex flex-wrap gap-1">
        {groups.map(([letter]) => (
          <a
            key={letter}
            href={`#letter-${letter}`}
            className="grid size-9 pressable place-items-center rounded-lg text-sm font-medium shadow-[inset_0_0_0_1px_var(--line)] hover:bg-bg-subtle"
          >
            {letter}
          </a>
        ))}
      </nav>
      <div className="flex flex-col gap-10">
        {groups.map(([letter, items]) => (
          <section
            key={letter}
            id={`letter-${letter}`}
            aria-label={letter}
            className="grid gap-4 sm:grid-cols-[4rem_1fr]"
          >
            <h2 className="text-3xl font-semibold text-fg-subtle">{letter}</h2>
            <dl className="grid gap-3 md:grid-cols-2">
              {items.map((term) => (
                <div key={term.id} className="surface-card p-5">
                  <dt>
                    <Link
                      href={routes.glossaryTerm(term.slug)}
                      className="font-semibold hover:text-accent"
                    >
                      {term.term}
                    </Link>
                    {term.en ? (
                      <span className="ml-2 text-sm text-fg-subtle">{term.en}</span>
                    ) : null}
                  </dt>
                  <dd className="mt-1.5 text-[0.9375rem] leading-relaxed text-fg-muted">
                    {term.short}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "DefinedTermSet",
          name: `Глоссарий ${siteConfig.name}`,
          url: absoluteUrl(routes.glossary()),
          inLanguage: "ru",
          hasDefinedTerm: terms.map((term) => ({
            "@type": "DefinedTerm",
            name: term.term,
            alternateName: term.en,
            description: term.short,
            url: absoluteUrl(routes.glossaryTerm(term.slug)),
          })),
        }}
      />
    </Container>
  );
}
