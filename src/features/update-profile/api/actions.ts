"use server";

import { eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/entities/user/index.server";
import { getDb, schema } from "@/shared/db/index.server";

const inputSchema = z.object({
  name: z.string().trim().min(2, "Укажите имя и фамилию").max(120),
  nameLatin: z
    .string()
    .trim()
    .max(120)
    .regex(/^[A-Za-z .'-]*$/, "Только латинские буквы")
    .transform((value) => value || null),
  emailReminders: z.boolean(),
});

export async function updateProfile(input: z.input<typeof inputSchema>) {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Проверьте данные" };
  const user = await getCurrentUser();
  if (!user) return { ok: false as const, error: "Войдите заново" };
  await getDb().update(schema.user).set(parsed.data).where(eq(schema.user.id, user.id));
  refresh();
  return { ok: true as const };
}
