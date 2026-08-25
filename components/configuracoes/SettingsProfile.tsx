"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MaskedInput } from "@/components/ui/MaskedInput";
import { useToast } from "@/components/ui/Toast";
import { stripMask } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export interface SettingsProfileProps {
  user: { id: string; name: string; email: string; role: string; phone?: string } | null;
}

const roleLabel: Record<string, string> = {
  ADMIN: "Administrador",
  GERENTE: "Gerente",
  VENDEDOR: "Vendedor",
};

export function SettingsProfile({ user }: SettingsProfileProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user?.id) return;
    setSaving(true);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("users")
        .update({ name, email, phone: stripMask(phone) })
        .eq("id", user.id);

      if (error) throw error;

      toast({ title: "Perfil atualizado", message: "Suas informações foram salvas com sucesso.", variant: "success" });
      router.refresh();
    } catch (err) {
      toast({ title: "Erro ao salvar", message: "Não foi possível atualizar o perfil.", variant: "error" });
    } finally {
      setSaving(false);
    }
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
          <MaskedInput id="perf-telefone" label="Telefone" value={phone} onChange={setPhone} placeholder="(11) 90000-0000" mask="phone" required />
          <Button type="submit" loading={saving} className="sm:mt-6 sm:self-start">
            Salvar alterações
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}