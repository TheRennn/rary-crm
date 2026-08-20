"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import { clientService } from "@/lib/services";
import { CLIENT_ORIGINS, CLIENT_STATUS_LABELS, SEGMENTS, UF_LIST } from "@/lib/constants";
import type { ClientStatus } from "@/types";
import { IconArrowLeft } from "@/components/icons";

export interface ClientFormProps {
  users: { id: string; name: string }[];
}

const typeOptions = [
  { value: "PESSOA_FISICA", label: "Pessoa física" },
  { value: "PESSOA_JURIDICA", label: "Pessoa jurídica" },
];

const segmentOptions = SEGMENTS.map((segment) => ({ value: segment, label: segment }));
const ufOptions = UF_LIST.map((uf) => ({ value: uf, label: uf }));
const originOptions = CLIENT_ORIGINS.map((origin) => ({ value: origin, label: origin }));
const statusOptions = (Object.keys(CLIENT_STATUS_LABELS) as ClientStatus[]).map((status) => ({
  value: status,
  label: CLIENT_STATUS_LABELS[status],
}));
const countryCode = { value: "BR", label: "Brasil (+55)" };

export default function ClientForm({ users }: ClientFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    clientService.getNextCode().then(setCode);
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    // TODO: sprint seguinte — persistência real via backend.
    setTimeout(() => {
      setSubmitting(false);
      toast({
        title: "Cliente cadastrado",
        message: `${code} criado com sucesso.`,
        variant: "success",
      });
      router.push("/clientes");
    }, 800);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <PageHeader
        title="Novo cliente"
        description={`Código gerado automaticamente: ${code || "..."}`}
        actions={
          <>
            <Link href="/clientes">
              <Button variant="outline">Cancelar</Button>
            </Link>
            <Button type="submit" loading={submitting}>
              Salvar cliente
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader title="Identificação" description="Dados principais do cliente" />
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              id="cliente-codigo"
              label="Código do cliente"
              value={code}
              readOnly
              className="opacity-80"
              hint="Gerado automaticamente"
            />
            <Input id="cliente-nome" label="Nome do cliente" placeholder="Nome completo" required />
            <Input id="cliente-doc" label="CPF/CNPJ" placeholder="000.000.000-00" />
            <Select
              id="cliente-tipo"
              label="Tipo de cliente"
              options={typeOptions}
              placeholder="Selecione o tipo"
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Empresa" description="Dados da empresa do cliente" />
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input id="empresa-nome" label="Nome da empresa" placeholder="Empresa XYZ" required />
            <Input id="empresa-cnpj" label="CNPJ da empresa" placeholder="00.000.000/0001-00" />
            <Select
              id="empresa-segmento"
              label="Segmento"
              options={segmentOptions}
              placeholder="Selecione o segmento"
              required
            />
            <Input id="empresa-cidade" label="Cidade" placeholder="São Paulo" />
            <Select id="empresa-uf" label="Estado" options={ufOptions} placeholder="UF" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Decisor" description="Pessoa responsável pelas decisões" />
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input id="decisor-nome" label="Nome do decisor" placeholder="Nome completo" required />
            <Input id="decisor-cargo" label="Cargo" placeholder="CEO, Diretor..." />
            <Input id="decisor-telefone" label="Telefone" placeholder="(11) 90000-0000" />
            <Input id="decisor-email" label="E-mail" type="email" placeholder="decisor@empresa.com" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Contato" description="Canais de comunicação" />
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input id="contato-whatsapp" label="WhatsApp" placeholder="(11) 90000-0000" />
            <Input id="contato-email" label="E-mail" type="email" placeholder="contato@empresa.com" />
            <Input id="contato-telefone" label="Telefone" placeholder="(11) 3000-0000" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Comercial" description="Configuração comercial do cliente" />
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Select
              id="comercial-responsavel"
              label="Responsável"
              options={users.map((user) => ({ value: user.id, label: user.name }))}
              placeholder="Selecione o responsável"
              required
            />
            <Select
              id="comercial-status"
              label="Status"
              options={statusOptions}
              placeholder="Selecione o status"
              required
            />
            <Select
              id="comercial-origem"
              label="Origem"
              options={originOptions}
              placeholder="Como chegou?"
              required
            />
            <Select
              id="comercial-pais"
              label="País"
              options={[countryCode]}
              defaultValue="BR"
            />
          </div>
          <Textarea
            id="comercial-obs"
            label="Observações"
            placeholder="Notas, contexto, próximos passos..."
            className="mt-4"
            rows={3}
          />
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 border-t border-border pt-6">
        <Link href="/clientes">
          <Button variant="ghost">
            <IconArrowLeft className="h-4 w-4" />
            Voltar para clientes
          </Button>
        </Link>
        <Button type="submit" size="lg" loading={submitting} className="ml-auto">
          Salvar cliente
        </Button>
      </div>
    </form>
  );
}