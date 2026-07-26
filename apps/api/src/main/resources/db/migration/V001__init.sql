-- Initial base migration
-- Configuração para Row-Level Security
ALTER DATABASE saldu SET "app.subscription_id" TO '';

-- Criar extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
