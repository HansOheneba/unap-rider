import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 min-h-12",
  {
    variants: {
      variant: {
        default: "bg-black text-white hover:bg-zinc-800",
        outline:
          "border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50",
        ghost: "text-zinc-700 hover:bg-zinc-100",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        link: "text-zinc-900 underline-offset-4 hover:underline min-h-0",
      },
      size: {
        default: "h-12 px-4 py-2",
        sm: "h-10 rounded-md px-3 text-xs min-h-10",
        lg: "h-14 rounded-md px-6 text-base",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
