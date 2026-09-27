import path from "node:path";
import { contentPath, listFiles, memoize, readYaml } from "@/shared/content/index.server";
import { promptSchema, type Prompt } from "../model/schema";

const DIR = contentPath("library", "prompts");

export function getPrompts(): Prompt[] {
  return memoize("prompts", () =>
    listFiles(DIR, ".yaml").map((name) => readYaml(path.join(DIR, name), promptSchema)),
  );
}

export function getPrompt(id: string): Prompt | null {
  return getPrompts().find((prompt) => prompt.id === id) ?? null;
}
