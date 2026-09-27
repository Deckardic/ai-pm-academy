import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Route } from "next";
import { auth } from "@/shared/auth/index.server";
import { routes } from "@/shared/config";

/** Deduplicated per request. Reads cookies, so callers must sit behind <Suspense>. */
export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));

export async function getCurrentUser() {
  return (await getSession())?.user ?? null;
}

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

export async function requireUser(next: Route | string) {
  const user = await getCurrentUser();
  if (!user) redirect(routes.signIn(next));
  return user;
}
