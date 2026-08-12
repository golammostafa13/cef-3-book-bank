import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 active:translate-y-px",
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-accent-ink shadow-e2 hover:bg-accent-hover hover:shadow-e3 hover:-translate-y-0.5",
        ink: "bg-ink text-bg shadow-e2 hover:shadow-e3 hover:-translate-y-0.5",
        outline:
          "border border-ink/20 bg-transparent text-ink hover:border-ink/45 hover:bg-ink/5",
        soft: "bg-surface text-ink shadow-e1 hover:shadow-e2 hover:-translate-y-0.5",
        ghost: "text-ink-mute hover:bg-ink/5 hover:text-ink",
        danger: "bg-danger text-white shadow-e1 hover:brightness-110",
      },
      size: {
        sm: "h-9 px-4 text-sm [&_svg]:size-4",
        md: "h-11 px-6 text-[0.95rem] [&_svg]:size-4",
        lg: "h-14 px-8 text-base [&_svg]:size-5",
        icon: "size-10 [&_svg]:size-4",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { buttonVariants };
