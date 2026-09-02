-- Adiciona coluna one_month_delay na tabela commissions
-- Permite que representantes recebam com 1 mês de atraso

ALTER TABLE commissions ADD COLUMN IF NOT EXISTS one_month_delay boolean DEFAULT false;
