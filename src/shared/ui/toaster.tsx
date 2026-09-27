"use client";

import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "next-themes";

export { toast } from "sonner";

export function Toaster() {
  const { resolvedTheme } = useTheme();
  return (
    <SonnerToaster
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      position="bottom-center"
      offset={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
      toastOptions={{
        classNames: {
          toast: "!rounded-xl !shadow-popover !bg-surface-raised !text-fg !border-0 !font-sans",
          description: "!text-fg-muted",
        },
      }}
    />
  );
}
