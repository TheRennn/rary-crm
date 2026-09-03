export type ClassValue = string | number | bigint | null | undefined | false;

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(
  iso: string | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return new Intl.DateTimeFormat("pt-BR", options ?? { day: "2-digit", month: "2-digit", year: "numeric" }).format(
    date
  );
}

export function formatDateShort(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(date);
}

export function formatFullDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(date);
}

export function formatTime(time: string): string {
  if (!time) return "—";
  return time;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function generateClientCode(existingCodes: string[]): string {
  let max = 0;
  for (const code of existingCodes) {
    const match = code.match(/^CLT-(\d+)$/);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `CLT-${String(max + 1).padStart(6, "0")}`;
}

export function formatDocument(doc: string): string {
  const clean = doc.replace(/\D/g, "");
  if (clean.length === 11) {
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  if (clean.length === 14) {
    return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }
  return doc;
}

export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 10) {
    let result = `(${digits.slice(0, 2)}`;
    if (digits.length > 2) result += `) ${digits.slice(2, 6)}`;
    if (digits.length > 6) result += `-${digits.slice(6, 10)}`;
    return result;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export function maskCpf(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  let result = digits.slice(0, 3);
  if (digits.length > 3) result += `.${digits.slice(3, 6)}`;
  if (digits.length > 6) result += `.${digits.slice(6, 9)}`;
  if (digits.length > 9) result += `-${digits.slice(9, 11)}`;
  return result;
}

export function maskCnpj(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length === 0) return "";
  let result = digits.slice(0, 2);
  if (digits.length > 2) result += `.${digits.slice(2, 5)}`;
  if (digits.length > 5) result += `.${digits.slice(5, 8)}`;
  if (digits.length > 8) result += `/${digits.slice(8, 12)}`;
  if (digits.length > 12) result += `-${digits.slice(12, 14)}`;
  return result;
}

export function maskCpfCnpj(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 11) {
    return maskCpf(value);
  }
  return maskCnpj(digits.slice(0, 14));
}

export function stripMask(value: string): string {
  return value.replace(/\D/g, "");
}

export function maskCurrency(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 15);
  if (!digits) return "";
  const num = Number(digits) / 100;
  return num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function parseCurrency(value: string): number {
  const cleaned = value.replace(/\./g, "").replace(",", ".");
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? num : 0;
}

export function isOverdue(iso: string | null | undefined): boolean {
  if (!iso) return false;
  const date = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return target < today;
}

export function isToday(iso: string | null | undefined): boolean {
  if (!iso) return false;
  const date = new Date(iso);
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

export function daysUntil(iso: string | null | undefined): number {
  if (!iso) return 0;
  const date = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function withDefaultPxtoIso(date: string, time: string): string {
  return `${date}T${time}`;
}

export function relativeLabel(iso: string | null | undefined): string {
  if (!iso) return "—";
  const diff = daysUntil(iso);
  if (diff < 0) return `Há ${Math.abs(diff)} dia${Math.abs(diff) === 1 ? "" : "s"}`;
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Amanhã";
  return `Em ${diff} dias`;
}

export function monthLabel(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date);
}

export function getTodayISO(): string {
  return new Date().toISOString();
}

export function relativeTimeLabel(iso: string | null | undefined): string {
  if (!iso) return "—";
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.max(0, Math.floor(diffMs / 60000));
  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "há 1 dia";
  return `há ${days} dias`;
}