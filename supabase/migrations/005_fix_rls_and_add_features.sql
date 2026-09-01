-- =============================================
-- RARY CRM — Fix RLS + Novas funcionalidades
-- Migration segura: não deleta nada existente
-- =============================================

-- =============================================
-- 1. FIX: RLS policies que bloqueiam INSERT sem client_id
-- =============================================

-- Deals: permitir INSERT quando client_id é NULL
DROP POLICY IF EXISTS deals_isolation ON deals;
CREATE POLICY deals_isolation ON deals
  FOR ALL
  USING (
    client_id IS NULL
    OR client_id IN (
      SELECT id FROM clients WHERE company_id = public.user_company_id()
    )
  );

-- Purchases: permitir INSERT quando client_id é NULL
DROP POLICY IF EXISTS purchases_isolation ON purchases;
CREATE POLICY purchases_isolation ON purchases
  FOR ALL
  USING (
    client_id IS NULL
    OR client_id IN (
      SELECT id FROM clients WHERE company_id = public.user_company_id()
    )
  );

-- Payments: permitir INSERT quando client_id é NULL
DROP POLICY IF EXISTS payments_isolation ON payments;
CREATE POLICY payments_isolation ON payments
  FOR ALL
  USING (
    client_id IS NULL
    OR client_id IN (
      SELECT id FROM clients WHERE company_id = public.user_company_id()
    )
  );

-- Orders: permitir INSERT quando client_id é NULL
DROP POLICY IF EXISTS orders_isolation ON orders;
CREATE POLICY orders_isolation ON orders
  FOR ALL
  USING (
    client_id IS NULL
    OR client_id IN (
      SELECT id FROM clients WHERE company_id = public.user_company_id()
    )
  );

-- Timelines: permitir INSERT quando client_id é NULL
DROP POLICY IF EXISTS timelines_isolation ON timelines;
CREATE POLICY timelines_isolation ON timelines
  FOR ALL
  USING (
    client_id IS NULL
    OR client_id IN (
      SELECT id FROM clients WHERE company_id = public.user_company_id()
    )
  );

-- Follow-ups: permitir INSERT quando client_id é NULL
DROP POLICY IF EXISTS follow_ups_isolation ON follow_ups;
CREATE POLICY follow_ups_isolation ON follow_ups
  FOR ALL
  USING (
    client_id IS NULL
    OR client_id IN (
      SELECT id FROM clients WHERE company_id = public.user_company_id()
    )
    OR responsible_id = public.user_internal_id()
  );

-- Tasks: permitir INSERT quando client_id é NULL
DROP POLICY IF EXISTS tasks_isolation ON tasks;
CREATE POLICY tasks_isolation ON tasks
  FOR ALL
  USING (
    client_id IS NULL
    OR client_id IN (
      SELECT id FROM clients WHERE company_id = public.user_company_id()
    )
    OR responsible_id = public.user_internal_id()
  );

-- Calendar events: permitir INSERT quando client_id é NULL
DROP POLICY IF EXISTS calendar_events_isolation ON calendar_events;
CREATE POLICY calendar_events_isolation ON calendar_events
  FOR ALL
  USING (
    client_id IS NULL
    OR client_id IN (
      SELECT id FROM clients WHERE company_id = public.user_company_id()
    )
  );

-- =============================================
-- 2. Novas colunas: prazo de entrega nas vendas
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deals' AND column_name = 'delivery_deadline'
  ) THEN
    ALTER TABLE deals ADD COLUMN delivery_deadline date;
  END IF;
END $$;

-- =============================================
-- 3. Novas colunas: anexo nos pagamentos
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'attachment_url'
  ) THEN
    ALTER TABLE payments ADD COLUMN attachment_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'attachment_name'
  ) THEN
    ALTER TABLE payments ADD COLUMN attachment_name text;
  END IF;
END $$;
