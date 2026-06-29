import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "border-card-border bg-white/5 text-text-secondary",
        blue: "border-accent-blue/20 bg-accent-blue/10 text-accent-blue",
        green: "border-accent-green/20 bg-accent-green/10 text-accent-green",
        amber: "border-accent-amber/20 bg-accent-amber/10 text-accent-amber",
        red: "border-accent-red/20 bg-accent-red/10 text-accent-red",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
