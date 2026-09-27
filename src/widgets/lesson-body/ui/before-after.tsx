import type { ReactNode } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/shared/lib";

export function BeforeAfter({ children }: { children: ReactNode }) {
  return <div className="not-prose grid gap-3 sm:grid-cols-2">{children}</div>;
}

function Side({
  tone,
  title,
  time,
  children,
}: {
  tone: "before" | "after";
  title?: string;
  time?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl p-5",
        tone === "before" ? "bg-bg-subtle shadow-sm" : "bg-accent-soft",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className={cn("text-sm font-semibold", tone === "after" && "text-accent")}>
          {title ?? (tone === "before" ? "Без ИИ" : "С ИИ")}
        </span>
        {time ? (
          <span className="inline-flex items-center gap-1 text-sm text-fg-muted tabular-nums">
            <Clock aria-hidden className="size-3.5" /> {time}
          </span>
        ) : null}
      </div>
      <div className="text-[0.9375rem] leading-relaxed text-fg/85">{children}</div>
    </div>
  );
}

export function Before(props: { title?: string; time?: string; children: ReactNode }) {
  return <Side tone="before" {...props} />;
}

export function After(props: { title?: string; time?: string; children: ReactNode }) {
  return <Side tone="after" {...props} />;
}
