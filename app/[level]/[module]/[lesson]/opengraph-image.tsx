import { getLessonContext } from "@/entities/course/index.server";
import { renderOgImage, ogSize } from "@/shared/og/index.server";

export const alt = "Урок AI PM Academy";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ level: string; module: string; lesson: string }>;
}) {
  const { level, module, lesson } = await params;
  const context = getLessonContext(level, module, lesson);
  if (!context) {
    return renderOgImage({ eyebrow: "AI PM Academy", title: "Урок не найден" });
  }
  return renderOgImage({
    eyebrow: `${context.level.title} · ${context.module.title}`,
    title: context.lesson.title,
    subtitle: `${context.lesson.durationMin} минут · бесплатный урок`,
    accent: context.level.id,
  });
}
