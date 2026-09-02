import type { ReactNode } from "react";
import {
  IconAlertCircle,
  IconX,
  IconCalendar,
  IconRefresh,
  IconCheckSquare,
  IconCreditCard,
  IconUsers,
  IconTrendingUp,
  IconTarget,
  IconLayers,
  IconSettings,
} from "@/components/icons";
import {
  IconCalendarCheck,
  IconShieldCheck,
  IconKey,
} from "@/components/ui/icons-additional";
import { Reveal } from "@/components/ui/Reveal";

export interface SectionProps {
  id?: string;
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  children: ReactNode;
}

export function Section({ id, eyebrow, title, description, children }: SectionProps) {
  return (
    <section id={id} className="relative mx-auto max-w-6xl overflow-hidden px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <Reveal>
          {eyebrow && (
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-400">
              {eyebrow}
            </span>
          )}
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            {title}
          </h2>
          {description && (
            <p className="mt-4 text-base leading-relaxed text-muted">{description}</p>
          )}
        </Reveal>
      </div>
      <div className="mt-12">{children}</div>
    </section>
  );
}

const problems = [
  {
    icon: <IconAlertCircle className="h-5 w-5" />,
    title: "Clientes espalhados",
    text: "Contatos perdidos em planilhas, cadernos, WhatsApp e na cabeça de cada vendedor.",
  },
  {
    icon: <IconX className="h-5 w-5" />,
    title: "Follow-ups esquecidos",
    text: "Promessas de retorno que ninguém lembra. Oportunidades que esfriam sem acompanhamento.",
  },
  {
    icon: <IconCreditCard className="h-5 w-5" />,
    title: "Pagamentos sem controle",
    text: "Boleto vencido, recebimento atrasado. Você só descobre quando já virou dor de cabeça.",
  },
  {
    icon: <IconLayers className="h-5 w-5" />,
    title: "Tudo pela metade",
    text: "Um app para cliente, outro para venda, outro para cobrança. Nenhuma visão do todo.",
  },
];

export function LandingProblem() {
  return (
    <Section
      id="problema"
      eyebrow="O problema"
      title="Gerenciar o comercial na mão sai caro"
      description="Sua equipe vende e atende, mas sem um lugar único tudo se fragmenta — e a operação paga o preço."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {problems.map((item, index) => (
          <Reveal key={item.title} delay={index * 70} className="h-full">
            <div className="h-full rounded-xl border border-border bg-surface-1/70 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-danger/30 hover:bg-surface-2 hover:shadow-xl hover:shadow-danger/5">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-danger/20 bg-danger/10 text-danger">
                {item.icon}
              </span>
              <h3 className="mt-4 text-base font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

const solutions = [
  { icon: <IconUsers className="h-5 w-5" />, title: "Cliente sempre visível", text: "Histórico completo, decisor, contatos e compras em um só cadastro." },
  { icon: <IconRefresh className="h-5 w-5" />, title: "Follow-up no dia certo", text: "Sua rotina comercial organizada: hoje, atrasados e próximos." },
  { icon: <IconTrendingUp className="h-5 w-5" />, title: "Vendas sob controle", text: "Do orçamento à conclusão, com status e valores claros." },
  { icon: <IconCreditCard className="h-5 w-5" />, title: "Pagamento acompanhado", text: "Recebido, pendente ou em atraso — você sabe tudo." },
  { icon: <IconCalendar className="h-5 w-5" />, title: "Agenda completa", text: "Follow-ups, reuniões, tarefas e vencimentos em um calendário." },
  { icon: <IconCheckSquare className="h-5 w-5" />, title: "Pendências em dia", text: "Nada escapa: tarefas atrasadas, do dia e próximas." },
];

export function LandingSolution() {
  return (
    <Section
      id="solucao"
      eyebrow="O que o CRM resolve"
      title="Uma plataforma para a rotina inteira"
      description="O RARY CRM centraliza clientes, vendas, pagamentos, tarefas e follow-ups para sua equipe trabalhar com clareza e foco."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {solutions.map((item, index) => (
          <Reveal key={item.title} delay={index * 70} className="h-full">
            <div className="group h-full rounded-xl border border-border bg-surface-1/70 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:bg-surface-2 hover:shadow-xl hover:shadow-brand-600/15">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-brand-500/30 bg-brand-500/10 text-brand-300 transition-transform duration-300 group-hover:scale-110">
                {item.icon}
              </span>
              <h3 className="mt-4 text-base font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

const features = [
  { icon: <IconUsers className="h-5 w-5" />, title: "Gestão de clientes", text: "Cadastros completos com decisor, contatos e histórico de tratativas." },
  { icon: <IconRefresh className="h-5 w-5" />, title: "Follow-ups", text: "Ligações, WhatsApp, e-mails, reuniões e propostas organizados por dia." },
  { icon: <IconTrendingUp className="h-5 w-5" />, title: "Vendas", text: "Funil com orçamento, negociação, aprovação e conclusão." },
  { icon: <IconCreditCard className="h-5 w-5" />, title: "Pagamentos", text: "Controle de recebidos, pendentes e atrasados com formas de pagamento." },
  { icon: <IconCalendar className="h-5 w-5" />, title: "Calendário", text: "Compromissos, reuniões, tarefas e vencimentos em uma visão só." },
  { icon: <IconCheckSquare className="h-5 w-5" />, title: "Central de pendentes", text: "Tarefas atrasadas, do dia e próximas com prazo e responsável." },
  { icon: <IconTarget className="h-5 w-5" />, title: "Painéis claros", text: "Visão geral da operação com indicadores de clientes, vendas e pagamentos." },
  { icon: <IconKey className="h-5 w-5" />, title: "Equipe organizada", text: "Responsáveis definidos em cada cliente, venda e tarefa." },
  { icon: <IconSettings className="h-5 w-5" />, title: "Sua marca", text: "Personalize cores e identidade para o CRM conversar com o seu negócio." },
];

export function LandingFeatures() {
  return (
    <Section
      id="funcionalidades"
      eyebrow="Funcionalidades"
      title="Tudo o que o seu time precisa"
      description="Ferramentas simples e completas, pensadas para empresários e equipes comerciais."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((item, index) => (
          <Reveal key={item.title} delay={index * 60} className="h-full">
            <div className="group h-full rounded-xl border border-border bg-surface-1/70 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:bg-surface-2 hover:shadow-xl hover:shadow-brand-600/15">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-brand-500/30 bg-brand-500/10 text-brand-300 transition-transform duration-300 group-hover:scale-110">
                {item.icon}
              </span>
              <h3 className="mt-4 text-base font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

const steps = [
  { icon: <IconUsers className="h-5 w-5" />, step: "1", title: "Cadastre seus clientes", text: "Importe sua base e organize contatos, decisores e empresas." },
  { icon: <IconRefresh className="h-5 w-5" />, step: "2", title: "Alimente sua rotina", text: "Registre vendas, follow-ups e tarefas com responsáveis e prazos." },
  { icon: <IconCalendarCheck className="h-5 w-5" />, step: "3", title: "Acompanhe pelo painel", text: "Veja o que vence hoje, o que atrasou e o que precisa de atenção." },
  { icon: <IconShieldCheck className="h-5 w-5" />, step: "4", title: "Venda mais e com confiança", text: "Controle da operação nas mãos do time, do primeiro contato ao pagamento." },
];

export function LandingHowItWorks() {
  return (
    <Section
      id="como-funciona"
      eyebrow="Como funciona"
      title="Do cadastro ao pagamento, sem perder nada"
      description="Em quatro passos sua operação comercial fica organizada e visível."
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((item, index) => (
          <Reveal key={item.title} delay={index * 90} className="h-full">
            <div className="relative h-full">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-300 shadow-lg shadow-brand-600/10 transition-transform duration-300 hover:scale-110">
                    {item.icon}
                  </span>
                  {index < steps.length - 1 && (
                    <span className="mt-2 h-full w-px bg-brand-500/40" aria-hidden="true" />
                  )}
                </div>
                <div className="pb-8">
                  <span className="text-xs font-semibold uppercase tracking-widest text-brand-400">
                    Passo {item.step}
                  </span>
                  <h3 className="mt-1 text-base font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}