create table if not exists recebimentos (
  id text primary key,
  client_id text references clients(id),
  client_name text not null default '',
  responsible_id text,
  company_name text not null default '',
  product text not null default '',
  description text,
  value numeric not null default 0,
  entry_enabled boolean not null default false,
  entry_type text default 'FIXO' check (entry_type in ('FIXO','PERCENTUAL')),
  entry_value numeric default 0,
  shipping_enabled boolean not null default false,
  shipping_value numeric default 0,
  installments int not null default 1,
  installment_value numeric not null default 0,
  final_value numeric not null default 0,
  status text not null default 'PENDENTE' check (status in ('PENDENTE','PAGO','ATRASADO','CANCELADO')),
  date text,
  created_at timestamptz not null default now()
);

create index if not exists idx_recebimentos_responsible on recebimentos(responsible_id);
create index if not exists idx_recebimentos_client on recebimentos(client_id);
create index if not exists idx_recebimentos_status on recebimentos(status);

alter table recebimentos enable row level security;

drop policy if exists recebimentos_isolation on recebimentos;
create policy recebimentos_isolation on recebimentos
  for all
  using (
    client_id IS NULL
    OR client_id IN (
      SELECT id FROM clients WHERE company_id = public.user_company_id()
    )
    OR responsible_id = public.user_internal_id()
  );
