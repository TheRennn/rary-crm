"use client";

import { useState, type FormEvent } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

export interface SettingsProfileProps {
  user: { id: string; name: string; email: string; role: string } | null;
}

const roleLabel: Record<string, string> = {
  ADMIN: "Administrador",
  GERENTE: "Gerente",
  VENDEDOR: "Vendedor",
};

export function SettingsProfile({ user }: SettingsProfileProps) {
  const { toast } = useToast();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    toast({ title: "Perfil atualizado", message: "Suas informações foram salvas (mock).", variant: "success" });
  }

  return (
    <Card>
      <CardHeader
        title="Perfil"
        description="Suas informações pessoais"
        action={
          user?.role && (
            <span className="rounded-full border border-brand-500/25 bg-brand-500/10 px-2.5 py-0.5 text-xs font-medium text-brand-300">
              {roleLabel[user.role] ?? user.role}
            </span>
          )
        }
      />
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input id="perf-nome" label="Nome completo" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input id="perf-email" label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input id="perf-telefone" label="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 90000-0000" />
          <Button type="submit" className="sm:mt-6 sm:self-start">
            Salvar alterações
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}