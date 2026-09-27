"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { routes } from "@/shared/config";
import { cn } from "@/shared/lib";
import { Button } from "@/shared/ui";
import {
  consentServerSnapshot,
  consentSnapshot,
  subscribeConsent,
  writeConsent,
  type Consent,
} from "../model/consent";

/**
 * Enters and leaves through the bottom edge (same path both ways), with a
 * slightly slower, elegant `ease` — it appears once per visitor.
 */
export function CookieBanner() {
  const consent = useSyncExternalStore(subscribeConsent, consentSnapshot, consentServerSnapshot);
  const [leaving, setLeaving] = useState<"leaving" | "gone" | null>(null);

  if (leaving === "gone" || (consent !== "none" && leaving === null)) return null;

  const choose = (value: Consent) => {
    setLeaving("leaving");
    setTimeout(() => {
      setLeaving("gone");
      writeConsent(value);
    }, 300);
  };
  const state = leaving ?? "shown";

  return (
    <div
      role="region"
      aria-label="Согласие на cookie"
      className={cn(
        "fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 mx-auto max-w-xl rounded-2xl bg-surface-raised p-5 shadow-popover transition-[transform,opacity] duration-400 ease-[ease] motion-reduce:transition-opacity starting:translate-y-full starting:opacity-0 motion-reduce:starting:translate-y-0 print:hidden",
        state === "leaving" &&
          "translate-y-full opacity-0 duration-300 motion-reduce:translate-y-0",
      )}
    >
      <p className="text-[0.9375rem] leading-relaxed">
        Мы используем обязательные cookie для входа в аккаунт и, с вашего согласия, Яндекс Метрику,
        чтобы улучшать уроки.{" "}
        <Link href={routes.cookies()} className="text-accent underline-offset-2 hover:underline">
          Подробнее
        </Link>
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" onClick={() => choose("all")}>
          Принять все
        </Button>
        <Button size="sm" variant="secondary" onClick={() => choose("essential")}>
          Только обязательные
        </Button>
      </div>
    </div>
  );
}
