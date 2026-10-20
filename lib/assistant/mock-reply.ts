import type { AssistantReply } from "./types";

/**
 * RESPOSTAS DE DEMONSTRAÇÃO — usadas só nesta fase de design.
 *
 * Quando a IA real for integrada, troque a chamada a `getMockReply` em
 * `components/assistant/AssistantChat.tsx` por um `fetch("/api/assistant")`
 * que devolva um objeto no formato `AssistantReply`.
 */
export function getMockReply({ text, hasImage }: { text: string; hasImage: boolean }): AssistantReply {
  const normalized = text.toLowerCase();

  if (hasImage) {
    return {
      content: "Li o comprovante. Confira os dados antes de eu registrar o pagamento:",
      action: {
        title: "Registrar pagamento",
        rows: [
          { label: "Cliente", value: "Cliente de exemplo" },
          { label: "Valor", value: "R$ 250,00" },
          { label: "Forma", value: "Pix" },
          { label: "Data", value: "Hoje" },
        ],
        status: "pending",
      },
    };
  }

  if (normalized.includes("cliente")) {
    return {
      content: "Posso cadastrar. Entendi estes dados — está certo?",
      action: {
        title: "Novo cliente",
        rows: [
          { label: "Nome", value: "Cliente de exemplo" },
          { label: "Telefone", value: "(16) 90000-0000" },
          { label: "E-mail", value: "exemplo@email.com" },
        ],
        status: "pending",
      },
    };
  }

  if (normalized.includes("pagamento")) {
    return {
      content: "Claro! Envie a foto do comprovante (botão de imagem aqui embaixo) que eu leio os dados e registro para você.",
    };
  }

  if (normalized.includes("venda") || normalized.includes("resumo")) {
    return {
      content: "Em breve eu vou conseguir resumir suas vendas por aqui. Nesta versão de demonstração ainda não estou conectada aos seus dados.",
    };
  }

  return {
    content: "Olá! Esta é uma prévia do design do assistente. Em breve vou conversar de verdade e executar ações no seu CRM.",
  };
}
