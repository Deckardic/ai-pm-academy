"use client";

import { useEffect, useRef, useState } from "react";
import type { Heading } from "@/shared/content";
import { cn } from "@/shared/lib";

/**
 * Scroll-spy table of contents. The marker glides between items (on-screen
 * movement → ease-in-out); it is set via transform on the element directly.
 */
export function LessonToc({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState<string | null>(headings[0]?.id ?? null);
  const listRef = useRef<HTMLOListElement>(null);
  const markerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => element !== null);
    if (elements.length === 0) return;
    let frame = 0;
    // The active heading is the last one whose top has passed the reading line.
    const update = () => {
      frame = 0;
      const line = 120;
      let current = elements[0]!.id;
      for (const element of elements) {
        if (element.getBoundingClientRect().top <= line) current = element.id;
        else break;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [headings]);

  useEffect(() => {
    const item = listRef.current?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    if (!item || !markerRef.current) return;
    markerRef.current.style.transform = `translateY(${item.offsetTop}px)`;
    markerRef.current.style.height = `${item.offsetHeight}px`;
    markerRef.current.style.opacity = "1";
  }, [active]);

  if (headings.length === 0) return null;
  return (
    <nav aria-label="Содержание урока" className="text-sm">
      <p className="mb-3 font-medium">Содержание</p>
      <div className="relative">
        <span aria-hidden className="absolute inset-y-0 left-0 w-px bg-line" />
        <span
          ref={markerRef}
          aria-hidden
          className="absolute top-0 left-0 w-px bg-accent opacity-0 transition-[transform,height] duration-250 ease-in-out motion-reduce:transition-none"
        />
        <ol ref={listRef} className="flex flex-col">
          {headings.map((heading) => (
            <li key={heading.id} data-id={heading.id}>
              <a
                href={`#${heading.id}`}
                aria-current={active === heading.id ? "location" : undefined}
                className={cn(
                  "block py-1.5 leading-snug text-fg-muted transition-colors duration-150 ease-[ease] hover:text-fg",
                  heading.depth === 2 ? "pl-4" : "pl-7 text-[0.8125rem]",
                  active === heading.id && "text-fg",
                )}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
