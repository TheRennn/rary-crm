-- =============================================
-- RARY CRM — Schema completo no Supabase
-- Execute este SQL no SQL Editor do Supabase
-- =============================================

-- Empresas
create table if not exists companies (
  id text primary key,
  name text not null,
  cnpj text not null default '',
  segment text not null default '',
  city text not null default '',
  state text not null default '',
  logo_url text
);

-- Usuários
create table if not exists users (
  id text primary key,
  auth_id uuid unique references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  role text not null default 'VENDEDOR' check (role in ('ADMIN','GERENTE','VENDEDOR')),
  company_id text references companies(id),
  phone text default ''
);

create index if not exists idx_users_auth_id on users(auth_id);
create index if not exists idx_users_email on users(email);

-- Clientes
create table if not exists clients (
  id text primary key,
  code text not null unique,
  name text not null,
  cpf_cnpj text not null default '',
  type text not null default 'PESSOA_FISICA' check (type in ('PESSOA_FISICA','PESSOA_JURIDICA')),
  company_id text references companies(id),
  company_name text not null default '',
  company_cnpj text not null default '',
  segment text not null default '',
  city text not null default '',
  state text not null default '',
  decisor jsonb not null default '{}',
  contacts jsonb not null default '[]',
  responsible_id text,
  status text not null default 'NOVO' check (status in ('NOVO','EM_NEGOCIACAO','CLIENTE_ATIVO','INATIVO','PERDIDO')),
  origin text not null default '',
  notes text,
  created_at timestamptz not null default now(),
  last_contact_at timestamptz not null default now(),
  next_interaction_at timestamptz
);

create index if not exists idx_clients_company on clients(company_id);
create index if not exists idx_clients_responsible on clients(responsible_id);
create index if not exists idx_clients_status on clients(status);

-- Vendas
create table if not exists deals (
  id text primary key,
  code text not null,
  client_id text references clients(id),
  product text not null,
  description text,
  value numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  status text not null default 'ORCAMENTO' check (status in ('ORCAMENTO','NEGOCIACAO','APROVADA','CONCLUIDA','CANCELADA')),
  payment_status text not null default 'PENDENTE' check (payment_status in ('PAGO','PENDENTE','ATRASADO','CANCELADO')),
  responsible_id text
);

create index if not exists idx_deals_client on deals(client_id);

-- Compras
create table if not exists purchases (
  id text primary key,
  client_id text references clients(id),
  product text not null,
  date timestamptz not null default now(),
  quantity integer not null default 1,
  value numeric(12,2) not null default 0,
  status text not null default 'ORCAMENTO' check (status in ('ORCAMENTO','NEGOCIACAO','APROVADA','CONCLUIDA','CANCELADA')),
  payment_status text not null default 'PENDENTE' check (payment_status in ('PAGO','PENDENTE','ATRASADO','CANCELADO'))
);

create index if not exists idx_purchases_client on purchases(client_id);

-- Pagamentos
create table if not exists payments (
  id text primary key,
  client_id text references clients(id),
  deal_id text references deals(id),
  purchase_id text references purchases(id),
  client_name text not null default '',
  description text not null default '',
  value numeric(12,2) not null default 0,
  due_date timestamptz not null default now(),
  status text not null default 'PENDENTE' check (status in ('PAGO','PENDENTE','ATRASADO','CANCELADO')),
  method text not null default ''
);

create index if not exists idx_payments_client on payments(client_id);

-- Comissões
create table if not exists commissions (
  id text primary key,
  company_name text not null,
  period text not null,
  rate numeric(5,2) not null default 0,
  base_value numeric(12,2) not null default 0,
  value numeric(12,2) not null default 0,
  due_date timestamptz not null default now(),
  status text not null default 'PENDENTE' check (status in ('PAGO','PENDENTE','ATRASADO','CANCELADO')),
  method text not null default 'A_VISTA' check (method in ('A_VISTA','BOLETO','CARTAO')),
  installments jsonb,
  notes text
);

-- Pedidos
create table if not exists orders (
  id text primary key,
  code text not null,
  client_id text references clients(id),
  client_name text not null default '',
  company_name text not null default '',
  period text not null,
  date timestamptz not null default now(),
  source text not null default 'REPRESENTANTE' check (source in ('REPRESENTANTE','EMPRESA')),
  type text not null default 'VENDA' check (type in ('VENDA','AMOSTRA','BONIFICACAO')),
  items jsonb not null default '[]',
  total numeric(12,2) not null default 0,
  status text not null default 'PENDENTE' check (status in ('PAGO','PENDENTE','ATRASADO','CANCELADO'))
);

create index if not exists idx_orders_client on orders(client_id);

-- Metas
create table if not exists goals (
  id text primary key,
  target_type text not null check (target_type in ('CLIENTES','FATURAMENTO','VENDAS')),
  target_value numeric(12,2) not null default 0,
  period text not null,
  current_value numeric(12,2),
  notes text,
  created_at timestamptz not null default now()
);

-- Follow-ups
create table if not exists follow_ups (
  id text primary key,
  client_id text references clients(id),
  client_name text not null default '',
  responsible_id text,
  type text not null default 'OUTRO' check (type in ('LIGACAO','WHATSAPP','EMAIL','REUNIAO','PROPOSTA','OUTRO')),
  date timestamptz not null default now(),
  time text not null default '09:00',
  status text not null default 'PROXIMO' check (status in ('HOJE','ATRASADO','PROXIMO','CONCLUIDO')),
  subject text
);

create index if not exists idx_follow_ups_responsible on follow_ups(responsible_id);

-- Tarefas
create table if not exists tasks (
  id text primary key,
  title text not null,
  description text,
  client_id text references clients(id),
  client_name text,
  responsible_id text,
  due_date timestamptz not null default now(),
  due_time text not null default '09:00',
  status text not null default 'PROXIMA' check (status in ('ATRASADA','HOJE','PROXIMA','CONCLUIDA')),
  completed boolean not null default false
);

create index if not exists idx_tasks_responsible on tasks(responsible_id);

-- Eventos de calendário
create table if not exists calendar_events (
  id text primary key,
  title text not null,
  type text not null default 'COMPROMISSO' check (type in ('FOLLOW_UP','REUNIAO','TAREFA','VENCIMENTO','COMPROMISSO')),
  date timestamptz not null default now(),
  time text not null default '09:00',
  duration text not null default '30 min',
  client_id text references clients(id),
  client_name text,
  description text
);

-- Notificações
create table if not exists notifications (
  id text primary key,
  type text not null check (type in ('FOLLOW_UP','PAGAMENTO','TAREFA','NOVO_CLIENTE','NOVA_VENDA')),
  title text not null,
  message text not null,
  created_at timestamptz not null default now(),
  read boolean not null default false
);

-- Atividades
create table if not exists activities (
  id text primary key,
  type text not null check (type in ('CLIENTE','VENDA','FOLLOW_UP','PAGAMENTO','TAREFA')),
  title text not null,
  detail text not null,
  created_at timestamptz not null default now(),
  actor text not null default ''
);

-- Timelines
create table if not exists timelines (
  id text primary key,
  client_id text references clients(id),
  date timestamptz not null default now(),
  title text not null,
  description text,
  type text not null check (type in ('LIGACAO','WHATSAPP','EMAIL','REUNIAO','PROPOSTA','NOTA'))
);

create index if not exists idx_timelines_client on timelines(client_id);

-- =============================================
-- RLS: desabilitado (segurança no app via proxy)
-- =============================================
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE deals DISABLE ROW LEVEL SECURITY;
ALTER TABLE purchases DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE commissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE timelines DISABLE ROW LEVEL SECURITY;

-- =============================================
-- Usuário admin vinculado ao auth
-- =============================================
DO $$
DECLARE
  v_auth_id UUID;
BEGIN
  SELECT id INTO v_auth_id FROM auth.users WHERE email = 'ana@rary.com' LIMIT 1;

  IF v_auth_id IS NOT NULL THEN
    INSERT INTO companies (id, name, cnpj, segment, city, state)
    VALUES ('comp-rary', 'RARY Comercio Digital Ltda', '12.345.678/0001-90', 'Tecnologia', 'Sao Paulo', 'SP')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO users (id, auth_id, name, email, role, company_id, phone)
    VALUES ('usr-ana', v_auth_id, 'Ana Gabriela', 'ana@rary.com', 'ADMIN', 'comp-rary', '')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END;
$$;
