import { Badge } from "@/shared/ui";
import type { LevelId } from "../model/types";
import { levelTheme } from "./level-theme";

export function LevelBadge({
  levelId,
  title,
  className,
}: {
  levelId: LevelId;
  title: string;
  className?: string;
}) {
  return (
    <Badge tone={levelTheme[levelId].tone} className={className}>
      <span aria-hidden className={`size-1.5 rounded-full ${levelTheme[levelId].bg}`} />
      {title}
    </Badge>
  );
}
