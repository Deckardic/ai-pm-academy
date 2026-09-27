/**
 * Minimal OpenAI-compatible chat client (works with YandexGPT, GigaChat
 * gateways, OpenAI-compatible self-hosted models, etc.). Content generation
 * sends no personal data, so any model available to the developer is allowed.
 */
export type LlmConfig = { baseUrl: string; apiKey: string; model: string };
export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export function llmConfig(prefix: "CONTENT_LLM" | "CONTENT_REVIEW"): LlmConfig {
  const baseUrl = process.env[`${prefix}_BASE_URL`];
  const apiKey = process.env[`${prefix}_API_KEY`];
  const model = process.env[`${prefix}_MODEL`];
  if (!baseUrl || !apiKey || !model) {
    throw new Error(
      `Не заданы ${prefix}_BASE_URL, ${prefix}_API_KEY и ${prefix}_MODEL. См. .env.example и docs/CONTENT.md.`,
    );
  }
  return { baseUrl: baseUrl.replace(/\/$/, ""), apiKey, model };
}

export async function chat(
  config: LlmConfig,
  messages: ChatMessage[],
  options: { temperature?: number } = {},
) {
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.apiKey}` },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: options.temperature ?? 0.4,
    }),
  });
  if (!response.ok) throw new Error(`LLM ${response.status}: ${await response.text()}`);
  const data = (await response.json()) as { choices: { message: { content: string } }[] };
  const content = data.choices[0]?.message.content;
  if (!content) throw new Error("LLM вернула пустой ответ");
  return content;
}

/** Strips ``` fences if the model wrapped its answer in a code block. */
export function unfence(text: string): string {
  const match = /^```[a-z]*\n([\s\S]*?)\n```\s*$/i.exec(text.trim());
  return (match ? match[1]! : text).trim();
}
