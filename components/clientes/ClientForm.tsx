"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MaskedInput } from "@/components/ui/MaskedInput";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import { clientRepository } from "@/lib/repositories";
import { clientService } from "@/lib/services";
import { CLIENT_STATUS_LABELS, COUNTRY_OPTIONS, UF_LIST } from "@/lib/constants";
import type { Client, ClientStatus } from "@/types";
import {
  IconArrowLeft,
  IconUser,
  IconBuilding,
  IconUsers,
  IconPhone,
  IconMail,
  IconGlobe,
  IconLayers,
  IconTrendingUp,
  IconTarget,
  IconAlertCircle,
} from "@/components/icons";

export interface ClientFormProps {
  currentUserId?: string;
  editClient?: Client | null;
}

const typeOptions = [
  { value: "PESSOA_FISICA", label: "Pessoa física" },
  { value: "PESSOA_JURIDICA", label: "Pessoa jurídica" },
];

const segmentOptions = [
  {
    label: "Tecnologia & Digital",
    options: [
      { value: "Tecnologia", label: "Tecnologia" },
      { value: "E-commerce", label: "E-commerce" },
      { value: "Comunicação e Marketing", label: "Comunicação e Marketing" },
      { value: "Telecomunicações", label: "Telecomunicações" },
    ],
  },
  {
    label: "Indústria & Produção",
    options: [
      { value: "Indústria", label: "Indústria" },
      { value: "Construção Civil", label: "Construção Civil" },
      { value: "Metalurgia", label: "Metalurgia" },
      { value: "Automotivo", label: "Automotivo" },
      { value: "Energia", label: "Energia" },
      { value: "Engenharia", label: "Engenharia" },
    ],
  },
  {
    label: "Serviços & Consultoria",
    options: [
      { value: "Serviços", label: "Serviços" },
      { value: "Consultoria", label: "Consultoria" },
      { value: "Jurídico", label: "Jurídico" },
      { value: "Financeiro", label: "Financeiro" },
      { value: "Segurança", label: "Segurança" },
      { value: "Manutenção", label: "Manutenção" },
    ],
  },
  {
    label: "Comércio & Varejo",
    options: [
      { value: "Varejo", label: "Varejo" },
      { value: "Alimentação", label: "Alimentação" },
      { value: "Restaurante e Lanchonete", label: "Restaurante e Lanchonete" },
      { value: "Beleza e Estética", label: "Beleza e Estética" },
      { value: "Pet", label: "Pet" },
      { value: "Mobiliário", label: "Mobiliário" },
    ],
  },
  {
    label: "Outros",
    options: [
      { value: "Saúde", label: "Saúde" },
      { value: "Educação", label: "Educação" },
      { value: "Logística", label: "Logística" },
      { value: "Transporte", label: "Transporte" },
      { value: "Agronegócio", label: "Agronegócio" },
      { value: "Imobiliário", label: "Imobiliário" },
      { value: "Farmacêutico", label: "Farmacêutico" },
      { value: "Turismo", label: "Turismo" },
      { value: "NENHUM", label: "Nenhuma das seguintes" },
    ],
  },
];

const originOptions = [
  {
    label: "Digital",
    options: [
      { value: "GOOGLE", label: "Google / SEO" },
      { value: "INSTAGRAM", label: "Instagram" },
      { value: "FACEBOOK", label: "Facebook" },
      { value: "LINKEDIN", label: "LinkedIn" },
      { value: "SITE", label: "Site próprio" },
      { value: "OUTBOUND", label: "Outbound / Ads" },
    ],
  },
  {
    label: "Presencial & Relacionamento",
    options: [
      { value: "INDICACAO", label: "Indicação" },
      { value: "FEIRA", label: "Feira / Evento" },
      { value: "PROSPECCAO", label: "Prospecção ativa" },
      { value: "PARCERIA", label: "Parceria" },
      { value: "MIDIA", label: "Mídia / Publicidade" },
    ],
  },
  {
    label: "Outros",
    options: [
      { value: "WHATSAPP", label: "WhatsApp" },
      { value: "NENHUM", label: "Nenhuma das seguintes" },
    ],
  },
];

const statusOptions = [
  {
    label: "Status",
    options: (Object.keys(CLIENT_STATUS_LABELS) as ClientStatus[]).map((status) => ({
      value: status,
      label: CLIENT_STATUS_LABELS[status],
    })),
  },
];

const ufOptions = UF_LIST.map((uf) => ({ value: uf, label: uf }));
const countryOptions = COUNTRY_OPTIONS.map((c) => ({ value: c.value, label: c.label }));

export default function ClientForm({ currentUserId, editClient }: ClientFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditing = !!editClient;
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [nome, setNome] = useState("");
  const [doc, setDoc] = useState("");
  const [tipo, setTipo] = useState("");
  const [empresaNome, setEmpresaNome] = useState("");
  const [empresaCnpj, setEmpresaCnpj] = useState("");
  const [segmento, setSegmento] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");
  const [decisorNome, setDecisorNome] = useState("");
  const [decisorCargo, setDecisorCargo] = useState("");
  const [decisorTelefone, setDecisorTelefone] = useState("");
  const [decisorEmail, setDecisorEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [contatoEmail, setContatoEmail] = useState("");
  const [contatoTelefone, setContatoTelefone] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [status, setStatus] = useState("");
  const [origem, setOrigem] = useState("");
  const [pais, setPais] = useState("BR");
  const [obs, setObs] = useState("");

  useEffect(() => {
    if (!isEditing) {
      clientService.getNextCode().then(setCode);
    } else {
      setCode(editClient.code);
    }
  }, [isEditing, editClient]);

  useEffect(() => {
    if (editClient) {
      setNome(editClient.name);
      setDoc(editClient.cpfCnpj);
      setTipo(editClient.type);
      setEmpresaNome(editClient.companyName);
      setEmpresaCnpj(editClient.companyCnpj);
      setSegmento(editClient.segment);
      setCidade(editClient.city);
      setUf(editClient.state);
      setDecisorNome(editClient.decisor.name);
      setDecisorCargo(editClient.decisor.role);
      setDecisorTelefone(editClient.decisor.phone);
      setDecisorEmail(editClient.decisor.email);
      setResponsavel(editClient.responsibleId);
      setStatus(editClient.status);
      setOrigem(editClient.origin);
      setObs(editClient.notes ?? "");
      const whatsapp = editClient.contacts.find((c) => c.type === "WHATSAPP");
      const email = editClient.contacts.find((c) => c.type === "EMAIL");
      const phone = editClient.contacts.find((c) => c.type === "TELEFONE");
      setWhatsapp(whatsapp?.value ?? "");
      setContatoEmail(email?.value ?? "");
      setContatoTelefone(phone?.value ?? "");
    }
  }, [editClient]);

  const responsavelOptions = currentUserId
    ? [{ value: currentUserId, label: "Eu mesmo" }]
    : [];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const clientData = {
        name: nome,
        cpfCnpj: doc,
        type: (tipo || "PESSOA_FISICA") as "PESSOA_FISICA" | "PESSOA_JURIDICA",
        companyName: empresaNome,
        companyCnpj: empresaCnpj,
        segment: (segmento || "Tecnologia") as any,
        city: cidade,
        state: uf,
        decisorName: decisorNome,
        decisorRole: decisorCargo,
        decisorPhone: decisorTelefone,
        decisorEmail: decisorEmail,
        whatsapp: whatsapp,
        email: contatoEmail,
        phone: contatoTelefone,
        responsibleId: responsavel || currentUserId || "",
        status: (status || "NOVO") as ClientStatus,
        origin: origem,
        notes: obs || undefined,
      };

      if (isEditing) {
        const updated = await clientService.update(editClient.id, clientData);
        toast({
          title: "Cliente atualizado",
          message: `${updated.code} — ${updated.name} atualizado com sucesso.`,
          variant: "success",
        });
        router.push(`/clientes/${editClient.id}`);
      } else {
        const client = await clientRepository.create(clientData);
        toast({
          title: "Cliente cadastrado",
          message: `${client.code} — ${client.name} criado com sucesso.`,
          variant: "success",
        });
        router.push("/clientes");
      }
      router.refresh();
    } catch (err) {
      toast({
        title: "Erro ao salvar",
        message: isEditing ? "Não foi possível atualizar o cliente. Tente novamente." : "Não foi possível cadastrar o cliente. Tente novamente.",
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <PageHeader
        title={isEditing ? "Editar cliente" : "Novo cliente"}
        description={isEditing ? `${editClient.code} — ${editClient.name}` : `Código gerado automaticamente: ${code || "..."}`}
        actions={
          <>
            <Link href={isEditing ? `/clientes/${editClient.id}` : "/clientes"}>
              <Button variant="outline">Cancelar</Button>
            </Link>
            <Button type="submit" loading={submitting}>
              {isEditing ? "Salvar alterações" : "Salvar cliente"}
            </Button>
          </>
        }
      />

      {/* Identificação */}
      <Card>
        <CardHeader
          title="Identificação"
          description="Dados principais do cliente"
          action={<IconUser className="h-5 w-5 text-muted-2" />}
        />
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
            <Input
              id="cliente-nome"
              label="Nome do cliente"
              placeholder="Nome completo ou razão social"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
            <MaskedInput
              id="cliente-doc"
              label="CPF/CNPJ"
              placeholder="000.000.000-00"
              mask="cpfCnpj"
              value={doc}
              onChange={setDoc}
              required
            />
            <Select
              id="cliente-tipo"
              label="Tipo de cliente"
              options={typeOptions}
              placeholder="Selecione o tipo"
              icon={<IconLayers className="h-4 w-4" />}
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Empresa */}
      <Card>
        <CardHeader
          title="Empresa"
          description="Dados da empresa do cliente"
          action={<IconBuilding className="h-5 w-5 text-muted-2" />}
        />
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              id="empresa-nome"
              label="Nome da empresa"
              placeholder="Razão social ou nome fantasia"
              value={empresaNome}
              onChange={(e) => setEmpresaNome(e.target.value)}
              required
            />
            <MaskedInput
              id="empresa-cnpj"
              label="CNPJ da empresa"
              placeholder="00.000.000/0001-00"
              mask="cnpj"
              value={empresaCnpj}
              onChange={setEmpresaCnpj}
              required
            />
            <Select
              id="empresa-segmento"
              label="Segmento"
              options={segmentOptions}
              placeholder="Selecione o segmento"
              icon={<IconLayers className="h-4 w-4" />}
              value={segmento}
              onChange={(e) => setSegmento(e.target.value)}
              required
            />
            <Input
              id="empresa-cidade"
              label="Cidade"
              placeholder="São Paulo"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              required
            />
            <Select
              id="empresa-uf"
              label="Estado"
              options={ufOptions}
              placeholder="UF"
              icon={<IconGlobe className="h-4 w-4" />}
              value={uf}
              onChange={(e) => setUf(e.target.value)}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Decisor */}
      <Card>
        <CardHeader
          title="Decisor"
          description="Pessoa responsável pelas decisões"
          action={<IconTarget className="h-5 w-5 text-muted-2" />}
        />
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              id="decisor-nome"
              label="Nome do decisor"
              placeholder="Nome completo"
              value={decisorNome}
              onChange={(e) => setDecisorNome(e.target.value)}
              required
            />
            <Input
              id="decisor-cargo"
              label="Cargo"
              placeholder="CEO, Diretor, Gerente..."
              value={decisorCargo}
              onChange={(e) => setDecisorCargo(e.target.value)}
              required
            />
            <MaskedInput
              id="decisor-telefone"
              label="Telefone"
              placeholder="(11) 90000-0000"
              mask="phone"
              value={decisorTelefone}
              onChange={setDecisorTelefone}
              required
            />
            <Input
              id="decisor-email"
              label="E-mail"
              type="email"
              placeholder="decisor@empresa.com"
              value={decisorEmail}
              onChange={(e) => setDecisorEmail(e.target.value)}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Contato */}
      <Card>
        <CardHeader
          title="Contato"
          description="Canais de comunicação"
          action={<IconPhone className="h-5 w-5 text-muted-2" />}
        />
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MaskedInput
              id="contato-whatsapp"
              label="WhatsApp"
              placeholder="(11) 90000-0000"
              mask="phone"
              value={whatsapp}
              onChange={setWhatsapp}
              required
            />
            <Input
              id="contato-email"
              label="E-mail"
              type="email"
              placeholder="contato@empresa.com"
              value={contatoEmail}
              onChange={(e) => setContatoEmail(e.target.value)}
              required
            />
            <MaskedInput
              id="contato-telefone"
              label="Telefone"
              placeholder="(11) 3000-0000"
              mask="phone"
              value={contatoTelefone}
              onChange={setContatoTelefone}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Comercial */}
      <Card>
        <CardHeader
          title="Comercial"
          description="Configuração comercial do cliente"
          action={<IconTrendingUp className="h-5 w-5 text-muted-2" />}
        />
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Select
              id="comercial-responsavel"
              label="Responsável"
              options={responsavelOptions}
              placeholder={
                responsavelOptions.length === 0
                  ? "Nenhum usuário disponível"
                  : "Selecione o responsável"
              }
              emptyMessage="Cadastre um usuário primeiro"
              icon={<IconUsers className="h-4 w-4" />}
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
              required
            />
            <Select
              id="comercial-status"
              label="Status"
              options={statusOptions}
              placeholder="Selecione o status"
              icon={<IconAlertCircle className="h-4 w-4" />}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
            />
            <Select
              id="comercial-origem"
              label="Origem"
              options={originOptions}
              placeholder="Como chegou?"
              icon={<IconGlobe className="h-4 w-4" />}
              value={origem}
              onChange={(e) => setOrigem(e.target.value)}
              required
            />
            <Select
              id="comercial-pais"
              label="País"
              options={countryOptions}
              icon={<IconGlobe className="h-4 w-4" />}
              value={pais}
              onChange={(e) => setPais(e.target.value)}
            />
          </div>
          <Textarea
            id="comercial-obs"
            label="Observações"
            placeholder="Notas, contexto, próximos passos..."
            className="mt-4"
            rows={3}
            value={obs}
            onChange={(e) => setObs(e.target.value)}
          />
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 border-t border-border pt-6">
        <Link href={isEditing ? `/clientes/${editClient.id}` : "/clientes"}>
          <Button variant="ghost">
            <IconArrowLeft className="h-4 w-4" />
            {isEditing ? "Voltar para cliente" : "Voltar para clientes"}
          </Button>
        </Link>
        <Button type="submit" size="lg" loading={submitting} className="ml-auto">
          {isEditing ? "Salvar alterações" : "Salvar cliente"}
        </Button>
      </div>
    </form>
  );
}
