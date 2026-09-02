-- =============================================
-- RARY CRM — Novos campos: fornecedor, forma pgto, entradas/saídas
-- Migration segura: nao deleta nada, so adiciona
-- =============================================

-- =============================================
-- 1. Clientes: adicionar campo kind (CLIENTE / FORNECEDOR)
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'kind'
  ) THEN
    ALTER TABLE clients ADD COLUMN kind text NOT NULL DEFAULT 'CLIENTE' CHECK (kind IN ('CLIENTE','FORNECEDOR'));
  END IF;
END $$;

-- =============================================
-- 2. Deals: adicionar forma de pagamento
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deals' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE deals ADD COLUMN payment_method text NOT NULL DEFAULT '';
  END IF;
END $$;

-- =============================================
-- 3. Payments: adicionar direcao (ENTRADA / SAIDA)
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'direction'
  ) THEN
    ALTER TABLE payments ADD COLUMN direction text NOT NULL DEFAULT 'ENTRADA' CHECK (direction IN ('ENTRADA','SAIDA'));
  END IF;
END $$;

-- =============================================
-- 4. Payments: adicionar campo de fornecedor (quando for SAIDA)
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'supplier_name'
  ) THEN
    ALTER TABLE payments ADD COLUMN supplier_name text NOT NULL DEFAULT '';
  END IF;
END $$;
