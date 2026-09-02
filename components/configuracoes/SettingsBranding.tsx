"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
import { createClient } from "@/lib/supabase/client";

export function SettingsBranding({ companyId }: { companyId: string }) {
  const router = useRouter();
  const { settings, updateSettings, resetSettings } = useTheme();
  const { toast } = useToast();
  const [useCustomLogo, setUseCustomLogo] = React.useState(false);
  const [companyName, setCompanyName] = React.useState(settings.companyName);
  const [saving, setSaving] = React.useState(false);
  const [uploadingLogo, setUploadingLogo] = React.useState(false);
  const [logoUrl, setLogoUrl] = React.useState<string>("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setCompanyName(settings.companyName);
  }, [settings.companyName]);

  async function handleSaveCompanyName() {
    if (!companyId) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("companies")
        .update({ name: companyName })
        .eq("id", companyId);
      if (error) throw error;
      updateSettings({ companyName });
      toast({ title: "Nome atualizado", message: "Nome da empresa salvo com sucesso.", variant: "success" });
      router.refresh();
    } catch {
      toast({ title: "Erro ao salvar", message: "Não foi possível atualizar o nome.", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function handleLogoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !companyId) return;

    setUploadingLogo(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "png";
      const path = `logos/${companyId}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("company-assets")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("company-assets").getPublicUrl(path);
      const publicUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from("companies")
        .update({ logo_url: publicUrl })
        .eq("id", companyId);
      if (updateError) throw updateError;

      setLogoUrl(publicUrl);
      toast({ title: "Logo atualizada", message: "Logo da empresa salva com sucesso.", variant: "success" });
      router.refresh();
    } catch {
      toast({ title: "Erro no upload", message: "Não foi possível enviar a logo.", variant: "error" });
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

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
            <Logo size="lg" showText={false} logoUrl={logoUrl || undefined} />
            <Logo size="lg" logoUrl={logoUrl || undefined} />
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
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.svg"
                className="hidden"
                onChange={handleLogoUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingLogo}
                className="flex h-24 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border-strong text-sm text-muted transition-colors hover:border-brand-500/50 hover:text-brand-300 disabled:opacity-50"
              >
                <IconImage className="h-5 w-5" />
                {uploadingLogo ? "Enviando..." : "Enviar logo (PNG, JPG ou SVG)"}
              </button>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="brand-nome"
            label="Nome da empresa (exibido na topbar)"
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
          />
          <div className="flex items-end">
            <Button
              variant="outline"
              loading={saving}
              onClick={handleSaveCompanyName}
              disabled={companyName === settings.companyName}
            >
              Salvar nome
            </Button>
          </div>
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
