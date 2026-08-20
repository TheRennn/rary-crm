import { cn } from "@/lib/utils";
import { IconRary } from "@/components/icons";

export interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const markSizes = {
  sm: "h-7 w-7 rounded-lg",
  md: "h-9 w-9 rounded-lg",
  lg: "h-11 w-11 rounded-xl",
};

const textSizes = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

export function Logo({ className, showText = true, size = "md" }: LogoProps) {
  return (
    <span className={cn("flex items-center gap-2.5 select-none", className)}>
      <span
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white shadow-lg shadow-brand-600/40 ring-1 ring-white/10",
          markSizes[size]
        )}
      >
        <IconRary className="h-[62%] w-[62%]" />
      </span>
      {showText && (
        <span className={cn("flex flex-col", textSizes[size])}>
          <span className="font-bold tracking-tight text-foreground leading-none">
            RARY <span className="text-brand-400">CRM</span>
          </span>
        </span>
      )}
    </span>
  );
}