-- Adiciona colunas de entrada, embarque e parcelamento na tabela de deals (vendas)
ALTER TABLE deals ADD COLUMN IF NOT EXISTS entry_value numeric;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS entry_type text;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS shipping_value numeric;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS installments integer;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS installment_value numeric;

-- Adiciona colunas de entrada e embarque na tabela de orders (pedidos)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS entry_value numeric;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS entry_type text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_value numeric;
