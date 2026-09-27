import { customAlphabet } from "nanoid";

// No ambiguous characters (0/O, 1/I/L) — codes are read aloud and typed by hand.
const alphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const segment = customAlphabet(alphabet, 4);

const levelLetter: Record<string, string> = { junior: "J", middle: "M", senior: "S" };

export function generateCertificateCode(levelSlug: string): string {
  return `AIPM-${levelLetter[levelSlug] ?? "X"}-${segment()}-${segment()}`;
}

export function normalizeCertificateCode(input: string): string {
  return input.trim().toUpperCase();
}

export const CERTIFICATE_DISCLAIMER =
  "Сертификат подтверждает прохождение бесплатного онлайн-курса и итогового тестирования. Не является документом об образовании или квалификации.";
