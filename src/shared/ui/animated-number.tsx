"use client";

import NumberFlow, { type Format } from "@number-flow/react";

type AnimatedNumberProps = {
  value: number;
  format?: Format;
  suffix?: string;
  className?: string;
};

/** Digits roll instead of re-rendering text (NumberFlow). Respects reduced motion. */
export function AnimatedNumber({ value, format, suffix, className }: AnimatedNumberProps) {
  return (
    <NumberFlow
      value={value}
      locales="ru-RU"
      format={format}
      suffix={suffix}
      className={className}
      respectMotionPreference
      willChange
    />
  );
}
