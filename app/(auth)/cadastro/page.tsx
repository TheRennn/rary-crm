"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { IconMail, IconUser, IconBuilding, IconLayers, IconEye } from "@/components/icons";
import { IconKey, IconEyeOff, IconBadgeCheck } from "@/components/ui/icons-additional";
import { SEGMENTS } from "@/lib/constants";

const segmentOptions = SEGMENTS.map((segment) => ({ value: segment, label: segment }));

export default function CadastroPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);

    // TODO: sprint seguinte — autenticação e onboarding reais.
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Conta criada!",
        message: "Seu espaço no RARY CRM está pronto.",
        variant: "success",
      });
      router.push("/dashboard");
    }, 900);
  }

  return (
    <AuthShell
      title="Criar sua conta"
      description="Comece a organizar clientes, vendas e pagamentos em poucos minutos."
      footer={
        <>
          Já tem conta?{" "}
          <Link href="/login" className="font-medium text-brand-400 hover:text-brand-300">
            Fazer login
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="cad-nome"
            label="Seu nome"
            placeholder="Você"
            leftIcon={<IconUser className="h-4 w-4" />}
            required
          />
          <Input
            id="cad-empresa"
            label="Nome da empresa"
            placeholder="Minha Empresa"
            leftIcon={<IconBuilding className="h-4 w-4" />}
            required
          />
        </div>
        <Input
          id="cad-email"
          label="E-mail profissional"
          type="email"
          placeholder="voce@empresa.com"
          leftIcon={<IconMail className="h-4 w-4" />}
          required
        />
        <Input
          id="cad-senha"
          label="Senha"
          type={showPassword ? "text" : "password"}
          placeholder="Crie uma senha"
          leftIcon={<IconKey className="h-4 w-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              className="text-muted-2 transition-colors hover:text-foreground"
            >
              {showPassword ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
            </button>
          }
          required
        />
        <Select
          id="cad-segmento"
          label="Segmento"
          options={segmentOptions}
          placeholder="Selecione o segmento"
          icon={<IconLayers className="h-4 w-4" />}
          required
        />
        <Button type="submit" size="lg" loading={loading} className="mt-2 w-full">
          Criar conta gratuita
        </Button>
        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-2">
          <IconBadgeCheck className="h-3.5 w-3.5 text-success" />
          Sem cartão de crédito. Dados protegidos.
        </p>
      </form>
    </AuthShell>
  );
}