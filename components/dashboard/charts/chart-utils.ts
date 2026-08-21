export interface Point {
  x: number;
  y: number;
}

export function mapPoints(
  values: number[],
  width: number,
  height: number,
  padX = 2,
  padY = 4
): Point[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const innerWidth = width - padX * 2;
  const innerHeight = height - padY * 2;

  return values.map((value, index) => ({
    x: padX + (index / Math.max(values.length - 1, 1)) * innerWidth,
    y: padY + innerHeight - ((value - min) / range) * innerHeight,
  }));
}

/** Converte pontos em um path suave (Catmull-Rom → Bézier cúbica). */
export function smoothPath(points: Point[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    path += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(
      2
    )}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return path;
}

export function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, value));
}

/** Seleciona índices distribuídos uniformemente (sempre inclui o último) para reduzir rótulos do eixo X. */
export function selectTickIndices(count: number, maxTicks: number): number[] {
  if (count <= maxTicks) return Array.from({ length: count }, (_, i) => i);
  const step = (count - 1) / (maxTicks - 1);
  const indices: number[] = [];
  for (let i = 0; i < maxTicks; i++) {
    indices.push(Math.round(i * step));
  }
  return [...new Set(indices)];
}

export function shortNumber(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(".", ",")}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return String(Math.round(value));
}