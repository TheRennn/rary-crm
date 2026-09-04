-- Fix follow_ups RLS: separate policies for each operation
-- Drop old policies + create new ones per-operation

-- 1. Drop ALL existing policies on follow_ups (old names from 005 + our names)
DROP POLICY IF EXISTS "Authenticated insert follow_ups" ON follow_ups;
DROP POLICY IF EXISTS "Authenticated read follow_ups" ON follow_ups;
DROP POLICY IF EXISTS "Authenticated update follow_ups" ON follow_ups;
DROP POLICY IF EXISTS follow_ups_isolation ON follow_ups;
DROP POLICY IF EXISTS follow_ups_select ON follow_ups;
DROP POLICY IF EXISTS follow_ups_insert ON follow_ups;
DROP POLICY IF EXISTS follow_ups_update ON follow_ups;
DROP POLICY IF EXISTS follow_ups_delete ON follow_ups;

-- 2. Verify RLS is enabled
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;

-- 3. Create separate policies for each operation

-- SELECT: user can read follow-ups for company clients or where they are responsible
CREATE POLICY follow_ups_select ON follow_ups
  FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients WHERE company_id = public.user_company_id()
    )
    OR responsible_id = public.user_internal_id()
  );

-- INSERT: user can insert if they set themselves as responsible
CREATE POLICY follow_ups_insert ON follow_ups
  FOR INSERT
  WITH CHECK (
    responsible_id = public.user_internal_id()
  );

-- UPDATE: user can update follow-ups they can see
CREATE POLICY follow_ups_update ON follow_ups
  FOR UPDATE
  USING (
    client_id IN (
      SELECT id FROM clients WHERE company_id = public.user_company_id()
    )
    OR responsible_id = public.user_internal_id()
  )
  WITH CHECK (
    client_id IN (
      SELECT id FROM clients WHERE company_id = public.user_company_id()
    )
    OR responsible_id = public.user_internal_id()
  );

-- DELETE: user can delete follow-ups they can see
CREATE POLICY follow_ups_delete ON follow_ups
  FOR DELETE
  USING (
    client_id IN (
      SELECT id FROM clients WHERE company_id = public.user_company_id()
    )
    OR responsible_id = public.user_internal_id()
  );
