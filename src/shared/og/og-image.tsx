import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

const accents = {
  junior: "#2fa878",
  middle: "#3b7be0",
  senior: "#e0a030",
  brand: "#5b5bd6",
} as const;

async function fonts() {
  const dir = path.join(process.cwd(), "assets", "fonts");
  const [regular, semibold] = await Promise.all([
    readFile(path.join(dir, "Geist-Regular.ttf")),
    readFile(path.join(dir, "Geist-SemiBold.ttf")),
  ]);
  return [
    { name: "Geist", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Geist", data: semibold, weight: 600 as const, style: "normal" as const },
  ];
}

/** Shared Open Graph layout: dark card, level accent, Cyrillic-capable Geist. */
export async function renderOgImage({
  eyebrow,
  title,
  subtitle,
  accent = "brand",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  accent?: keyof typeof accents;
}) {
  const color = accents[accent];
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "#131418",
        color: "#f4f4f6",
        fontFamily: "Geist",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -220,
          right: -160,
          width: 640,
          height: 640,
          borderRadius: 640,
          background: color,
          opacity: 0.35,
          filter: "blur(120px)",
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 5,
            width: 48,
            height: 48,
            padding: 10,
            borderRadius: 14,
            background: "#f4f4f6",
          }}
        >
          <div style={{ width: 8, height: 12, borderRadius: 3, background: accents.junior }} />
          <div style={{ width: 8, height: 20, borderRadius: 3, background: accents.middle }} />
          <div style={{ width: 8, height: 28, borderRadius: 3, background: accents.senior }} />
        </div>
        <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.5 }}>AI PM Academy</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: 28, color, fontWeight: 600 }}>{eyebrow}</div>
        <div
          style={{
            fontSize: title.length > 48 ? 64 : 76,
            fontWeight: 600,
            lineHeight: 1.05,
            letterSpacing: -2.5,
            maxWidth: 1000,
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div style={{ fontSize: 30, color: "#a9abb6", lineHeight: 1.35, maxWidth: 980 }}>
            {subtitle}
          </div>
        ) : null}
      </div>
    </div>,
    { ...ogSize, fonts: await fonts() },
  );
}
