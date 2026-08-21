"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Contagem animada de 0 até o valor alvo (ease-out cúbico).
 * Reescreve o valor do zero sempre que `resetKey` mudar.
 */
export function useCountUp(target: number, duration = 650, resetKey?: string) {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration, resetKey]);

  return { value };
}