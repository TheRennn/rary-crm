"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, type FormEvent } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { IconMail } from "@/components/icons";
import { IconShieldCheck } from "@/components/ui/icons-additional";
import { createClient } from "@/lib/supabase/client";

const OTP_LENGTH = 6;

export default function VerificarEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const { toast } = useToast();

  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      router.push("/cadastro");
    }
  }, [email, router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;

    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);

    const nextEmpty = newOtp.findIndex((v) => !v);
    const focusIndex = nextEmpty === -1 ? OTP_LENGTH - 1 : nextEmpty;
    inputRefs.current[focusIndex]?.focus();
  }

  async function handleVerify(event: FormEvent) {
    event.preventDefault();
    const token = otp.join("");
    if (token.length !== OTP_LENGTH) {
      toast({ title: "Código incompleto", message: "Digite todos os 6 dígitos.", variant: "error" });
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token }),
    });

    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      toast({
        title: "Código inválido",
        message: data.error === "Código inválido ou expirado."
          ? "Código expirado ou inválido. Solicite um novo."
          : data.error,
        variant: "error",
      });
      setOtp(new Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
      return;
    }

    toast({ title: "E-mail verificado!", message: "Sua conta foi ativada com sucesso.", variant: "success" });
    router.push("/dashboard");
  }

  async function handleResend() {
    if (cooldown > 0) return;
    setResending(true);

    const res = await fetch("/api/auth/send-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setResending(false);

    if (!res.ok) {
      toast({ title: "Erro ao reenviar", message: data.error, variant: "error" });
      return;
    }

    toast({ title: "Código reenviado", message: "Verifique sua caixa de entrada.", variant: "success" });
    setCooldown(60);
    setOtp(new Array(OTP_LENGTH).fill(""));
    inputRefs.current[0]?.focus();
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <AuthShell
      title="Verificar seu e-mail"
      description="Enviamos um código de verificação para o seu e-mail. Digite o código abaixo para confirmar sua conta."
      footer={
        <>
          <button
            type="button"
            onClick={handleLogout}
            className="font-medium text-brand-400 hover:text-brand-300"
          >
            Voltar para o login
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3 rounded-xl border border-brand-500/25 bg-brand-500/10 px-4 py-3">
          <IconMail className="h-5 w-5 shrink-0 text-brand-300" />
          <span className="text-sm text-foreground truncate">{email}</span>
        </div>

        <form onSubmit={handleVerify} className="flex flex-col gap-5">
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-foreground">Código de verificação</span>
            <div className="flex items-center justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="h-12 w-12 rounded-xl border border-border bg-surface-1 text-center text-lg font-bold text-foreground transition-all focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/25 focus:outline-none"
                />
              ))}
            </div>
          </label>

          <Button type="submit" size="lg" loading={loading} className="w-full">
            <IconShieldCheck className="h-4 w-4" />
            Verificar código
          </Button>
        </form>

        <div className="flex flex-col items-center gap-2">
          <p className="text-xs text-muted-2">Não recebeu o código?</p>
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || resending}
            className="text-sm font-medium text-brand-400 transition-colors hover:text-brand-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cooldown > 0 ? `Reenviar em ${cooldown}s` : resending ? "Reenviando..." : "Reenviar código"}
          </button>
        </div>
      </div>
    </AuthShell>
  );
}
