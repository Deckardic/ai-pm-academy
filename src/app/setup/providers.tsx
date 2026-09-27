"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster, TooltipProvider } from "@/shared/ui";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <TooltipProvider delay={400}>
        {children}
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}
