import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/shared/config";

// Private or low-value paths. Everything else is open — including to AI
// crawlers: the content is free and being cited by assistants is a goal (GEO).
const disallow = [
  "/api/",
  "/kabinet",
  "/vhod",
  "/sertifikat/",
  "/*/test$",
  "/*/ekzamen$",
  "/*/praktika$",
];

const aiCrawlers = [
  "YandexBot",
  "YandexAdditional",
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "PerplexityBot",
  "Google-Extended",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      { userAgent: aiCrawlers, allow: "/", disallow },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
