"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Tooltip } from "@/shared/ui";

/**
 * Icons crossfade with a touch of blur so the swap reads as one morphing
 * glyph. Visibility is CSS-driven (.dark), so there is no hydration flash.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const icon =
    "absolute size-[1.125rem] transition-[opacity,transform,filter] duration-200 ease-out motion-reduce:transition-none";
  return (
    <Tooltip content="Сменить тему">
      <button
        type="button"
        aria-label="Сменить тему"
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        className="relative grid size-9 pressable cursor-pointer place-items-center rounded-lg text-fg-muted hover:bg-bg-subtle hover:text-fg"
      >
        <Sun
          className={`${icon} scale-100 opacity-100 dark:scale-75 dark:opacity-0 dark:blur-[2px]`}
        />
        <Moon
          className={`${icon} scale-75 opacity-0 blur-[2px] dark:scale-100 dark:opacity-100 dark:blur-none`}
        />
      </button>
    </Tooltip>
  );
}
