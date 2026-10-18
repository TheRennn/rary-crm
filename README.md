This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Mensalidade e liberação de acesso

O acesso de contas novas exige e-mail verificado e período mensal pago. O valor é R$ 49,90; Pix, boleto e cartão são cobrados por links avulsos, e a confirmação só acontece pelo webhook (o retorno do checkout não libera o CRM).

Antes de ativar o fluxo:

1. No Supabase SQL Editor, confirme que `015_add_payment_verified.sql` já foi aplicada e execute `supabase/migrations/016_monthly_manual_billing.sql`.
2. Configure `PAGARME_API_KEY`, `PAGARME_ENV` e `PAGARME_WEBHOOK_SECRET` no ambiente da aplicação.
3. Aponte o webhook Stone/Pagar.me para `https://<dominio-publico>/api/webhooks/pagarme`. Se o provedor não enviar `x-hub-signature-256`, acrescente `?token=<PAGARME_WEBHOOK_SECRET>` à URL. Use HTTPS e um segredo aleatório forte; não coloque o segredo no repositório.
4. Habilite os eventos `charge.paid`, `order.paid`, `charge.payment_failed`, `order.payment_failed` e `charge.refunded`.

Em desenvolvimento local, use um túnel HTTPS (por exemplo, ngrok) e atualize a URL do webhook para esse túnel. Uma confirmação de pagamento simulada sem o valor exato de R$ 49,90 é recusada e não concede acesso.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
