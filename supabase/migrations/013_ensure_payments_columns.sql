-- =============================================
-- RARY CRM — Garantir que todas as colunas da tabela payments existam
-- Migration de segurança: pode ser executada múltiplas vezes sem erro
-- =============================================

-- Coluna: direção (ENTRADA / SAIDA)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'direction'
  ) THEN
    ALTER TABLE payments ADD COLUMN direction text NOT NULL DEFAULT 'ENTRADA' CHECK (direction IN ('ENTRADA','SAIDA'));
  END IF;
END $$;

-- Coluna: nome do fornecedor
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'supplier_name'
  ) THEN
    ALTER TABLE payments ADD COLUMN supplier_name text NOT NULL DEFAULT '';
  END IF;
END $$;

-- Coluna: URL do anexo
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'attachment_url'
  ) THEN
    ALTER TABLE payments ADD COLUMN attachment_url text;
  END IF;
END $$;

-- Coluna: nome do anexo
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'attachment_name'
  ) THEN
    ALTER TABLE payments ADD COLUMN attachment_name text;
  END IF;
END $$;

-- Coluna: recorrência
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'recurrent'
  ) THEN
    ALTER TABLE payments ADD COLUMN recurrent BOOLEAN DEFAULT false;
  END IF;
END $$;
