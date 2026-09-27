import type { ComponentType, ReactNode } from "react";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import GithubSlugger from "github-slugger";
import { remarkTypograf } from "./remark-typograf";
import { typo } from "./typograf";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MdxComponents = Record<string, ComponentType<any>>;

/**
 * Compiles trusted MDX from the repository into React elements on the server.
 * Content is authored in Git and validated in CI — never user input.
 */
export async function renderMdx(source: string, components: MdxComponents): Promise<ReactNode> {
  const { default: Content } = await evaluate(source, {
    ...runtime,
    remarkPlugins: [remarkGfm, remarkTypograf],
    rehypePlugins: [rehypeSlug],
    development: false,
  });
  return <Content components={components} />;
}

export type Heading = { id: string; text: string; depth: 2 | 3 };

/** Table of contents from ## / ### headings; ids match rehype-slug output. */
export function extractHeadings(source: string): Heading[] {
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];
  let inFence = false;
  for (const line of source.split("\n")) {
    if (line.trimStart().startsWith("```")) inFence = !inFence;
    if (inFence) continue;
    const match = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;
    const raw = (match[2] ?? "").replace(/[*_`]/g, "");
    const text = typo(raw);
    headings.push({ id: slugger.slug(text), text, depth: match[1]!.length as 2 | 3 });
  }
  return headings;
}

/** Plain-text excerpt for search engines and llms.txt. */
export function toPlainText(source: string): string {
  return source
    .replace(/```[\s\S]*?```/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_`|]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}
