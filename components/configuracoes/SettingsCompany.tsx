"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MaskedInput } from "@/components/ui/MaskedInput";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { SEGMENTS, UF_LIST } from "@/lib/constants";
import { maskCnpj, stripMask } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const segmentOptions = SEGMENTS.map((segment) => ({ value: segment, label: segment }));
const ufOptions = UF_LIST.map((uf) => ({ value: uf, label: uf }));

export interface SettingsCompanyProps {
  company: { id: string; name: string; cnpj: string; segment: string; city: string; state: string };
}

export function SettingsCompany({ company }: SettingsCompanyProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState(company.name);
  const [cnpj, setCnpj] = useState(maskCnpj(company.cnpj));
  const [segment, setSegment] = useState(segmentOptions.find((s) => s.value === company.segment)?.value ?? "");
  const [city, setCity] = useState(company.city);
  const [state, setState] = useState(company.state);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!company.id) return;
    setSaving(true);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("companies")
        .update({ name, cnpj: stripMask(cnpj), segment, city, state })
        .eq("id", company.id);

      if (error) throw error;

      toast({ title: "Empresa atualizada", message: "Dados da empresa salvos com sucesso.", variant: "success" });
      router.refresh();
    } catch (err) {
      toast({ title: "Erro ao salvar", message: "Não foi possível atualizar os dados da empresa.", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader title="Empresa" description="Dados da sua organização" />
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input id="emp-nome" label="Nome da empresa" value={name} onChange={(e) => setName(e.target.value)} required />
          <MaskedInput id="emp-cnpj" label="CNPJ" value={cnpj} onChange={setCnpj} mask="cnpj" required />
          <Select
            id="emp-segmento"
            label="Segmento"
            options={segmentOptions}
            value={segment}
            onChange={(e) => setSegment(e.target.value)}
            placeholder="Selecione"
            required
          />
          <div className="grid grid-cols-[1fr_120px] gap-4">
            <Input id="emp-cidade" label="Cidade" value={city} onChange={(e) => setCity(e.target.value)} required />
            <Select
              id="emp-uf"
              label="UF"
              options={ufOptions}
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="UF"
              required
            />
          </div>
          <Button type="submit" loading={saving} className="sm:mt-6 sm:self-start">
            Salvar alterações
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}