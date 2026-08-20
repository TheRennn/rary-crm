"use client";

import { useState, type FormEvent } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { SEGMENTS, UF_LIST } from "@/lib/constants";

const segmentOptions = SEGMENTS.map((segment) => ({ value: segment, label: segment }));
const ufOptions = UF_LIST.map((uf) => ({ value: uf, label: uf }));

export interface SettingsCompanyProps {
  company: { id: string; name: string; cnpj: string; segment: string; city: string; state: string };
}

export function SettingsCompany({ company }: SettingsCompanyProps) {
  const { toast } = useToast();
  const [name, setName] = useState(company.name);
  const [cnpj, setCnpj] = useState(company.cnpj);
  const [segment, setSegment] = useState(segmentOptions.find((s) => s.value === company.segment)?.value ?? "");
  const [city, setCity] = useState(company.city);
  const [state, setState] = useState(company.state);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    toast({ title: "Empresa atualizada", message: "Dados da empresa salvos (mock).", variant: "success" });
  }

  return (
    <Card>
      <CardHeader title="Empresa" description="Dados da sua organização" />
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input id="emp-nome" label="Nome da empresa" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input id="emp-cnpj" label="CNPJ" value={cnpj} onChange={(e) => setCnpj(e.target.value)} />
          <Select
            id="emp-segmento"
            label="Segmento"
            options={segmentOptions}
            value={segment}
            onChange={(e) => setSegment(e.target.value)}
            placeholder="Selecione"
          />
          <div className="grid grid-cols-[1fr_120px] gap-4">
            <Input id="emp-cidade" label="Cidade" value={city} onChange={(e) => setCity(e.target.value)} />
            <Select
              id="emp-uf"
              label="UF"
              options={ufOptions}
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="UF"
            />
          </div>
          <Button type="submit" className="sm:mt-6 sm:self-start">
            Salvar alterações
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}