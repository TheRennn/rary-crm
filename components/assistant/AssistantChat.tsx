"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { cn } from "@/lib/utils";
import {
  IconCalendarPlus,
  IconRefresh,
  IconSend,
  IconSparkles,
  IconTrendingUp,
  IconX,
} from "@/components/icons";
import { IconFileDollar, IconImage, IconUserPlus } from "@/components/ui/icons-additional";
import { getMockReply } from "@/lib/assistant/mock-reply";
import type { AssistantActionStatus, AssistantMessageData } from "@/lib/assistant/types";
import { AssistantAvatar, AssistantMessage } from "./AssistantMessage";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const SUGGESTIONS = [
  { icon: IconUserPlus, label: "Adicionar cliente", prompt: "Adicionar um novo cliente" },
  { icon: IconFileDollar, label: "Registrar pagamento", prompt: "Quero registrar um pagamento" },
  { icon: IconTrendingUp, label: "Resumo de vendas", prompt: "Me dê um resumo das vendas do mês" },
  { icon: IconCalendarPlus, label: "Criar follow-up", prompt: "Criar um follow-up" },
];

interface PendingImage {
  name: string;
  previewUrl: string;
}

/**
 * Balão de IA do dashboard (canto inferior direito).
 *
 * Fase atual: somente design. As respostas vêm de `lib/assistant/mock-reply.ts`.
 * Para ligar a IA real, substitua `getMockReply` em `send()` por uma chamada
 * a uma rota de API (ex.: `/api/assistant`).
 */
export function AssistantChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AssistantMessageData[]>([]);
  const [input, setInput] = useState("");
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) textareaRef.current?.focus();
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, typing, open]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  function resizeTextarea() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }

  function attachImage(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Envie um arquivo de imagem (JPG, PNG ou WEBP).");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("A imagem deve ter no máximo 10 MB.");
      return;
    }
    setError(null);
    setPendingImage((prev) => {
      if (prev) URL.revokeObjectURL(prev.previewUrl);
      return { name: file.name, previewUrl: URL.createObjectURL(file) };
    });
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) attachImage(file);
    event.target.value = "";
  }

  function handlePaste(event: ClipboardEvent<HTMLTextAreaElement>) {
    const file = Array.from(event.clipboardData.files).find((f) => f.type.startsWith("image/"));
    if (file) {
      event.preventDefault();
      attachImage(file);
    }
  }

  function removePendingImage() {
    if (pendingImage) URL.revokeObjectURL(pendingImage.previewUrl);
    setPendingImage(null);
  }

  function send(text: string, image: PendingImage | null) {
    const trimmed = text.trim();
    if ((!trimmed && !image) || typing) return;

    const now = () => new Date().toISOString();

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
        imageUrl: image?.previewUrl,
        createdAt: now(),
      },
    ]);
    setInput("");
    setPendingImage(null);
    setError(null);
    setTyping(true);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    // TODO(IA real): trocar este timeout por fetch("/api/assistant", ...).
    timerRef.current = setTimeout(() => {
      const reply = getMockReply({ text: trimmed, hasImage: Boolean(image) });
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", createdAt: now(), ...reply },
      ]);
      setTyping(false);
    }, 900);
  }

  function resolveAction(messageId: string, status: Exclude<AssistantActionStatus, "pending">) {
    setMessages((prev) => [
      ...prev.map((m) =>
        m.id === messageId && m.action ? { ...m, action: { ...m.action, status } } : m
      ),
      {
        id: crypto.randomUUID(),
        role: "assistant",
        createdAt: new Date().toISOString(),
        content:
          status === "confirmed"
            ? "Pronto! (Demonstração: nada foi salvo no seu CRM ainda.)"
            : "Tudo bem, cancelei. Posso ajudar com mais alguma coisa?",
      },
    ]);
  }

  function resetConversation() {
    if (timerRef.current) clearTimeout(timerRef.current);
    messages.forEach((m) => {
      if (m.imageUrl) URL.revokeObjectURL(m.imageUrl);
    });
    if (pendingImage) URL.revokeObjectURL(pendingImage.previewUrl);
    setMessages([]);
    setPendingImage(null);
    setInput("");
    setError(null);
    setTyping(false);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    send(input, pendingImage);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send(input, pendingImage);
    }
  }

  const canSend = (input.trim().length > 0 || pendingImage !== null) && !typing;

  return (
    <>
      {/* Painel */}
      <div
        role="dialog"
        aria-label="Assistente RARY"
        aria-hidden={!open}
        inert={!open}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
        className={cn(
          "fixed bottom-24 right-4 z-[60] flex h-[min(calc(100dvh-8rem),620px)] w-[min(calc(100vw-2rem),400px)] origin-bottom-right flex-col overflow-hidden rounded-2xl border border-border-strong bg-surface-1 shadow-2xl shadow-black/60 transition-all duration-200 sm:right-6",
          open ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-3 scale-95 opacity-0"
        )}
      >
        {/* Cabeçalho */}
        <header className="flex items-center gap-3 border-b border-border bg-surface-0 px-4 py-3">
          <AssistantAvatar className="h-9 w-9 rounded-xl" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">Assistente RARY</p>
            <p className="flex items-center gap-1.5 text-[11px] text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Prévia do design
            </p>
          </div>
          <button
            type="button"
            onClick={resetConversation}
            disabled={messages.length === 0}
            aria-label="Nova conversa"
            title="Nova conversa"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            <IconRefresh className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fechar assistente"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            <IconX className="h-4 w-4" />
          </button>
        </header>

        {/* Mensagens */}
        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4" aria-live="polite">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-5 text-center animate-fade-in">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white shadow-lg shadow-brand-600/40 ring-1 ring-white/10">
                <IconSparkles className="h-7 w-7" />
              </span>
              <div className="space-y-1">
                <p className="text-base font-semibold text-foreground">Como posso ajudar?</p>
                <p className="mx-auto max-w-[260px] text-xs leading-relaxed text-muted">
                  Peça para cadastrar clientes, registrar pagamentos ou envie a foto de um comprovante.
                </p>
              </div>
              <div className="grid w-full grid-cols-2 gap-2">
                {SUGGESTIONS.map(({ icon: Icon, label, prompt }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => send(prompt, null)}
                    className="flex flex-col items-start gap-2 rounded-xl border border-border bg-surface-2 p-3 text-left text-xs font-medium text-foreground transition-all hover:border-brand-500/50 hover:bg-brand-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50"
                  >
                    <Icon className="h-4 w-4 text-brand-400" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <AssistantMessage key={message.id} message={message} onResolveAction={resolveAction} />
              ))}
              {typing && (
                <div className="flex items-start gap-2 animate-fade-in" aria-label="Assistente digitando">
                  <AssistantAvatar className="mt-0.5" />
                  <div className="flex items-center gap-1 rounded-2xl rounded-tl-md border border-border bg-surface-2 px-4 py-3.5">
                    {[0, 150, 300].map((delay) => (
                      <span
                        key={delay}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={endRef} />
        </div>

        {/* Entrada */}
        <form onSubmit={handleSubmit} className="border-t border-border bg-surface-0 p-3">
          {pendingImage && (
            <div className="mb-2 flex items-center gap-2 rounded-xl border border-border bg-surface-2 p-1.5 pr-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pendingImage.previewUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
              <p className="min-w-0 flex-1 truncate text-xs text-muted">{pendingImage.name}</p>
              <button
                type="button"
                onClick={removePendingImage}
                aria-label="Remover imagem"
                className="flex h-6 w-6 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-3 hover:text-foreground"
              >
                <IconX className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {error && (
            <p role="alert" className="mb-2 px-1 text-xs text-danger">
              {error}
            </p>
          )}

          <div className="flex items-end gap-2 rounded-xl border border-border bg-surface-2 p-1.5 transition-colors focus-within:border-brand-500/60">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              tabIndex={-1}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Anexar imagem (comprovante)"
              title="Anexar imagem (comprovante)"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-3 hover:text-foreground"
            >
              <IconImage className="h-[18px] w-[18px]" />
            </button>
            <textarea
              ref={textareaRef}
              value={input}
              rows={1}
              onChange={(event) => {
                setInput(event.target.value);
                resizeTextarea();
              }}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder="Escreva uma mensagem..."
              aria-label="Mensagem para o assistente"
              className="max-h-[120px] min-h-9 flex-1 resize-none bg-transparent py-2 text-sm text-foreground placeholder:text-muted-2 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!canSend}
              aria-label="Enviar mensagem"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-white shadow-md shadow-brand-600/30 transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50 disabled:pointer-events-none disabled:opacity-40"
            >
              <IconSend className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 px-1 text-center text-[10px] text-muted-2">
            Enter envia · Shift+Enter quebra linha
          </p>
        </form>
      </div>

      {/* Balão flutuante */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? "Fechar assistente" : "Abrir assistente de IA"}
        aria-expanded={open}
        className="group fixed bottom-5 right-4 z-[60] flex h-14 w-14 items-center justify-center rounded-full border border-brand-400/30 bg-gradient-to-br from-brand-500 to-brand-800 text-white shadow-xl shadow-brand-600/40 transition-all duration-200 hover:scale-105 hover:shadow-2xl hover:shadow-brand-500/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/60 active:scale-95 sm:bottom-6 sm:right-6"
      >
        {!open && (
          <span
            aria-hidden="true"
            className="absolute inset-0 -z-10 animate-ping rounded-full bg-brand-500/30 [animation-duration:2.5s]"
          />
        )}
        <IconSparkles
          className={cn(
            "absolute h-6 w-6 transition-all duration-200",
            open ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
          )}
        />
        <IconX
          className={cn(
            "absolute h-6 w-6 transition-all duration-200",
            open ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
          )}
        />
      </button>
    </>
  );
}
