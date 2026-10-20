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

### Ambiente local e sandbox

1. No Supabase SQL Editor, confirme que `015_add_payment_verified.sql` já foi aplicada e execute `supabase/migrations/016_monthly_manual_billing.sql`.
2. Configure a chave de teste em `PAGARME_API_KEY`, `PAGARME_ENV=test` e um `PAGARME_WEBHOOK_SECRET` forte no ambiente local.
3. Aponte o webhook do ambiente de testes Stone/Pagar.me para o túnel HTTPS ativo, por exemplo `https://<tunnel>/api/webhooks/pagarme`. Se o provedor não enviar `x-hub-signature-256`, acrescente `?token=<PAGARME_WEBHOOK_SECRET>` à URL.
4. Habilite `charge.paid`, `order.paid`, `charge.payment_failed`, `order.payment_failed` e `charge.refunded`.

Em desenvolvimento local, mantenha o servidor e o túnel ativos. Uma confirmação assinada com valor diferente de R$ 49,90 é recusada e não concede acesso. Não use o retorno do checkout como confirmação de pagamento.

### Ativação pública em `crm.raryservice.com.br`

O domínio público pretendido é `https://crm.raryservice.com.br`. O DNS já aponta para a Vercel, mas isso, por si só, não configura as variáveis, o domínio de envio no Resend nem publica a implementação da mensalidade.

Antes de liberar usuários:

1. **Vercel — Preview primeiro:** configure as variáveis necessárias no ambiente Preview e publique a branch `feature/monthly-manual-billing`. Use credenciais Stone/Pagar.me de sandbox e, preferencialmente, um projeto Supabase de staging separado do banco de usuários reais.
2. **Supabase Auth:** defina `https://crm.raryservice.com.br` como Site URL e adicione `https://crm.raryservice.com.br/**` aos Redirect URLs. Mantenha `http://localhost:3000/**` apenas para desenvolvimento local.
3. **Resend:** verifique `raryservice.com.br` no painel do Resend, publique os registros DNS exatamente como fornecidos pelo Resend e aguarde a verificação. O domínio já publica SPF para Zoho; não substitua esse registro ao configurar o Resend. Só então configure `RESEND_FROM` com um remetente do domínio verificado, por exemplo `RARY CRM <contato@raryservice.com.br>`.
4. **Stone/Pagar.me — Testes:** a URL deve apontar para a implantação pública de Preview validada, no formato `https://<preview>/api/webhooks/pagarme`. Use o segredo correspondente ao ambiente Preview se for necessário autenticar por token na query; não reutilize o segredo de produção.
5. **Validação obrigatória:** conclua um pagamento de sandbox e confirme que o callback automático do provedor chega ao endpoint, atualiza a fatura uma única vez e libera acesso somente após a confirmação. Reenvie o evento para verificar idempotência e teste recusa, estorno, assinatura inválida e valor incorreto.
6. **Produção:** somente após a validação de Preview, configure na Vercel `NEXT_PUBLIC_APP_URL=https://crm.raryservice.com.br`, `PAGARME_SUCCESS_URL=https://crm.raryservice.com.br/pagamento/sucesso`, as chaves e o segredo **de produção** do Pagar.me (`PAGARME_ENV=live`), além das credenciais do Supabase público e do Resend verificado. A `SUPABASE_SERVICE_ROLE_KEY` deve permanecer somente no servidor, nunca em variável `NEXT_PUBLIC_*`.
7. Crie/ative o webhook no ambiente de produção Stone com `https://crm.raryservice.com.br/api/webhooks/pagarme` e os cinco eventos listados acima. Se não houver assinatura HMAC `x-hub-signature-256`, use `?token=<segredo-de-producao>` com um segredo aleatório exclusivo. Não grave segredos no repositório, em capturas de tela ou em mensagens.
8. Faça uma última validação controlada em produção antes de divulgar a URL. Depois promova a alteração testada para `master`; não faça o merge enquanto o callback automático do sandbox não tiver sido comprovado.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
