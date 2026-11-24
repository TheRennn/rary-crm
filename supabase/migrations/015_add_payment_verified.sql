-- Preserve existing account access. Only accounts created after this migration
-- must complete the new email-verification and payment requirements.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS payment_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS access_requirements_enforced boolean NOT NULL DEFAULT false;

-- Verification state can only be changed by trusted server-side code.
REVOKE UPDATE ON TABLE public.users FROM PUBLIC, anon, authenticated;
GRANT UPDATE (name, phone) ON TABLE public.users TO authenticated;

-- OTPs are only read and changed by server routes using the service role.
ALTER TABLE public.verification_tokens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS verification_tokens_service_role ON public.verification_tokens;
REVOKE ALL ON TABLE public.verification_tokens FROM PUBLIC, anon, authenticated;
ALTER TABLE public.verification_tokens
  ADD COLUMN IF NOT EXISTS attempt_count smallint NOT NULL DEFAULT 0;
