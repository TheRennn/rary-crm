-- Tabela para armazenar tokens de verificação de e-mail (OTP)
create table if not exists verification_tokens (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  token text not null,
  expires_at timestamptz not null,
  used boolean not null default false,
  created_at timestamptz not null default now()
);

-- Índices para performance
create index idx_verification_tokens_email on verification_tokens(email);
create index idx_verification_tokens_token on verification_tokens(token);

-- Limpar tokens expirados automaticamente (via cron ou ao consultar)
