import type { ReactNode } from "react";
import { KpiCard } from "./KpiCard";

export interface KpiItem {
  id: string;
  title: string;
  icon: ReactNode;
  value: number;
  format: (value: number) => string;
  delta: number;
  direction: "up" | "down" | "neutral";
  goodWhen: "up" | "down";
  sparkline: number[];
  hint?: string;
}

export function KpiGrid({
  items,
  periodKey,
  stagger = 60,
}: {
  items: KpiItem[];
  periodKey: string;
  stagger?: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 2xl:grid-cols-5">
      {items.map((item, index) => (
        <div key={item.id} className="animate-widget-in">
          <KpiCard {...item} delay={index * stagger} periodKey={periodKey} />
        </div>
      ))}
    </div>
  );
}