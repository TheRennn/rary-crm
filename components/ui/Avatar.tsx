import type { HTMLAttributes } from "react";
import { cn, initials } from "@/lib/utils";
import { IconUser } from "@/components/icons";

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  name?: string;
  size?: "sm" | "md" | "lg";
  src?: string;
}

const sizeClasses = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-9 w-9 text-xs",
  lg: "h-12 w-12 text-base",
};

export function Avatar({ name, size = "md", className, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border-strong bg-surface-3 font-semibold text-brand-300 select-none",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {name ? initials(name) : <IconUser className="h-4 w-4 text-muted" />}
    </div>
  );
}