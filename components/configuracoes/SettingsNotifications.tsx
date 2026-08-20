"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";

interface NotificationPref {
  id: string;
  label: string;
  description: string;
  defaultOn: boolean;
}

const preferences: NotificationPref[] = [
  { id: "ntf-followup", label: "Follow-up vencendo", description: "Aviso antes do horário do follow-up", defaultOn: true },
  { id: "ntf-pagamento", label: "Pagamento vencendo", description: "Aviso de vencimentos e atrasos", defaultOn: true },
  { id: "ntf-tarefa", label: "Tarefa atrasada", description: "Aviso de tarefas fora do prazo", defaultOn: true },
  { id: "ntf-cliente", label: "Novo cliente", description: "Notificação quando um cliente é cadastrado", defaultOn: false },
  { id: "ntf-venda", label: "Nova venda", description: "Notificação quando uma venda é registrada", defaultOn: true },
];

export function SettingsNotifications() {
  const [prefs, setPrefs] = useState(preferences);

  function toggle(id: string) {
    setPrefs((prev) => prev.map((pref) => (pref.id === id ? { ...pref, defaultOn: !pref.defaultOn } : pref)));
  }

  return (
    <Card>
      <CardHeader
        title="Notificações"
        description="Escolha quais alertas sua equipe recebe"
      />
      <CardContent>
        <ul className="divide-y divide-border/60">
          {prefs.map((pref) => (
            <li key={pref.id} className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm font-medium text-foreground">{pref.label}</p>
                <p className="text-xs text-muted">{pref.description}</p>
              </div>
              <Toggle
                checked={pref.defaultOn}
                onChange={() => toggle(pref.id)}
                label={pref.label}
              />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}