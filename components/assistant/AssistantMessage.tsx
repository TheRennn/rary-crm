"use client";

import { cn } from "@/lib/utils";
import { IconCheckCircle, IconSparkles, IconX } from "@/components/icons";
import type { AssistantActionStatus, AssistantMessageData } from "@/lib/assistant/types";

const timeFormatter = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

export interface AssistantMessageProps {
  message: AssistantMessageData;
  onResolveAction: (messageId: string, status: Exclude<AssistantActionStatus, "pending">) => void;
}

export function AssistantAvatar({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white shadow-md shadow-brand-600/30 ring-1 ring-white/10",
        className
      )}
    >
      <IconSparkles className="h-3.5 w-3.5" />
    </span>
  );
}

export function AssistantMessage({ message, onResolveAction }: AssistantMessageProps) {
  const isUser = message.role === "user";
  const time = timeFormatter.format(new Date(message.createdAt));

  if (isUser) {
    return (
      <div className="flex flex-col items-end gap-1 animate-fade-in">
        <div className="max-w-[85%] space-y-2 rounded-2xl rounded-br-md bg-brand-500 px-3.5 py-2.5 text-sm text-white shadow-lg shadow-brand-600/20">
          {message.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={message.imageUrl}
              alt="Imagem enviada"
              className="max-h-48 w-full rounded-lg border border-white/20 object-cover"
            />
          )}
          {message.content && <p className="whitespace-pre-wrap break-words">{message.content}</p>}
        </div>
        <span className="px-1 text-[10px] text-muted-2">{time}</span>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 animate-fade-in">
      <AssistantAvatar className="mt-0.5" />
      <div className="flex min-w-0 max-w-[85%] flex-col items-start gap-1.5">
        <div className="rounded-2xl rounded-tl-md border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-foreground">
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>

        {message.action && (
          <div className="w-full rounded-xl border border-brand-500/30 bg-brand-500/5 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-foreground">{message.action.title}</p>
              <span className="rounded-full border border-border-strong bg-surface-3 px-2 py-0.5 text-[10px] font-medium text-muted">
                Demonstração
              </span>
            </div>

            <dl className="space-y-1.5">
              {message.action.rows.map((row) => (
                <div key={row.label} className="flex items-baseline justify-between gap-3 text-xs">
                  <dt className="text-muted">{row.label}</dt>
                  <dd className="truncate text-right font-medium text-foreground">{row.value}</dd>
                </div>
              ))}
            </dl>

            {message.action.status === "pending" ? (
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => onResolveAction(message.id, "confirmed")}
                  className="flex-1 rounded-lg bg-brand-500 px-3 py-2 text-xs font-semibold text-white transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50 active:scale-[0.98]"
                >
                  Confirmar
                </button>
                <button
                  type="button"
                  onClick={() => onResolveAction(message.id, "cancelled")}
                  className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs font-semibold text-muted transition-colors hover:border-border-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <p
                className={cn(
                  "mt-3 flex items-center gap-1.5 text-xs font-medium",
                  message.action.status === "confirmed" ? "text-success" : "text-muted"
                )}
              >
                {message.action.status === "confirmed" ? (
                  <>
                    <IconCheckCircle className="h-4 w-4" /> Confirmado
                  </>
                ) : (
                  <>
                    <IconX className="h-4 w-4" /> Cancelado
                  </>
                )}
              </p>
            )}
          </div>
        )}

        <span className="px-1 text-[10px] text-muted-2">{time}</span>
      </div>
    </div>
  );
}
