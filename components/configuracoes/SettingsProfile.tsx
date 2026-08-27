"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MaskedInput } from "@/components/ui/MaskedInput";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { stripMask } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export interface SettingsProfileProps {
  user: { id: string; name: string; email: string; phone?: string; emailVerified?: boolean } | null;
}

export function SettingsProfile({ user }: SettingsProfileProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);

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
    } catch {
      toast({ title: "Erro ao salvar", message: "Não foi possível atualizar o perfil.", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function handleResendVerification() {
    if (!user?.email) return;
    setResendingVerification(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: user.email,
        options: { shouldCreateUser: false },
      });

      if (error) throw error;

      toast({ title: "Código reenviado", message: "Verifique sua caixa de entrada.", variant: "success" });
      router.push(`/verificar-email?email=${encodeURIComponent(user.email)}`);
    } catch {
      toast({ title: "Erro ao reenviar", message: "Não foi possível reenviar o código.", variant: "error" });
    } finally {
      setResendingVerification(false);
    }
  }

  return (
    <Card>
      <CardHeader
        title="Perfil"
        description="Suas informações pessoais"
      />
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input id="perf-nome" label="Nome completo" value={name} onChange={(e) => setName(e.target.value)} required />
          <div className="flex flex-col gap-1.5">
            <Input id="perf-email" label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <div className="flex items-center gap-2">
              {user?.emailVerified ? (
                <Badge tone="success">E-mail verificado</Badge>
              ) : (
                <Badge tone="warning">E-mail não verificado</Badge>
              )}
              {!user?.emailVerified && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  loading={resendingVerification}
                  onClick={handleResendVerification}
                >
                  Reenviar verificação
                </Button>
              )}
            </div>
          </div>
          <MaskedInput id="perf-telefone" label="Telefone" value={phone} onChange={setPhone} placeholder="(11) 90000-0000" mask="phone" required />
          <Button type="submit" loading={saving} className="sm:mt-6 sm:self-start">
            Salvar alterações
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
