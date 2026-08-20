"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
  badge?: number;
}

export interface TabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  value?: string;
  onValueChange?: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, defaultTab, value: controlledValue, onValueChange, className }: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultTab ?? tabs[0]?.id);
  const active = controlledValue ?? internalValue;

  return (
    <div className={cn("flex flex-col", className)}>
      <div
        className="flex gap-1 overflow-x-auto border-b border-border no-scrollbar"
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                setInternalValue(tab.id);
                onValueChange?.(tab.id);
              }}
              className={cn(
                "relative flex items-center gap-1.5 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors",
                isActive ? "text-foreground" : "text-muted hover:text-foreground/80"
              )}
            >
              {tab.label}
              {typeof tab.badge === "number" && tab.badge > 0 && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                    isActive ? "bg-brand-500/20 text-brand-300" : "bg-white/10 text-muted"
                  )}
                >
                  {tab.badge}
                </span>
              )}
              {isActive && (
                <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand-500" />
              )}
            </button>
          );
        })}
      </div>
      <div className="pt-4">
        {tabs.find((tab) => tab.id === active)?.content}
      </div>
    </div>
  );
}