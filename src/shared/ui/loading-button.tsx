import type { ComponentProps } from "react";
import { cn } from "@/shared/lib";
import { Button, type ButtonVariantProps } from "./button";
import { Spinner } from "./spinner";

/**
 * While pending, the label blurs out and a spinner blurs in. The blur bridges
 * the crossfade so it reads as one element changing state, not two swapping.
 */
export function LoadingButton({
  pending,
  children,
  className,
  disabled,
  ...props
}: ComponentProps<typeof Button> & ButtonVariantProps & { pending?: boolean }) {
  const layer =
    "transition-[opacity,filter,transform] duration-200 ease-out motion-reduce:transition-opacity";
  return (
    <Button
      {...props}
      aria-busy={pending || undefined}
      disabled={disabled || pending}
      className={cn("relative", className, pending && "disabled:opacity-100")}
    >
      <span
        className={cn(
          "inline-flex items-center gap-2",
          layer,
          pending && "scale-[0.98] opacity-0 blur-[2px]",
        )}
      >
        {children}
      </span>
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 grid place-items-center",
          layer,
          !pending && "scale-90 opacity-0 blur-[2px]",
        )}
      >
        <Spinner />
      </span>
    </Button>
  );
}
