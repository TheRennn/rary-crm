import { SettingsContent } from "@/components/configuracoes/SettingsContent";
import { userService } from "@/lib/services";
import { mockCompanies } from "@/lib/mock-data";

export default async function ConfiguracoesPage() {
  const [user, users] = await Promise.all([
    userService.getCurrentUser(),
    userService.getAllUsers(),
  ]);

  const company = mockCompanies[0];

  return (
    <SettingsContent
      user={
        user
          ? { id: user.id, name: user.name, email: user.email, role: user.role }
          : null
      }
      company={
        company
          ? { id: company.id, name: company.name, cnpj: company.cnpj, segment: company.segment, city: company.city, state: company.state }
          : { id: "", name: "", cnpj: "", segment: "", city: "", state: "" }
      }
      users={users.map((item) => ({ id: item.id, name: item.name, email: item.email, role: item.role }))}
    />
  );
}