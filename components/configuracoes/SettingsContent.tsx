"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { SettingsProfile } from "./SettingsProfile";
import { SettingsCompany } from "./SettingsCompany";
import { SettingsUsers } from "./SettingsUsers";
import { SettingsPermissions } from "./SettingsPermissions";
import { SettingsNotifications } from "./SettingsNotifications";
import { SettingsIntegrations } from "./SettingsIntegrations";
import { SettingsBranding } from "./SettingsBranding";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { IconUser, IconBuilding, IconUsers, IconBell, IconLink, IconPalette } from "@/components/icons";
import { IconKey } from "@/components/ui/icons-additional";
import type { UserRole } from "@/types";

export interface SettingsContentProps {
  user: { id: string; name: string; email: string; role: UserRole } | null;
  company: { id: string; name: string; cnpj: string; segment: string; city: string; state: string };
  users: { id: string; name: string; email: string; role: UserRole }[];
}

type SectionId = "perfil" | "empresa" | "usuarios" | "permissoes" | "notificacoes" | "integracoes" | "personalizacao";

const sections: Array<{ id: SectionId; label: string; icon: ReactNode }> = [
  { id: "perfil", label: "Perfil", icon: <IconUser className="h-4 w-4" /> },
  { id: "empresa", label: "Empresa", icon: <IconBuilding className="h-4 w-4" /> },
  { id: "usuarios", label: "Usuários", icon: <IconUsers className="h-4 w-4" /> },
  { id: "permissoes", label: "Permissões", icon: <IconKey className="h-4 w-4" /> },
  { id: "notificacoes", label: "Notificações", icon: <IconBell className="h-4 w-4" /> },
  { id: "integracoes", label: "Integrações", icon: <IconLink className="h-4 w-4" /> },
  { id: "personalizacao", label: "Personalização", icon: <IconPalette className="h-4 w-4" /> },
];

export function SettingsContent({ user, company, users }: SettingsContentProps) {
  const [active, setActive] = useState<SectionId>("perfil");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Configurações" description="Gerencie sua conta, equipe e identidade visual" />

      <div className="flex flex-col gap-6 lg:flex-row">
        <nav className="flex shrink-0 gap-1 overflow-x-auto lg:w-56 lg:flex-col lg:overflow-visible">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActive(section.id)}
              className={cn(
                "flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active === section.id
                  ? "bg-brand-500/10 text-brand-300"
                  : "text-muted hover:bg-surface-2 hover:text-foreground"
              )}
            >
              <span className="text-muted-2">{section.icon}</span>
              {section.label}
            </button>
          ))}
        </nav>

        <div className="min-w-0 flex-1">
          {active === "perfil" && <SettingsProfile user={user} />}
          {active === "empresa" && <SettingsCompany company={company} />}
          {active === "usuarios" && (
            <SettingsUsers users={users} currentUserId={user?.id ?? ""} />
          )}
          {active === "permissoes" && <SettingsPermissions />}
          {active === "notificacoes" && <SettingsNotifications />}
          {active === "integracoes" && <SettingsIntegrations />}
          {active === "personalizacao" && <SettingsBranding />}
        </div>
      </div>
    </div>
  );
}