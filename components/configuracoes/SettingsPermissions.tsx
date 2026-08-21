"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";

interface PermissionRow {
  id: string;
  label: string;
  description: string;
  admin: boolean;
  gerente: boolean;
  vendedor: boolean;
}

const initialPermissions: PermissionRow[] = [
  { id: "perm-clientes", label: "Clientes", description: "Visualizar e gerenciar clientes", admin: true, gerente: true, vendedor: true },
  { id: "perm-vendas", label: "Vendas", description: "Registrar e acompanhar vendas", admin: true, gerente: true, vendedor: true },
  { id: "perm-pagamentos", label: "Financeiro", description: "Visualizar e gerir contas a receber e comissões", admin: true, gerente: true, vendedor: false },
  { id: "perm-config", label: "Configurações", description: "Alterar configurações do sistema", admin: true, gerente: false, vendedor: false },
  { id: "perm-usuarios", label: "Usuários", description: "Gerenciar usuários e permissões", admin: true, gerente: false, vendedor: false },
];

export function SettingsPermissions() {
  const [permissions, setPermissions] = useState(initialPermissions);

  function toggle(permissionId: string, column: "admin" | "gerente" | "vendedor") {
    setPermissions((prev) =>
      prev.map((permission) =>
        permission.id === permissionId
          ? { ...permission, [column]: !permission[column] }
          : permission
      )
    );
  }

  return (
    <Card>
      <CardHeader
        title="Permissões"
        description="Controle de acesso por perfil (pré-configurado para o próximo sprint)"
      />
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-2">Módulo</th>
                <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-2">Admin</th>
                <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-2">Gerente</th>
                <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-2">Vendedor</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((permission) => (
                <tr key={permission.id} className="border-b border-border/60 last:border-b-0">
                  <td className="px-5 py-3">
                    <p className="font-medium text-foreground">{permission.label}</p>
                    <p className="text-xs text-muted">{permission.description}</p>
                  </td>
                  {(["admin", "gerente", "vendedor"] as const).map((column) => (
                    <td key={column} className="px-5 py-3 text-center">
                      <div className="inline-flex">
                        <Toggle
                          checked={permission[column]}
                          onChange={() => toggle(permission.id, column)}
                          disabled={column === "admin"}
                          label={`${permission.label} — ${column}`}
                        />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}