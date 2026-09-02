-- Tabela de produtos para catálogo
create table if not exists products (
  id text primary key,
  user_id text,
  code text not null,
  name text not null,
  description text,
  category text not null default 'OUTRO',
  unit text not null default 'UN',
  unit_value numeric(12,2) not null default 0,
  cost_value numeric(12,2) default 0,
  discount numeric(5,2) default 0,
  min_stock integer default 0,
  current_stock integer default 0,
  company_id text,
  company_name text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Índices para buscas frequentes
create index if not exists idx_products_user_id on products(user_id);
create index if not exists idx_products_category on products(category);
create index if not exists idx_products_active on products(active);

-- RLS
alter table products enable row level security;

create policy "Users can view own products" on products
  for select using (user_id = auth.uid()::text);

create policy "Users can insert own products" on products
  for insert with check (user_id = auth.uid()::text);

create policy "Users can update own products" on products
  for update using (user_id = auth.uid()::text);

create policy "Users can delete own products" on products
  for delete using (user_id = auth.uid()::text);
