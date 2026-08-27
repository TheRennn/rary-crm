-- =============================================
-- RARY CRM — Adicionar coluna de verificação de e-mail
-- Execute este SQL no SQL Editor do Supabase
-- =============================================

-- Adicionar coluna email_verified na tabela users
ALTER TABLE users ADD COLUMN email_verified boolean NOT NULL DEFAULT false;

-- Atualizar usuários existentes que já têm e-mail confirmado no Supabase Auth
UPDATE users u
SET email_verified = true
FROM auth.users au
WHERE u.auth_id = au.id AND au.email_confirmed_at IS NOT NULL;
