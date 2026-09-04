-- Adiciona coluna 'recurrent' na tabela payments para contas recorrentes
ALTER TABLE payments ADD COLUMN IF NOT EXISTS recurrent BOOLEAN DEFAULT false;
