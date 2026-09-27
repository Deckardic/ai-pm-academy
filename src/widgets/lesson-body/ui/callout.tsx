import type { ReactNode } from "react";
import { AlertTriangle, Info, ShieldAlert, Sparkles } from "lucide-react";
import { cn } from "@/shared/lib";

const variants = {
  important: { icon: Info, label: "Важно", className: "bg-accent-soft", iconClass: "text-accent" },
  mistake: {
    icon: AlertTriangle,
    label: "Ошибка новичка",
    className: "bg-warning-soft",
    iconClass: "text-warning",
  },
  ai: {
    icon: Sparkles,
    label: "Совет с ИИ",
    className: "bg-middle-soft",
    iconClass: "text-middle",
  },
  data: {
    icon: ShieldAlert,
    label: "Осторожно: данные",
    className: "bg-danger-soft",
    iconClass: "text-danger",
  },
} as const;

export function Callout({
  type = "important",
  title,
  children,
}: {
  type?: keyof typeof variants;
  title?: string;
  children: ReactNode;
}) {
  const variant = variants[type];
  const Icon = variant.icon;
  return (
    <aside className={cn("not-prose rounded-xl px-5 py-4", variant.className)}>
      <p className={cn("flex items-center gap-2 text-sm font-semibold", variant.iconClass)}>
        <Icon aria-hidden className="size-4" />
        {title ?? variant.label}
      </p>
      <div className="mt-2 text-[0.9375rem] leading-relaxed text-fg/85 [&_li+li]:mt-1.5 [&_p+p]:mt-2 [&_strong]:font-semibold [&_strong]:text-fg [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </div>
    </aside>
  );
}
