"use client";

import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { useToast } from "@/components/ui/Toast";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";
import { IconPalette } from "@/components/icons";
import { IconImage } from "@/components/ui/icons-additional";

export function SettingsBranding() {
  const { settings, updateSettings, resetSettings } = useTheme();
  const { toast } = useToast();
  const [useCustomLogo, setUseCustomLogo] = React.useState(false);

  return (
    <Card>
      <CardHeader
        title="Personalização"
        description="Identidade visual (white-label) — o padrão continua sendo o roxo RARY"
      />
      <CardContent className="flex flex-col gap-6">
        <div className="rounded-xl border border-border bg-surface-0/60 p-5">
          <p className="text-sm font-medium text-foreground">Pré-visualização do logotipo</p>
          <div className="mt-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Logo size="lg" showText={false} />
            <Logo size="lg" />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Usar logo próprio</p>
            <Toggle
              checked={useCustomLogo}
              onChange={setUseCustomLogo}
              label="Usar logo próprio"
            />
          </div>
          {useCustomLogo && (
            <button
              type="button"
              className="flex h-24 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border-strong text-sm text-muted transition-colors hover:border-brand-500/50 hover:text-brand-300"
            >
              <IconImage className="h-5 w-5" />
              Enviar logo
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="brand-nome"
            label="Nome da empresa (exibido na topbar)"
            value={settings.companyName}
            onChange={(event) => updateSettings({ companyName: event.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ColorField
            id="brand-primary"
            label="Cor principal"
            value={settings.brandPrimary}
            onChange={(value) => updateSettings({ brandPrimary: value })}
          />
          <ColorField
            id="brand-dark"
            label="Cor principal (escura)"
            value={settings.brandPrimaryDark}
            onChange={(value) => updateSettings({ brandPrimaryDark: value })}
          />
          <ColorField
            id="brand-light"
            label="Cor principal (clara)"
            value={settings.brandPrimaryLight}
            onChange={(value) => updateSettings({ brandPrimaryLight: value })}
          />
        </div>

        <div className="flex items-center gap-2 border-t border-border pt-4">
          <Button
            variant="outline"
            onClick={() => {
              resetSettings();
              toast({ title: "Tema restaurado", message: "Roxo RARY restaurado.", variant: "success" });
            }}
          >
            Restaurar padrão RARY
          </Button>
          <span className="text-xs text-muted-2">
            <IconPalette className="mr-1 inline h-3.5 w-3.5" />
            Alterações aplicadas em tempo real
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function ColorField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium text-foreground">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <span
          className={cn("h-10 w-10 shrink-0 rounded-lg border border-border-strong")}
          style={{ backgroundColor: value }}
        />
        <input
          id={id}
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-full cursor-pointer rounded-lg border border-border bg-surface-1"
        />
      </div>
    </div>
  );
}