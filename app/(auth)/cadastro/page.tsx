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
import { createClient } from "@/lib/supabase/client";

const segmentOptions = SEGMENTS.map((segment) => ({ value: segment, label: segment }));

export default function CadastroPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [segment, setSegment] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          company,
          segment,
        },
      },
    });

    if (error) {
      setLoading(false);
      toast({
        title: "Erro ao criar conta",
        message:
          error.message === "User already registered"
            ? "Este e-mail já está cadastrado."
            : error.message,
        variant: "error",
      });
      return;
    }

    if (data.user) {
      const companyId = `comp-${Date.now().toString(36)}`;

      await supabase.from("companies").insert({
        id: companyId,
        name: company,
        cnpj: "",
        segment: segment || "Tecnologia",
        city: "",
        state: "",
      });

      await supabase.from("users").insert({
        id: `usr-${data.user.id.slice(0, 8)}`,
        auth_id: data.user.id,
        name,
        email,
        role: "ADMIN",
        company_id: companyId,
        phone: "",
      });
    }

    toast({
      title: "Conta criada!",
      message: "Verifique seu e-mail para ativar sua conta.",
      variant: "success",
    });
    router.push(`/verificar-email?email=${encodeURIComponent(email)}`);
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
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
          <Input
            id="cad-empresa"
            label="Nome da empresa"
            placeholder="Minha Empresa"
            leftIcon={<IconBuilding className="h-4 w-4" />}
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            required
          />
        </div>
        <Input
          id="cad-email"
          label="E-mail profissional"
          type="email"
          placeholder="voce@empresa.com"
          leftIcon={<IconMail className="h-4 w-4" />}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <Input
          id="cad-senha"
          label="Senha"
          type={showPassword ? "text" : "password"}
          placeholder="Crie uma senha"
          leftIcon={<IconKey className="h-4 w-4" />}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
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
          value={segment}
          onChange={(event) => setSegment(event.target.value)}
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
