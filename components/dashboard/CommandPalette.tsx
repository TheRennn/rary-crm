"use client";

import { useEffect, useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Client } from "@/types";
import { cn } from "@/lib/utils";
import { IconSearch, IconUser, IconUsers, IconZap, IconDashboard, IconCalendar, IconCheckSquare, IconCreditCard, IconRefresh } from "@/components/icons";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  clients: Client[];
}

interface PaletteItem {
  id: string;
  section: string;
  label: string;
  detail?: string;
  icon?: React.ReactNode;
  href?: string;
  action?: () => void;
}

const NAVIGATION_ITEMS: PaletteItem[] = [
  { id: "nav-dash", section: "Navegação", label: "Dashboard", href: "/dashboard", icon: <IconDashboard className="h-4 w-4" /> },
  { id: "nav-clientes", section: "Navegação", label: "Clientes", href: "/clientes", icon: <IconUsers className="h-4 w-4" /> },
  { id: "nav-vendas", section: "Navegação", label: "Vendas", href: "/vendas", icon: <IconZap className="h-4 w-4" /> },
  { id: "nav-followup", section: "Navegação", label: "Follow-up", href: "/follow-up", icon: <IconRefresh className="h-4 w-4" /> },
  { id: "nav-calendario", section: "Navegação", label: "Calendário", href: "/calendario", icon: <IconCalendar className="h-4 w-4" /> },
  { id: "nav-pendentes", section: "Navegação", label: "Pendentes", href: "/pendentes", icon: <IconCheckSquare className="h-4 w-4" /> },
  { id: "nav-financeiro", section: "Navegação", label: "Financeiro", href: "/financeiro", icon: <IconCreditCard className="h-4 w-4" /> },
  { id: "nav-config", section: "Navegação", label: "Configurações", href: "/configuracoes", icon: <IconDashboard className="h-4 w-4" /> },
];

export function CommandPalette({ open, onClose, clients }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset de estado ao abrir a paleta
      setQuery("");
      setIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const clientItems: PaletteItem[] = useMemo(
    () =>
      clients.slice(0, 12).map((client) => ({
        id: `client-${client.id}`,
        section: "Clientes",
        label: client.name,
        detail: client.companyName,
        icon: <IconUser className="h-4 w-4" />,
        href: `/clientes/${client.id}`,
      })),
    [clients]
  );

  const actionItems: PaletteItem[] = useMemo(
    () => [
      {
        id: "action-client",
        section: "Ações",
        label: "Novo cliente",
        icon: <IconUser className="h-4 w-4" />,
        href: "/clientes/novo?kind=CLIENTE",
      },
      {
        id: "action-venda",
        section: "Ações",
        label: "Nova venda",
        icon: <IconZap className="h-4 w-4" />,
        href: "/vendas",
      },
      {
        id: "action-followup",
        section: "Ações",
        label: "Novo follow-up",
        icon: <IconRefresh className="h-4 w-4" />,
        href: "/follow-up",
      },
      {
        id: "action-tarefa",
        section: "Ações",
        label: "Nova tarefa",
        icon: <IconCheckSquare className="h-4 w-4" />,
        href: "/pendentes",
      },
      {
        id: "action-financeiro",
        section: "Ações",
        label: "Ver financeiro",
        icon: <IconCreditCard className="h-4 w-4" />,
        href: "/financeiro",
      },
    ],
    []
  );

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filter = (item: PaletteItem) => {
      if (!q) return true;
      return `${item.label} ${item.detail ?? ""} ${item.section}`
        .toLowerCase()
        .includes(q);
    };
    return [...clientItems, ...actionItems, ...NAVIGATION_ITEMS].filter(filter);
  }, [query, clientItems, actionItems]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- reset do índice ao digitar
  useEffect(() => setIndex(0), [query]);

  const run = useCallback((item: PaletteItem) => {
    onClose();
    if (item.href) router.push(item.href);
    if (item.action) item.action();
  }, [router, onClose]);

  useEffect(() => {
    if (!open) return;
    function handleKey(event: KeyboardEvent) {
      if (!open) return;
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (!query) return;
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setIndex((prev) => Math.min(prev + 1, items.length - 1));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setIndex((prev) => Math.max(prev - 1, 0));
      } else if (event.key === "Enter") {
        event.preventDefault();
        const item = items[index];
        if (item) run(item);
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, query, items, index, run, onClose]);

  if (!open) return null;

  let lastSection = "";

  return (
    <div className="fixed inset-0 z-[150] flex items-start justify-center px-4 pt-[12vh]" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 flex w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-border bg-surface-1 shadow-2xl shadow-black/60">
        <div className="flex items-center gap-3 border-b border-border px-4 pb-3 pt-4">
          <IconSearch className="h-5 w-5 text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Pesquisar clientes, ações e páginas…"
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-2"
            aria-label="Busca global"
          />
          <kbd className="rounded border border-border bg-surface-3 px-1.5 py-0.5 font-mono text-[10px] text-muted-2">
            ESC
          </kbd>
        </div>
        <div ref={listRef} className="max-h-[50vh] overflow-y-auto p-2">
          {items.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted">
              Nenhum resultado para &quot;{query}&quot;
            </p>
          ) : (
            items.map((item, itemIndex) => {
              const showSection = item.section !== lastSection;
              lastSection = item.section;
              return (
                <div key={item.id}>
                  {showSection && (
                    <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-2">
                      {item.section}
                    </p>
                  )}
                  <button
                    type="button"
                    onMouseEnter={() => setIndex(itemIndex)}
                    onClick={() => run(item)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                      itemIndex === index ? "bg-brand-500/15" : "hover:bg-surface-2"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                        itemIndex === index
                          ? "border-brand-500/40 bg-brand-500/10 text-brand-300"
                          : "border-border bg-surface-2 text-muted"
                      )}
                    >
                      {item.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block truncate text-sm font-medium",
                          itemIndex === index ? "text-brand-300" : "text-foreground"
                        )}
                      >
                        {item.label}
                      </span>
                      {item.detail && (
                        <span className="block truncate text-xs text-muted">{item.detail}</span>
                      )}
                    </span>
                    <span className="text-[10px] text-muted-2">
                      {item.section === "Navegação" ? "⌘" : ""}
                    </span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}