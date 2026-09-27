/** Turns lesson MDX into clean Markdown for llms-full.txt: JSX components are dropped, prose stays. */
export function mdxToMarkdown(source: string): string {
  return source
    .replace(/<([A-Z][A-Za-z]*)\b[^>]*?\/>/gs, "") // self-closing components (quizzes, prompt cards)
    .replace(/<\/?[A-Z][A-Za-z]*\b[^>]*>/gs, "") // wrapper tags; inner prose is kept
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
