import type { Deal } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

function getStatusLabel(status: Deal["status"]): string {
  const labels: Record<Deal["status"], string> = {
    ORCAMENTO: "Orçamento",
    NEGOCIACAO: "Negociação",
    APROVADA: "Aprovada",
    CONCLUIDA: "Concluída",
    CANCELADA: "Cancelada",
  };
  return labels[status];
}

function getPaymentStatusLabel(status: Deal["paymentStatus"]): string {
  const labels: Record<Deal["paymentStatus"], string> = {
    PAGO: "Pago",
    PENDENTE: "Pendente",
    ATRASADO: "Atrasado",
    CANCELADO: "Cancelado",
  };
  return labels[status];
}

function getDocTitle(status: Deal["status"]): string {
  switch (status) {
    case "ORCAMENTO":
      return "ORÇAMENTO";
    case "APROVADA":
      return "PEDIDO APROVADO";
    case "CONCLUIDA":
      return "VENDA FECHADA";
    default:
      return "DOCUMENTO COMERCIAL";
  }
}

function buildHTML(deal: Deal, clientName: string): string {
  const title = getDocTitle(deal.status);
  const today = new Date().toLocaleDateString("pt-BR");

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${title} - ${deal.code}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; border-bottom: 2px solid #7c3aed; padding-bottom: 16px; }
    .logo { font-size: 24px; font-weight: 700; color: #7c3aed; }
    .logo span { color: #1a1a2e; }
    .doc-title { font-size: 18px; font-weight: 700; text-align: right; color: #7c3aed; }
    .doc-date { font-size: 12px; color: #666; text-align: right; margin-top: 4px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .info-card { background: #f8f7ff; border-radius: 8px; padding: 16px; border: 1px solid #e5e1f0; }
    .info-label { font-size: 11px; text-transform: uppercase; color: #888; letter-spacing: 0.5px; margin-bottom: 4px; }
    .info-value { font-size: 14px; font-weight: 600; color: #1a1a2e; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th { background: #7c3aed; color: white; padding: 10px 16px; text-align: left; font-size: 12px; text-transform: uppercase; }
    td { padding: 12px 16px; border-bottom: 1px solid #eee; font-size: 14px; }
    tr:nth-child(even) { background: #fafafa; }
    .total-row { background: #f8f7ff !important; font-weight: 700; }
    .total-row td { border-bottom: none; font-size: 16px; color: #7c3aed; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #eee; font-size: 11px; color: #999; text-align: center; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .status-ORCAMENTO { background: #f3f4f6; color: #374151; }
    .status-APROVADA { background: #dbeafe; color: #1d4ed8; }
    .status-CONCLUIDA { background: #d1fae5; color: #047857; }
    .status-NEGOCIACAO { background: #ede9fe; color: #6d28d9; }
    .status-CANCELADA { background: #fee2e2; color: #dc2626; }
    .description { background: #f8f7ff; border-radius: 8px; padding: 16px; margin-bottom: 24px; border: 1px solid #e5e1f0; }
    .description h3 { font-size: 12px; text-transform: uppercase; color: #888; margin-bottom: 8px; }
    .description p { font-size: 14px; color: #333; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">RARY <span>CRM</span></div>
    </div>
    <div>
      <div class="doc-title">${title}</div>
      <div class="doc-date">Data: ${today}</div>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-card">
      <div class="info-label">Código</div>
      <div class="info-value">${deal.code}</div>
    </div>
    <div class="info-card">
      <div class="info-label">Cliente</div>
      <div class="info-value">${clientName}</div>
    </div>
    <div class="info-card">
      <div class="info-label">Produto / Serviço</div>
      <div class="info-value">${deal.product}</div>
    </div>
    <div class="info-card">
      <div class="info-label">Status</div>
      <div class="info-value"><span class="status-badge status-${deal.status}">${getStatusLabel(deal.status)}</span></div>
    </div>
    <div class="info-card">
      <div class="info-label">Pagamento</div>
      <div class="info-value">${getPaymentStatusLabel(deal.paymentStatus)}</div>
    </div>
    <div class="info-card">
      <div class="info-label">Data de Criação</div>
      <div class="info-value">${formatDate(deal.createdAt)}</div>
    </div>
    ${deal.deliveryDeadline ? `
    <div class="info-card">
      <div class="info-label">Prazo de Entrega</div>
      <div class="info-value">${new Date(deal.deliveryDeadline + "T00:00:00").toLocaleDateString("pt-BR")}</div>
    </div>` : ""}
  </div>

  <table>
    <thead>
      <tr>
        <th>Descrição</th>
        <th style="text-align: right;">Valor</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${deal.product}</td>
        <td style="text-align: right;">${formatCurrency(deal.value)}</td>
      </tr>
      <tr class="total-row">
        <td>TOTAL</td>
        <td style="text-align: right;">${formatCurrency(deal.value)}</td>
      </tr>
    </tbody>
  </table>

  ${deal.description ? `
  <div class="description">
    <h3>Observações</h3>
    <p>${deal.description}</p>
  </div>` : ""}

  <div class="footer">
    RARY CRM — Documento gerado automaticamente em ${today}
  </div>
</body>
</html>`;
}

export function generateDealPDF(deal: Deal, clientName: string): void {
  const html = buildHTML(deal, clientName);
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 500);
}
