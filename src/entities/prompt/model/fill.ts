const VARIABLE = /\{\{\s*([a-zA-Z][a-zA-Z0-9_]*)\s*\}\}/g;

export function extractVariables(body: string): string[] {
  return [...new Set([...body.matchAll(VARIABLE)].map((match) => match[1]!))];
}

/** Replaces {{name}} with the value; empty values keep a readable [label] marker. */
export function fillPrompt(
  body: string,
  values: Record<string, string>,
  labels: Record<string, string> = {},
): string {
  return body.replace(VARIABLE, (_, name: string) => {
    const value = values[name]?.trim();
    return value ? value : `[${labels[name] ?? name}]`;
  });
}
