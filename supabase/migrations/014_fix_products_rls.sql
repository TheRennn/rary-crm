-- =============================================
-- RARY CRM -- Corrigir RLS da tabela products
-- A policies anterior usava auth.uid()::text, mas o user_id na tabela
-- products armazena o ID interno da tabela users (via getUserIdFromUser).
-- Corrigido para usar public.user_internal_id() que retorna o mesmo formato.
-- =============================================

-- Recriar policies de SELECT
DROP POLICY IF EXISTS "Users can view own products" ON products;
CREATE POLICY "Users can view own products" ON products
  FOR SELECT USING (user_id = public.user_internal_id());

-- Recriar policies de INSERT
DROP POLICY IF EXISTS "Users can insert own products" ON products;
CREATE POLICY "Users can insert own products" ON products
  FOR INSERT WITH CHECK (user_id = public.user_internal_id());

-- Recriar policies de UPDATE
DROP POLICY IF EXISTS "Users can update own products" ON products;
CREATE POLICY "Users can update own products" ON products
  FOR UPDATE USING (user_id = public.user_internal_id());

-- Recriar policies de DELETE
DROP POLICY IF EXISTS "Users can delete own products" ON products;
CREATE POLICY "Users can delete own products" ON products
  FOR DELETE USING (user_id = public.user_internal_id());
