import Link from "next/link";
import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib";

export const buttonVariants = cva(
  "relative inline-flex shrink-0 pressable cursor-pointer items-center justify-center gap-2 font-medium whitespace-nowrap select-none disabled:pointer-events-none disabled:opacity-50 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-accent text-accent-fg shadow-button hover:bg-accent-hover",
        secondary: "bg-surface text-fg shadow-sm hover:bg-bg-subtle",
        inverted: "bg-fg text-bg shadow-button hover:bg-fg/90",
        ghost: "text-fg-muted hover:bg-bg-subtle hover:text-fg",
        soft: "bg-accent-soft text-accent hover:bg-accent/15",
        danger: "bg-danger text-white shadow-button hover:bg-danger/90",
      },
      size: {
        sm: "h-8 rounded-md px-3 text-sm [&_svg]:size-3.5",
        md: "h-10 rounded-lg px-4 text-[0.9375rem] [&_svg]:size-4",
        lg: "h-12 rounded-xl px-6 text-base [&_svg]:size-[1.125rem]",
        icon: "size-9 rounded-lg [&_svg]:size-[1.125rem]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}: ComponentProps<"button"> & ButtonVariantProps) {
  return (
    <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}

export function ButtonLink({
  className,
  variant,
  size,
  ...props
}: ComponentProps<typeof Link> & ButtonVariantProps) {
  return <Link className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
