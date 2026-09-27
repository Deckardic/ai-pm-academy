import type { ReactNode } from "react";

/** Numbered steps with connected markers. Wraps a Markdown ordered list. */
export function Steps({ children }: { children: ReactNode }) {
  return (
    <div className="not-prose [counter-reset:step] [&_li]:relative [&_li]:pb-5 [&_li]:pl-11 [&_li]:leading-relaxed [&_li]:text-fg/85 [&_li]:[counter-increment:step] [&_li]:before:absolute [&_li]:before:top-0 [&_li]:before:left-0 [&_li]:before:grid [&_li]:before:size-7 [&_li]:before:place-items-center [&_li]:before:rounded-full [&_li]:before:bg-accent-soft [&_li]:before:text-sm [&_li]:before:font-semibold [&_li]:before:text-accent [&_li]:before:content-[counter(step)] [&_li:not(:last-child)]:after:absolute [&_li:not(:last-child)]:after:top-8 [&_li:not(:last-child)]:after:bottom-1 [&_li:not(:last-child)]:after:left-3.5 [&_li:not(:last-child)]:after:w-px [&_li:not(:last-child)]:after:bg-line-strong [&_ol]:list-none [&_strong]:font-semibold [&_strong]:text-fg">
      {children}
    </div>
  );
}
