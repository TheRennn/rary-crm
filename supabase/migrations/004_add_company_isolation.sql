-- =============================================
-- RARY CRM — Isolamento de dados por empresa
-- Migration segura: não deleta nada, só adiciona
-- =============================================

-- =============================================
-- 1. Adicionar colunas faltantes (IF NOT EXISTS)
-- =============================================

-- Comissões: adicionar user_id para vincular ao representante
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'commissions' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE commissions ADD COLUMN user_id text;
  END IF;
END $$;

-- Metas: adicionar user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'goals' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE goals ADD COLUMN user_id text;
  END IF;
END $$;

-- Notificações: adicionar user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE notifications ADD COLUMN user_id text;
  END IF;
END $$;

-- Atividades: adicionar user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'activities' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE activities ADD COLUMN user_id text;
  END IF;
END $$;

-- =============================================
-- 2. Backfill: vincular clientes órfãos à empresa do responsável
-- =============================================
UPDATE clients c
SET company_id = u.company_id
FROM users u
WHERE c.company_id IS NULL
  AND c.responsible_id = u.id
  AND u.company_id IS NOT NULL;

-- =============================================
-- 3. Criar índices para as novas colunas
-- =============================================
CREATE INDEX IF NOT EXISTS idx_commissions_user ON commissions(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(user_id);

-- =============================================
-- 4. RLS — Reabilitar com policies por empresa
-- =============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE timelines ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Policies: cada usuário só vê dados da sua empresa
-- =============================================

-- Helper: extrair company_id do auth user
CREATE OR REPLACE FUNCTION public.user_company_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT company_id FROM public.users WHERE auth_id = auth.uid() LIMIT 1;
$$;

-- Helper: extrair user_id interno do auth user
CREATE OR REPLACE FUNCTION public.user_internal_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT id FROM public.users WHERE auth_id = auth.uid() LIMIT 1;
$$;

-- POLICIES USERS
DROP POLICY IF EXISTS users_isolation ON users;
CREATE POLICY users_isolation ON users
  FOR ALL
  USING (company_id = public.user_company_id());

-- POLICIES COMPANIES
DROP POLICY IF EXISTS companies_isolation ON companies;
CREATE POLICY companies_isolation ON companies
  FOR ALL
  USING (id = public.user_company_id());

-- POLICIES CLIENTS
DROP POLICY IF EXISTS clients_isolation ON clients;
CREATE POLICY clients_isolation ON clients
  FOR ALL
  USING (company_id = public.user_company_id());

-- POLICIES DEALS (via clients.company_id)
DROP POLICY IF EXISTS deals_isolation ON deals;
CREATE POLICY deals_isolation ON deals
  FOR ALL
  USING (
    client_id IN (
      SELECT id FROM clients WHERE company_id = public.user_company_id()
    )
  );

-- POLICIES PURCHASES (via clients.company_id)
DROP POLICY IF EXISTS purchases_isolation ON purchases;
CREATE POLICY purchases_isolation ON purchases
  FOR ALL
  USING (
    client_id IN (
      SELECT id FROM clients WHERE company_id = public.user_company_id()
    )
  );

-- POLICIES PAYMENTS (via clients.company_id)
DROP POLICY IF EXISTS payments_isolation ON payments;
CREATE POLICY payments_isolation ON payments
  FOR ALL
  USING (
    client_id IN (
      SELECT id FROM clients WHERE company_id = public.user_company_id()
    )
  );

-- POLICIES ORDERS (via clients.company_id)
DROP POLICY IF EXISTS orders_isolation ON orders;
CREATE POLICY orders_isolation ON orders
  FOR ALL
  USING (
    client_id IN (
      SELECT id FROM clients WHERE company_id = public.user_company_id()
    )
  );

-- POLICIES TIMELINES (via clients.company_id)
DROP POLICY IF EXISTS timelines_isolation ON timelines;
CREATE POLICY timelines_isolation ON timelines
  FOR ALL
  USING (
    client_id IN (
      SELECT id FROM clients WHERE company_id = public.user_company_id()
    )
  );

-- POLICIES FOLLOW_UPS (via clients.company_id OU responsible_id)
DROP POLICY IF EXISTS follow_ups_isolation ON follow_ups;
CREATE POLICY follow_ups_isolation ON follow_ups
  FOR ALL
  USING (
    client_id IN (
      SELECT id FROM clients WHERE company_id = public.user_company_id()
    )
    OR responsible_id = public.user_internal_id()
  );

-- POLICIES TASKS (via clients.company_id OU responsible_id)
DROP POLICY IF EXISTS tasks_isolation ON tasks;
CREATE POLICY tasks_isolation ON tasks
  FOR ALL
  USING (
    client_id IN (
      SELECT id FROM clients WHERE company_id = public.user_company_id()
    )
    OR responsible_id = public.user_internal_id()
  );

-- POLICIES CALENDAR_EVENTS (via clients.company_id)
DROP POLICY IF EXISTS calendar_events_isolation ON calendar_events;
CREATE POLICY calendar_events_isolation ON calendar_events
  FOR ALL
  USING (
    client_id IN (
      SELECT id FROM clients WHERE company_id = public.user_company_id()
    )
  );

-- POLICIES COMMISSIONS (via user_id)
DROP POLICY IF EXISTS commissions_isolation ON commissions;
CREATE POLICY commissions_isolation ON commissions
  FOR ALL
  USING (user_id = public.user_internal_id());

-- POLICIES GOALS (via user_id)
DROP POLICY IF EXISTS goals_isolation ON goals;
CREATE POLICY goals_isolation ON goals
  FOR ALL
  USING (user_id = public.user_internal_id());

-- POLICIES NOTIFICATIONS (via user_id)
DROP POLICY IF EXISTS notifications_isolation ON notifications;
CREATE POLICY notifications_isolation ON notifications
  FOR ALL
  USING (user_id = public.user_internal_id());

-- POLICIES ACTIVITIES (via user_id)
DROP POLICY IF EXISTS activities_isolation ON activities;
CREATE POLICY activities_isolation ON activities
  FOR ALL
  USING (user_id = public.user_internal_id());
