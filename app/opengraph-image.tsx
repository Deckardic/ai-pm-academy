import { renderOgImage, ogSize } from "@/shared/og/index.server";

export const alt = "AI PM Academy — бесплатный курс управления проектами с ИИ";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({
    eyebrow: "Бесплатный курс · Junior и Middle",
    title: "Станьте проект-менеджером, который работает с ИИ",
    subtitle:
      "Управление проектами и современные ИИ-практики — на реальных задачах, с тестами и сертификатом.",
  });
}
