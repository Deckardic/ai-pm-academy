import type { LevelId } from "../model/types";

/** Level color tokens, reused wherever a level is represented. Full class names so Tailwind can see them. */
export const levelTheme: Record<
  LevelId,
  { text: string; bg: string; soft: string; glow: string; tone: "junior" | "middle" | "senior" }
> = {
  junior: {
    text: "text-junior",
    bg: "bg-junior",
    soft: "bg-junior-soft",
    glow: "from-junior-soft",
    tone: "junior",
  },
  middle: {
    text: "text-middle",
    bg: "bg-middle",
    soft: "bg-middle-soft",
    glow: "from-middle-soft",
    tone: "middle",
  },
  senior: {
    text: "text-senior",
    bg: "bg-senior",
    soft: "bg-senior-soft",
    glow: "from-senior-soft",
    tone: "senior",
  },
};
