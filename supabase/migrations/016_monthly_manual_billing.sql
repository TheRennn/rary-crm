-- Move new signups from a one-time payment flag to paid monthly access periods.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS access_expires_at timestamptz;

-- Give previously paid accounts one transition month instead of cutting them off.
UPDATE public.users
SET access_expires_at = now() + interval '1 month'
WHERE access_requirements_enforced = true
  AND payment_verified = true
  AND access_expires_at IS NULL;

CREATE TABLE IF NOT EXISTS public.subscription_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  amount_cents integer NOT NULL CHECK (amount_cents > 0),
  status text NOT NULL DEFAULT 'creating'
    CHECK (status IN ('creating', 'pending', 'paid', 'failed', 'expired', 'refunded')),
  provider_order_code text NOT NULL UNIQUE,
  payment_link_id text,
  payment_url text,
  provider_charge_id text UNIQUE,
  due_at timestamptz NOT NULL,
  paid_at timestamptz,
  period_start timestamptz,
  period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscription_invoices_user_created
  ON public.subscription_invoices (auth_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_subscription_invoices_due
  ON public.subscription_invoices (due_at)
  WHERE status IN ('creating', 'pending');

ALTER TABLE public.subscription_invoices ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.subscription_invoices FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.subscription_invoices TO service_role;

CREATE OR REPLACE FUNCTION public.create_or_reuse_subscription_invoice(
  p_auth_id uuid,
  p_email text,
  p_amount_cents integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user public.users%ROWTYPE;
  v_invoice public.subscription_invoices%ROWTYPE;
  v_invoice_id uuid;
BEGIN
  IF p_amount_cents <> 4990 THEN
    RAISE EXCEPTION 'Invalid subscription amount';
  END IF;

  SELECT *
  INTO v_user
  FROM public.users
  WHERE auth_id = p_auth_id
  FOR UPDATE;

  IF NOT FOUND
    OR lower(v_user.email) <> lower(p_email)
    OR v_user.access_requirements_enforced IS DISTINCT FROM true
    OR v_user.email_verified IS DISTINCT FROM true
  THEN
    RAISE EXCEPTION 'Account is not eligible for subscription billing';
  END IF;

  UPDATE public.subscription_invoices
  SET status = 'expired', updated_at = now()
  WHERE auth_id = p_auth_id
    AND status IN ('creating', 'pending')
    AND due_at <= now();

  UPDATE public.subscription_invoices
  SET status = 'failed', updated_at = now()
  WHERE auth_id = p_auth_id
    AND status = 'creating'
    AND created_at <= now() - interval '5 minutes';

  SELECT *
  INTO v_invoice
  FROM public.subscription_invoices
  WHERE auth_id = p_auth_id
    AND status IN ('creating', 'pending')
    AND due_at > now()
  ORDER BY created_at DESC
  LIMIT 1
  FOR UPDATE;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'invoice_id', v_invoice.id,
      'status', v_invoice.status,
      'payment_url', v_invoice.payment_url,
      'due_at', v_invoice.due_at,
      'created', false,
      'access_expires_at', v_user.access_expires_at
    );
  END IF;

  v_invoice_id := gen_random_uuid();

  INSERT INTO public.subscription_invoices (
    id,
    auth_id,
    email,
    amount_cents,
    provider_order_code,
    due_at
  )
  VALUES (
    v_invoice_id,
    p_auth_id,
    lower(p_email),
    p_amount_cents,
    v_invoice_id::text,
    now() + interval '5 days'
  )
  RETURNING * INTO v_invoice;

  RETURN jsonb_build_object(
    'invoice_id', v_invoice.id,
    'status', v_invoice.status,
    'payment_url', v_invoice.payment_url,
    'due_at', v_invoice.due_at,
    'created', true,
    'access_expires_at', v_user.access_expires_at
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.confirm_subscription_invoice_payment(
  p_order_code text,
  p_amount_cents integer,
  p_charge_id text,
  p_customer_email text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_invoice public.subscription_invoices%ROWTYPE;
  v_user public.users%ROWTYPE;
  v_paid_at timestamptz := now();
  v_period_start timestamptz;
  v_period_end timestamptz;
BEGIN
  SELECT *
  INTO v_invoice
  FROM public.subscription_invoices
  WHERE provider_order_code = p_order_code;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invoice_not_found');
  END IF;

  SELECT *
  INTO v_user
  FROM public.users
  WHERE auth_id = v_invoice.auth_id
  FOR UPDATE;

  SELECT *
  INTO v_invoice
  FROM public.subscription_invoices
  WHERE provider_order_code = p_order_code
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invoice_not_found');
  END IF;

  IF p_amount_cents IS DISTINCT FROM v_invoice.amount_cents
    OR lower(coalesce(p_customer_email, '')) <> lower(v_invoice.email)
  THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'payment_mismatch');
  END IF;

  IF v_invoice.status = 'paid' THEN
    RETURN jsonb_build_object(
      'ok', true,
      'duplicate', true,
      'access_expires_at', v_invoice.period_end
    );
  END IF;

  IF v_invoice.status <> 'pending'
    OR p_charge_id IS NULL
    OR p_charge_id = ''
  THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invoice_not_payable');
  END IF;

  IF v_user.auth_id IS NULL
    OR v_user.access_requirements_enforced IS DISTINCT FROM true
    OR v_user.email_verified IS DISTINCT FROM true
    OR lower(v_user.email) <> lower(v_invoice.email)
  THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'account_not_eligible');
  END IF;

  v_period_start := greatest(v_paid_at, coalesce(v_user.access_expires_at, v_paid_at));
  v_period_end := v_period_start + interval '1 month';

  UPDATE public.subscription_invoices
  SET status = 'paid',
      provider_charge_id = p_charge_id,
      paid_at = v_paid_at,
      period_start = v_period_start,
      period_end = v_period_end,
      updated_at = now()
  WHERE id = v_invoice.id;

  UPDATE public.users
  SET payment_verified = true,
      access_expires_at = v_period_end
  WHERE auth_id = v_invoice.auth_id;

  RETURN jsonb_build_object(
    'ok', true,
    'duplicate', false,
    'access_expires_at', v_period_end
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.fail_subscription_invoice_payment(
  p_order_code text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_invoice public.subscription_invoices%ROWTYPE;
BEGIN
  SELECT *
  INTO v_invoice
  FROM public.subscription_invoices
  WHERE provider_order_code = p_order_code
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invoice_not_found');
  END IF;

  IF v_invoice.status = 'paid' THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invoice_already_paid');
  END IF;

  UPDATE public.subscription_invoices
  SET status = 'failed', updated_at = now()
  WHERE id = v_invoice.id
    AND status IN ('creating', 'pending');

  RETURN jsonb_build_object('ok', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.refund_subscription_invoice_payment(
  p_order_code text,
  p_charge_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_invoice public.subscription_invoices%ROWTYPE;
  v_paid_invoice public.subscription_invoices%ROWTYPE;
  v_user public.users%ROWTYPE;
  v_period_start timestamptz;
  v_period_end timestamptz;
  v_access_expires_at timestamptz;
BEGIN
  SELECT *
  INTO v_invoice
  FROM public.subscription_invoices
  WHERE provider_order_code = p_order_code;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invoice_not_found');
  END IF;

  SELECT *
  INTO v_user
  FROM public.users
  WHERE auth_id = v_invoice.auth_id
  FOR UPDATE;

  IF v_user.auth_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'account_not_found');
  END IF;

  SELECT *
  INTO v_invoice
  FROM public.subscription_invoices
  WHERE provider_order_code = p_order_code
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invoice_not_found');
  END IF;

  IF v_invoice.status = 'refunded' THEN
    RETURN jsonb_build_object('ok', true, 'duplicate', true);
  END IF;

  IF v_invoice.status <> 'paid'
    OR v_invoice.provider_charge_id IS DISTINCT FROM p_charge_id
  THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'payment_mismatch');
  END IF;

  UPDATE public.subscription_invoices
  SET status = 'refunded', updated_at = now()
  WHERE id = v_invoice.id;

  v_access_expires_at := NULL;

  FOR v_paid_invoice IN
    SELECT *
    FROM public.subscription_invoices
    WHERE auth_id = v_invoice.auth_id
      AND status = 'paid'
    ORDER BY paid_at, created_at
    FOR UPDATE
  LOOP
    v_period_start := greatest(
      v_paid_invoice.paid_at,
      coalesce(v_access_expires_at, v_paid_invoice.paid_at)
    );
    v_period_end := v_period_start + interval '1 month';

    UPDATE public.subscription_invoices
    SET period_start = v_period_start,
        period_end = v_period_end,
        updated_at = now()
    WHERE id = v_paid_invoice.id;

    v_access_expires_at := v_period_end;
  END LOOP;

  UPDATE public.users
  SET access_expires_at = v_access_expires_at,
      payment_verified = coalesce(v_access_expires_at > now(), false)
  WHERE auth_id = v_invoice.auth_id;

  RETURN jsonb_build_object(
    'ok', true,
    'duplicate', false,
    'access_expires_at', v_access_expires_at
  );
END;
$$;

REVOKE ALL ON FUNCTION public.create_or_reuse_subscription_invoice(uuid, text, integer)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.confirm_subscription_invoice_payment(text, integer, text, text)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fail_subscription_invoice_payment(text)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.refund_subscription_invoice_payment(text, text)
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.create_or_reuse_subscription_invoice(uuid, text, integer)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.confirm_subscription_invoice_payment(text, integer, text, text)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.fail_subscription_invoice_payment(text)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.refund_subscription_invoice_payment(text, text)
  TO service_role;
