-- Manual access approval for new CRM registrations.
-- Keep existing paid accounts available while moving new accounts to pending.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS access_status text NOT NULL DEFAULT 'Aguardando';

UPDATE public.users
SET access_status = 'Liberado'
WHERE access_requirements_enforced = false
   OR (payment_verified = true AND access_expires_at > now());

ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_access_status_check;

ALTER TABLE public.users
  ADD CONSTRAINT users_access_status_check
  CHECK (access_status IN ('Aguardando', 'Liberado'));

COMMENT ON COLUMN public.users.access_status IS
  'Manual CRM access approval. Set to Liberado in Supabase to allow dashboard access.';
