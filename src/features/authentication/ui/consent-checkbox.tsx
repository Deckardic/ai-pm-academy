"use client";

import Link from "next/link";
import { routes } from "@/shared/config";
import { Checkbox } from "@/shared/ui";

/** 152-ФЗ: a separate, explicit consent — never pre-checked, never bundled into the terms. */
export function ConsentCheckbox({
  checked,
  onCheckedChange,
  invalid,
}: {
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  invalid?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-fg-muted">
      <Checkbox
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        aria-invalid={invalid || undefined}
        className={invalid ? "shadow-[inset_0_0_0_1.5px_var(--danger)]" : undefined}
      />
      <span>
        Даю{" "}
        <Link
          href={routes.consent()}
          target="_blank"
          className="text-fg underline decoration-line-strong underline-offset-2"
        >
          согласие на обработку персональных данных
        </Link>{" "}
        и принимаю{" "}
        <Link
          href={routes.terms()}
          target="_blank"
          className="text-fg underline decoration-line-strong underline-offset-2"
        >
          пользовательское соглашение
        </Link>
      </span>
    </label>
  );
}
