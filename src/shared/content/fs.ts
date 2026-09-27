import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import type { z } from "zod";

export const CONTENT_ROOT = path.join(process.cwd(), "content");

// Content is immutable at runtime in production; re-read on every call in dev.
const memo = new Map<string, unknown>();
const shouldMemo = process.env.NODE_ENV === "production";

export function memoize<T>(key: string, load: () => T): T {
  if (!shouldMemo) return load();
  if (!memo.has(key)) memo.set(key, load());
  return memo.get(key) as T;
}

export class ContentError extends Error {
  constructor(file: string, message: string) {
    super(`[content] ${path.relative(process.cwd(), file)}: ${message}`);
    this.name = "ContentError";
  }
}

export function contentPath(...segments: string[]): string {
  return path.join(CONTENT_ROOT, ...segments);
}

export function exists(file: string): boolean {
  return fs.existsSync(file);
}

export function listDirs(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter(
      (entry) => entry.isDirectory() && !entry.name.startsWith("_") && !entry.name.startsWith("."),
    )
    .map((entry) => entry.name)
    .sort();
}

export function listFiles(dir: string, extension: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter(
      (entry) => entry.isFile() && entry.name.endsWith(extension) && !entry.name.startsWith("_"),
    )
    .map((entry) => entry.name)
    .sort();
}

function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("; ");
}

export function readYaml<S extends z.ZodType>(file: string, schema: S): z.output<S> {
  const raw = fs.readFileSync(file, "utf8");
  let data: unknown;
  try {
    data = parseYaml(raw);
  } catch (error) {
    throw new ContentError(file, `invalid YAML — ${(error as Error).message}`);
  }
  const result = schema.safeParse(data);
  if (!result.success) throw new ContentError(file, formatIssues(result.error));
  return result.data;
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

export type MdxFile<T> = {
  file: string;
  frontmatter: T;
  body: string;
};

export function readMdx<S extends z.ZodType>(file: string, schema: S): MdxFile<z.output<S>> {
  const raw = fs.readFileSync(file, "utf8");
  const match = FRONTMATTER.exec(raw);
  if (!match) throw new ContentError(file, "missing frontmatter block");
  let data: unknown;
  try {
    data = parseYaml(match[1] ?? "");
  } catch (error) {
    throw new ContentError(file, `invalid frontmatter — ${(error as Error).message}`);
  }
  const result = schema.safeParse(data);
  if (!result.success) throw new ContentError(file, formatIssues(result.error));
  return { file, frontmatter: result.data, body: raw.slice(match[0].length) };
}
