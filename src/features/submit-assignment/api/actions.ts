"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { getAllAssignments } from "@/entities/course/index.server";
import { upsertSubmission } from "@/entities/progress/index.server";
import { getCurrentUser } from "@/entities/user/index.server";

const inputSchema = z.object({
  assignmentId: z.string().max(20),
  text: z.string().trim().max(20_000),
  link: z
    .string()
    .trim()
    .max(500)
    .refine(
      (value) => value === "" || /^https?:\/\//.test(value),
      "Ссылка должна начинаться с http:// или https://",
    ),
  checklist: z.array(z.boolean()).max(20),
});

export async function submitAssignment(input: z.input<typeof inputSchema>) {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Проверьте данные" };
  const user = await getCurrentUser();
  if (!user) return { ok: false as const, error: "Войдите, чтобы сдать задание" };
  const assignment = getAllAssignments().find((item) => item.id === parsed.data.assignmentId);
  if (!assignment) return { ok: false as const, error: "Задание не найдено" };
  const { text, link, checklist } = parsed.data;
  if (!text && !link)
    return { ok: false as const, error: "Вставьте текст решения или ссылку на документ" };
  if (checklist.length !== assignment.checklist.length || checklist.some((item) => !item)) {
    return { ok: false as const, error: "Проверьте решение по всем пунктам чек-листа" };
  }
  await upsertSubmission({
    userId: user.id,
    assignmentId: assignment.id,
    moduleId: assignment.moduleId,
    text: text || null,
    link: link || null,
    checklist,
  });
  refresh();
  return { ok: true as const };
}
