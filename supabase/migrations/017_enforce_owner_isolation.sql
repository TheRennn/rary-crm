-- Isola cada registro pela empresa relacionada ou pelo usuário que o criou.
-- Também corrige a exclusão de clientes: dependências vinculadas impedem a exclusão
-- e o erro é devolvido à interface em vez de produzir sucesso visual falso.

ALTER TABLE deals ADD COLUMN IF NOT EXISTS owner_user_id text;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS owner_user_id text;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS owner_user_id text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS owner_user_id text;
ALTER TABLE follow_ups ADD COLUMN IF NOT EXISTS owner_user_id text;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS owner_user_id text;
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS owner_user_id text;
ALTER TABLE recebimentos ADD COLUMN IF NOT EXISTS owner_user_id text;

CREATE INDEX IF NOT EXISTS idx_deals_owner ON deals(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_owner ON purchases(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_payments_owner ON payments(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_orders_owner ON orders(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_owner ON follow_ups(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_owner ON tasks(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_owner ON calendar_events(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_recebimentos_owner ON recebimentos(owner_user_id);

CREATE OR REPLACE FUNCTION public.user_owns_client(p_client_id text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.clients
    WHERE id = p_client_id AND company_id = public.user_company_id()
  );
$$;

-- Clientes são compartilhados somente dentro da empresa autenticada.
DROP POLICY IF EXISTS clients_isolation ON clients;
CREATE POLICY clients_isolation ON clients FOR ALL
  USING (company_id = public.user_company_id())
  WITH CHECK (company_id = public.user_company_id());

-- Entidades vinculadas a um cliente herdam o isolamento da empresa; registros
-- sem cliente ficam privados ao usuário que os criou.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['deals','purchases','payments','orders','follow_ups','tasks','calendar_events','recebimentos'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_isolation', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL USING (owner_user_id = public.user_internal_id() OR public.user_owns_client(client_id)) WITH CHECK (owner_user_id = public.user_internal_id() OR public.user_owns_client(client_id))',
      t || '_isolation', t
    );
  END LOOP;
END $$;

-- Policies explícitas de escrita para os registros pessoais já existentes.
DROP POLICY IF EXISTS commissions_isolation ON commissions;
CREATE POLICY commissions_isolation ON commissions FOR ALL
  USING (user_id = public.user_internal_id())
  WITH CHECK (user_id = public.user_internal_id());
DROP POLICY IF EXISTS goals_isolation ON goals;
CREATE POLICY goals_isolation ON goals FOR ALL
  USING (user_id = public.user_internal_id())
  WITH CHECK (user_id = public.user_internal_id());
DROP POLICY IF EXISTS notifications_isolation ON notifications;
CREATE POLICY notifications_isolation ON notifications FOR ALL
  USING (user_id = public.user_internal_id())
  WITH CHECK (user_id = public.user_internal_id());
DROP POLICY IF EXISTS activities_isolation ON activities;
CREATE POLICY activities_isolation ON activities FOR ALL
  USING (user_id = public.user_internal_id())
  WITH CHECK (user_id = public.user_internal_id());

