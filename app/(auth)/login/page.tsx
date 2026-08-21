"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { IconMail, IconEye } from "@/components/icons";
import { IconKey, IconEyeOff } from "@/components/ui/icons-additional";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      toast({
        title: "Erro ao entrar",
        message:
          error.message === "Invalid login credentials"
            ? "E-mail ou senha inválidos."
            : error.message,
        variant: "error",
      });
      return;
    }

    toast({
      title: "Bem-vindo de volta!",
      message: "Login realizado com sucesso.",
      variant: "success",
    });
    router.push("/dashboard");
  }

  return (
    <AuthShell
      title="Entrar na sua conta"
      description="Acesse sua operação e acompanhe sua rotina comercial."
      footer={
        <>
          Ainda não tem conta?{" "}
          <Link
            href="/cadastro"
            className="font-medium text-brand-400 hover:text-brand-300"
          >
            Criar conta
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="login-email"
          label="E-mail"
          type="email"
          placeholder="voce@empresa.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          leftIcon={<IconMail className="h-4 w-4" />}
          required
        />
        <Input
          id="login-password"
          label="Senha"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          leftIcon={<IconKey className="h-4 w-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              className="text-muted-2 transition-colors hover:text-foreground"
            >
              {showPassword ? (
                <IconEyeOff className="h-4 w-4" />
              ) : (
                <IconEye className="h-4 w-4" />
              )}
            </button>
          }
          required
        />
        <div className="flex items-center justify-between text-xs">
          <label className="flex cursor-pointer items-center gap-2 text-muted">
            <input
              type="checkbox"
              className="h-3.5 w-3.5 rounded border-border bg-surface-2 accent-brand-500"
            />
            Lembrar de mim
          </label>
          <button
            type="button"
            className="text-brand-400 transition-colors hover:text-brand-300"
          >
            Esqueci minha senha
          </button>
        </div>
        <Button type="submit" size="lg" loading={loading} className="mt-2 w-full">
          Entrar
        </Button>
      </form>
    </AuthShell>
  );
}
