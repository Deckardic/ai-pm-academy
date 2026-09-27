import path from "node:path";
import type { Metadata } from "next";
import { z } from "zod";
import { contentPath, readMdx, renderMdx } from "@/shared/content/index.server";
import { formatDate } from "@/shared/lib";
import { Container } from "@/shared/ui";
import { LegalCallout } from "./legal-callout";

const frontmatter = z.object({ title: z.string(), updatedAt: z.iso.date() });

export type LegalDoc = "politika-konfidencialnosti" | "soglasie" | "soglashenie" | "cookies";

function load(doc: LegalDoc) {
  return readMdx(path.join(contentPath("legal"), `${doc}.mdx`), frontmatter);
}

export function legalMetadata(doc: LegalDoc): Metadata {
  return { title: load(doc).frontmatter.title, alternates: { canonical: `/${doc}` } };
}

export async function LegalPage({ doc }: { doc: LegalDoc }) {
  const { frontmatter: meta, body } = load(doc);
  return (
    <Container size="narrow" className="py-14 lg:py-20">
      <h1 className="text-[clamp(2rem,4vw,2.75rem)] leading-[1.08] font-semibold tracking-[-0.035em]">
        {meta.title}
      </h1>
      <p className="mt-3 text-sm text-fg-muted">Редакция от {formatDate(meta.updatedAt)}</p>
      <div className="prose-lesson mt-10">{await renderMdx(body, { Callout: LegalCallout })}</div>
    </Container>
  );
}
