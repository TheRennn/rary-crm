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
import { getAccessRequirementStatus } from "@/lib/auth/subscription-access";
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
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const emailNotConfirmed =
          error.code === "email_not_confirmed" ||
          error.message.toLowerCase().includes("email not confirmed");
        toast({
          title: emailNotConfirmed ? "E-mail não verificado" : "Erro ao entrar",
          message:
            emailNotConfirmed
              ? "Digite o código enviado para confirmar seu e-mail."
              : error.message === "Invalid login credentials"
                ? "E-mail ou senha inválidos."
                : error.message,
          variant: emailNotConfirmed ? "warning" : "error",
        });
        if (emailNotConfirmed) {
          router.push(`/verificar-email?email=${encodeURIComponent(email.trim())}`);
        }
        return;
      }

      if (!data.user) {
        toast({
          title: "Erro ao entrar",
          message: "Não foi possível validar sua conta. Tente novamente.",
          variant: "error",
        });
        return;
      }

      const { data: appUser, error: appUserError } = await supabase
        .from("users")
        .select("email_verified, payment_verified, access_requirements_enforced, access_expires_at")
        .eq("auth_id", data.user.id)
        .maybeSingle();

      if (appUserError || !appUser) {
        if (appUserError) console.error("Erro ao validar status da conta:", appUserError);
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) console.error("Erro ao encerrar sessão sem status de conta:", signOutError);
        toast({
          title: "Não foi possível validar sua conta",
          message: "Tente novamente em instantes ou entre em contato com o suporte.",
          variant: "error",
        });
        return;
      }

      const accessStatus = getAccessRequirementStatus({
        requirementsEnforced: appUser.access_requirements_enforced,
        emailVerified: appUser.email_verified,
        paymentVerified: appUser.payment_verified,
        accessExpiresAt: appUser.access_expires_at,
      });

      if (accessStatus === "email-unverified") {
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) console.error("Erro ao encerrar sessão de e-mail pendente:", signOutError);
        toast({
          title: "E-mail não verificado",
          message: "Digite o código enviado para confirmar seu e-mail.",
          variant: "warning",
        });
        router.push(`/verificar-email?email=${encodeURIComponent(data.user.email ?? email)}`);
        return;
      }

      if (accessStatus === "payment-required") {
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) console.error("Erro ao encerrar sessão sem pagamento:", signOutError);
        toast({
          title: "Pagamento necessário",
          message: "Pague ou renove sua mensalidade para liberar o acesso ao painel.",
          variant: "warning",
        });
        router.push(`/pagamento?email=${encodeURIComponent(data.user.email ?? email)}`);
        return;
      }

      toast({
        title: "Bem-vindo de volta!",
        message: "Login realizado com sucesso.",
        variant: "success",
      });
      router.push("/dashboard");
    } catch (error) {
      console.error("Erro inesperado ao entrar:", error);
      toast({
        title: "Erro ao entrar",
        message: "Não foi possível concluir o login. Tente novamente.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
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
