import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type TableColumn } from "@/components/ui/Table";
import type { UserRole } from "@/types";

const roleLabel: Record<UserRole, string> = {
  ADMIN: "Administrador",
  GERENTE: "Gerente",
  VENDEDOR: "Vendedor",
};

function roleTone(role: UserRole): "brand" | "info" | "neutral" {
  if (role === "ADMIN") return "brand";
  if (role === "GERENTE") return "info";
  return "neutral";
}

export function SettingsUsers({
  users,
  currentUserId,
}: {
  users: { id: string; name: string; email: string; role: UserRole }[];
  currentUserId: string;
}) {
  const columns: TableColumn<{ id: string; name: string; email: string; role: UserRole }>[] = [
    {
      key: "usuario",
      header: "Usuário",
      render: (user) => (
        <div className="flex items-center gap-3">
          <Avatar name={user.name} size="sm" />
          <div>
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-muted-2">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "cargo",
      header: "Cargo",
      render: (user) => (
        <div className="flex items-center gap-2">
          <Badge tone={roleTone(user.role)}>{roleLabel[user.role]}</Badge>
          {user.id === currentUserId && <span className="text-xs text-muted">(você)</span>}
        </div>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader title="Usuários" description="Pessoas com acesso ao sistema" />
      <CardContent className="pt-2">
        <DataTable
          columns={columns}
          data={users}
          rowKey={(user) => user.id}
        />
      </CardContent>
    </Card>
  );
}